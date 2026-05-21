import { MetaConnectionDB } from '@/core/meta/db/meta-connection.db'
import { fetchMetaAccountOverview, fetchMetaAdInsights, fetchMetaCampaignInsights, shouldMarkMetaConnectionForReconnect } from '@/core/meta/meta-api.server'
import { toPublicMetaConnection } from '@/core/meta/meta-presenters.server'

import { trackError } from '@lib/functions/_track_error.function'
import type {
  IMetaAccountOverview,
  IMetaAdInsight,
  IMetaCampaignInsight,
  IMetaConnectionPublic,
  IMetaPresetKpi,
  IMetaPresetResult,
  IMetaPresetTable,
  IMetaServiceResponse,
  MetaPresetId
} from '@lib/interfaces'
import { decryptToken } from '@lib/token-crypto'

interface Payload {
  user_id: string
  preset_id: MetaPresetId
  since: string
  until: string
}

interface ResponseData {
  connection: IMetaConnectionPublic
  preset: IMetaPresetResult
}

type Response = IMetaServiceResponse<ResponseData>

interface MetaServiceError {
  status: number
  code: number | null
  message: string
}

const formatNumber = (value: number): string => {
  return Math.round(value).toLocaleString('es-CO')
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`
}

const formatCurrency = (value: number, currency: string | null): string => {
  const normalizedCurrency = typeof currency === 'string' && currency.trim().length > 0 ? currency.trim() : 'USD'

  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: 0
    }).format(value)
  } catch {
    return `$${formatNumber(value)}`
  }
}

const sumSpend = (rows: IMetaCampaignInsight[]): number => {
  return rows.reduce((acc, row) => acc + row.spend, 0)
}

const averageSpend = (rows: IMetaCampaignInsight[]): number => {
  if (rows.length === 0) {
    return 0
  }

  return sumSpend(rows) / rows.length
}

const mapCampaignTableRows = (rows: IMetaCampaignInsight[]): Array<Record<string, string>> => {
  return rows.map((row) => ({
    campana: row.campaign_name,
    gasto: formatNumber(row.spend),
    ctr: formatPercent(row.ctr),
    compras: formatNumber(row.purchases),
    leads: formatNumber(row.leads)
  }))
}

const mapAdsTableRows = (rows: IMetaAdInsight[]): Array<Record<string, string>> => {
  return rows.map((row) => ({
    anuncio: row.ad_name,
    gasto: formatNumber(row.spend),
    ctr: formatPercent(row.ctr),
    compras: formatNumber(row.purchases),
    leads: formatNumber(row.leads)
  }))
}

const createBaseKpis = (overview: IMetaAccountOverview): IMetaPresetKpi[] => {
  return [
    {
      label: 'Gasto total',
      value: formatCurrency(overview.spend, overview.account_currency)
    },
    {
      label: 'CTR',
      value: formatPercent(overview.ctr)
    },
    {
      label: 'CPC',
      value: overview.cpc === null ? 'N/D' : formatCurrency(overview.cpc, overview.account_currency)
    },
    {
      label: 'Conversiones',
      value: formatNumber(overview.purchases + overview.leads),
      hint: `${formatNumber(overview.purchases)} compras | ${formatNumber(overview.leads)} leads`
    }
  ]
}

const buildSpendReportPreset = (overview: IMetaAccountOverview, campaigns: IMetaCampaignInsight[]): IMetaPresetResult => {
  const topCampaigns = campaigns.slice(0, 8)
  const tables: IMetaPresetTable[] = topCampaigns.length
    ? [
        {
          title: 'Campanas por gasto',
          columns: ['campana', 'gasto', 'ctr', 'compras', 'leads'],
          rows: mapCampaignTableRows(topCampaigns)
        }
      ]
    : []

  return {
    preset_id: 'spend_report',
    title: 'Reporte de gasto por rango',
    summary: `Entre ${overview.since} y ${overview.until} se ejecutaron ${formatCurrency(overview.spend, overview.account_currency)} con ${formatNumber(overview.clicks)} clics y ${formatNumber(overview.purchases + overview.leads)} conversiones totales.`,
    kpis: createBaseKpis(overview),
    alerts: [],
    recommendations: [
      'Revisa campanas con gasto alto y conversiones bajas para decidir recorte de presupuesto.',
      'Mantener frecuencia diaria de revision en ventanas de 7 y 30 dias para evitar sesgos de corto plazo.'
    ],
    tables,
    generated_at: new Date().toISOString()
  }
}

const buildTopCreativesPreset = (overview: IMetaAccountOverview, ads: IMetaAdInsight[]): IMetaPresetResult => {
  const rankedAds = [...ads]
    .filter((item) => item.impressions >= 500)
    .sort((a, b) => {
      const convA = a.purchases + a.leads
      const convB = b.purchases + b.leads
      if (convB !== convA) {
        return convB - convA
      }
      return b.ctr - a.ctr
    })
    .slice(0, 10)

  const alerts = rankedAds.length === 0 ? ['No se encontraron anuncios con volumen suficiente para ranking.'] : []

  return {
    preset_id: 'top_creatives',
    title: 'Mejores creativos para escalar',
    summary:
      rankedAds.length > 0
        ? `Se detectaron ${rankedAds.length} anuncios con mejor combinacion de conversion y CTR para este rango.`
        : 'No hay suficientes datos de anuncios para recomendar creativos a escalar en este rango.',
    kpis: [
      ...createBaseKpis(overview),
      {
        label: 'Creativos rankeados',
        value: formatNumber(rankedAds.length)
      }
    ],
    alerts,
    recommendations: [
      'Escalar gradualmente los 3 mejores creativos manteniendo control de CPA.',
      'Duplicar angulos ganadores en variantes de apertura y CTA para mantener learning activo.'
    ],
    tables:
      rankedAds.length > 0
        ? [
            {
              title: 'Top creativos',
              columns: ['anuncio', 'gasto', 'ctr', 'compras', 'leads'],
              rows: mapAdsTableRows(rankedAds)
            }
          ]
        : [],
    generated_at: new Date().toISOString()
  }
}

const buildBudgetLeakagePreset = (overview: IMetaAccountOverview, campaigns: IMetaCampaignInsight[]): IMetaPresetResult => {
  const avgSpend = averageSpend(campaigns)
  const ctrThreshold = Math.max(0.6, overview.ctr * 0.65)

  const leakageCampaigns = campaigns
    .filter((campaign) => campaign.spend > 0)
    .filter((campaign) => campaign.purchases + campaign.leads === 0 || (campaign.ctr < ctrThreshold && campaign.spend >= avgSpend))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 12)

  const totalLeakageSpend = leakageCampaigns.reduce((sum, item) => sum + item.spend, 0)

  return {
    preset_id: 'budget_leakage',
    title: 'Fuga de presupuesto',
    summary:
      leakageCampaigns.length > 0
        ? `Se identificaron ${leakageCampaigns.length} campanas con señales de fuga por ${formatCurrency(totalLeakageSpend, overview.account_currency)}.`
        : 'No se detectaron fugas claras de presupuesto para este periodo.',
    kpis: [
      ...createBaseKpis(overview),
      {
        label: 'Gasto con fuga',
        value: formatCurrency(totalLeakageSpend, overview.account_currency)
      }
    ],
    alerts:
      leakageCampaigns.length > 0
        ? ['Hay campanas consumiendo presupuesto sin resultados consistentes.']
        : ['No hay alertas de fuga relevantes en este rango.'],
    recommendations: [
      'Reducir presupuesto en campanas con cero conversion y CTR por debajo del baseline.',
      'Mover presupuesto hacia campanas con CTR superior al promedio y conversion activa.'
    ],
    tables:
      leakageCampaigns.length > 0
        ? [
            {
              title: 'Campanas con fuga',
              columns: ['campana', 'gasto', 'ctr', 'compras', 'leads'],
              rows: mapCampaignTableRows(leakageCampaigns)
            }
          ]
        : [],
    generated_at: new Date().toISOString()
  }
}

const buildPerformancePreset = (overview: IMetaAccountOverview, campaigns: IMetaCampaignInsight[]): IMetaPresetResult => {
  const topCampaigns = [...campaigns].sort((a, b) => b.spend - a.spend).slice(0, 10)

  return {
    preset_id: 'performance_by_product_or_account',
    title: 'Rendimiento por producto o cuenta',
    summary: `Vista consolidada de rendimiento de cuenta con foco en ${topCampaigns.length} campanas de mayor inversion.`,
    kpis: createBaseKpis(overview),
    alerts: [],
    recommendations: [
      'Cruzar esta vista con etiquetas internas de producto para separar catalogo ganador vs catalogo drenante.',
      'Monitorear desviaciones de CTR y CPA en campanas de mayor peso presupuestal.'
    ],
    tables:
      topCampaigns.length > 0
        ? [
            {
              title: 'Top campanas por gasto',
              columns: ['campana', 'gasto', 'ctr', 'compras', 'leads'],
              rows: mapCampaignTableRows(topCampaigns)
            }
          ]
        : [],
    generated_at: new Date().toISOString()
  }
}

const buildPauseTodayPreset = (overview: IMetaAccountOverview, campaigns: IMetaCampaignInsight[]): IMetaPresetResult => {
  const ctrThreshold = Math.max(0.6, overview.ctr * 0.7)
  const pauseCandidates = campaigns
    .filter((campaign) => campaign.spend > 0)
    .filter((campaign) => campaign.purchases + campaign.leads === 0 && campaign.ctr < ctrThreshold)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8)

  return {
    preset_id: 'pause_today',
    title: 'Que pausar hoy',
    summary:
      pauseCandidates.length > 0
        ? `Se marcaron ${pauseCandidates.length} campanas candidatas a pausa inmediata por bajo rendimiento.`
        : 'No hay campanas con señales fuertes de pausa inmediata en este corte.',
    kpis: createBaseKpis(overview),
    alerts: pauseCandidates.length > 0 ? ['Prioriza pausa o recorte de los candidatos con mayor gasto.'] : [],
    recommendations: [
      'Pausar primero las campanas con cero conversion y CTR persistentemente bajo.',
      'Reasignar presupuesto hacia campanas con conversion y CTR por encima del baseline.'
    ],
    tables:
      pauseCandidates.length > 0
        ? [
            {
              title: 'Candidatas para pausar',
              columns: ['campana', 'gasto', 'ctr', 'compras', 'leads'],
              rows: mapCampaignTableRows(pauseCandidates)
            }
          ]
        : [],
    generated_at: new Date().toISOString()
  }
}

const buildCreativeFatiguePreset = (overview: IMetaAccountOverview, ads: IMetaAdInsight[]): IMetaPresetResult => {
  const ctrThreshold = Math.max(0.5, overview.ctr * 0.65)
  const fatigueCandidates = ads
    .filter((ad) => ad.impressions >= 3000)
    .filter((ad) => ad.ctr < ctrThreshold)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10)

  return {
    preset_id: 'creative_fatigue',
    title: 'Creativos fatigados o frecuencia alta',
    summary:
      fatigueCandidates.length > 0
        ? `Se detectaron ${fatigueCandidates.length} anuncios con sintomas de fatiga por volumen alto y CTR deprimido.`
        : 'No hay evidencia fuerte de fatiga creativa en este rango.',
    kpis: [
      ...createBaseKpis(overview),
      {
        label: 'Creativos fatigados',
        value: formatNumber(fatigueCandidates.length)
      }
    ],
    alerts: fatigueCandidates.length > 0 ? ['Renovar hooks y primeras escenas de los anuncios fatigados.'] : [],
    recommendations: [
      'Rotar piezas con peor CTR relativo y probar 2-3 variantes nuevas por angulo.',
      'Separar testing de escalado para evitar saturar anuncios de alto volumen.'
    ],
    tables:
      fatigueCandidates.length > 0
        ? [
            {
              title: 'Anuncios con posible fatiga',
              columns: ['anuncio', 'gasto', 'ctr', 'compras', 'leads'],
              rows: mapAdsTableRows(fatigueCandidates)
            }
          ]
        : [],
    generated_at: new Date().toISOString()
  }
}

const buildOpportunitiesPreset = (overview: IMetaAccountOverview, campaigns: IMetaCampaignInsight[]): IMetaPresetResult => {
  const avgSpend = averageSpend(campaigns)
  const opportunities = campaigns
    .filter((campaign) => campaign.ctr >= overview.ctr)
    .filter((campaign) => campaign.spend < avgSpend)
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 10)

  return {
    preset_id: 'opportunities_breakdown',
    title: 'Oportunidades por pais, placement o audiencia',
    summary:
      opportunities.length > 0
        ? `Hay ${opportunities.length} campanas con buen CTR y espacio de inversion para crecer.`
        : 'No se detectaron oportunidades claras con el criterio actual.',
    kpis: createBaseKpis(overview),
    alerts: opportunities.length > 0 ? ['Aumentar presupuesto gradualmente en campanas oportunidad y monitorear CPA.'] : [],
    recommendations: [
      'Abrir breakdowns por placement y pais en las campanas con mejor CTR para detectar pockets de escala.',
      'Escalar en pasos de 15-20% diarios manteniendo guardrails de CPA.'
    ],
    tables:
      opportunities.length > 0
        ? [
            {
              title: 'Campanas con oportunidad de escala',
              columns: ['campana', 'gasto', 'ctr', 'compras', 'leads'],
              rows: mapCampaignTableRows(opportunities)
            }
          ]
        : [],
    generated_at: new Date().toISOString()
  }
}

const buildStructurePreset = (overview: IMetaAccountOverview, campaigns: IMetaCampaignInsight[]): IMetaPresetResult => {
  const totalConversions = overview.purchases + overview.leads
  const avgCtr = overview.ctr
  const hasConversionSignal = totalConversions > 0
  const campaignCount = campaigns.length

  const recommendations = [
    hasConversionSignal
      ? 'Mantener estructura de 3 capas: testing (20%), scaling (60%), retargeting (20%).'
      : 'Consolidar primero una capa fuerte de testing antes de escalar presupuesto.',
    avgCtr >= 1
      ? 'Duplicar solo angulos con CTR superior al baseline y conversion validada.'
      : 'Priorizar mejora de hook y promesa antes de abrir mas ad sets.',
    'Definir reglas de corte diario: pausar cuando no haya conversion tras umbral de gasto por objetivo.'
  ]

  return {
    preset_id: 'campaign_structure_recommendation',
    title: 'Estructura de campana recomendada',
    summary: `Propuesta de estructura basada en ${campaignCount} campanas activas del periodo y ${formatNumber(totalConversions)} conversiones detectadas.`,
    kpis: [
      ...createBaseKpis(overview),
      {
        label: 'Campanas analizadas',
        value: formatNumber(campaignCount)
      }
    ],
    alerts: [],
    recommendations,
    tables: [],
    generated_at: new Date().toISOString()
  }
}

const buildPreset = (params: {
  presetId: MetaPresetId
  overview: IMetaAccountOverview
  campaigns: IMetaCampaignInsight[]
  ads: IMetaAdInsight[]
}): IMetaPresetResult => {
  const { presetId, overview, campaigns, ads } = params

  switch (presetId) {
    case 'spend_report':
      return buildSpendReportPreset(overview, campaigns)
    case 'top_creatives':
      return buildTopCreativesPreset(overview, ads)
    case 'budget_leakage':
      return buildBudgetLeakagePreset(overview, campaigns)
    case 'performance_by_product_or_account':
      return buildPerformancePreset(overview, campaigns)
    case 'pause_today':
      return buildPauseTodayPreset(overview, campaigns)
    case 'creative_fatigue':
      return buildCreativeFatiguePreset(overview, ads)
    case 'opportunities_breakdown':
      return buildOpportunitiesPreset(overview, campaigns)
    case 'campaign_structure_recommendation':
      return buildStructurePreset(overview, campaigns)
    default:
      return buildSpendReportPreset(overview, campaigns)
  }
}

export class CLS_RunMetaPreset {
  constructor(private readonly _payload: Payload) {}

  private async _failFromMetaError(error: MetaServiceError): Promise<Response> {
    const nextStatus: 'ACTIVE' | 'RECONNECT_REQUIRED' = shouldMarkMetaConnectionForReconnect({
      ok: false,
      status: error.status,
      code: error.code,
      subcode: null,
      type: null,
      message: error.message
    })
      ? 'RECONNECT_REQUIRED'
      : 'ACTIVE'

    await MetaConnectionDB.updateValidationState({
      user_id: this._payload.user_id,
      status: nextStatus,
      last_error: error.message
    })

    return {
      error: true,
      message: error.message
    }
  }

  public async main(): Promise<Response> {
    try {
      const connection = await MetaConnectionDB.findByUserId(this._payload.user_id)
      if (!connection) {
        return { error: true, message: 'Primero debes conectar una cuenta de Meta.' }
      }

      const accessToken = decryptToken(connection.encrypted_access_token)
      const overviewResult = await fetchMetaAccountOverview({
        accessToken,
        adAccountId: connection.ad_account_id,
        since: this._payload.since,
        until: this._payload.until
      })

      if (!overviewResult.ok) {
        return this._failFromMetaError(overviewResult)
      }

      const needsCampaignInsights = [
        'spend_report',
        'budget_leakage',
        'performance_by_product_or_account',
        'pause_today',
        'opportunities_breakdown',
        'campaign_structure_recommendation'
      ].includes(this._payload.preset_id)

      const needsAdInsights = ['top_creatives', 'creative_fatigue'].includes(this._payload.preset_id)

      let campaignInsights: IMetaCampaignInsight[] = []
      if (needsCampaignInsights) {
        const campaignResult = await fetchMetaCampaignInsights({
          accessToken,
          adAccountId: connection.ad_account_id,
          since: this._payload.since,
          until: this._payload.until,
          limit: 80
        })

        if (!campaignResult.ok) {
          return this._failFromMetaError(campaignResult)
        }

        campaignInsights = campaignResult.insights
      }

      let adInsights: IMetaAdInsight[] = []
      if (needsAdInsights) {
        const adResult = await fetchMetaAdInsights({
          accessToken,
          adAccountId: connection.ad_account_id,
          since: this._payload.since,
          until: this._payload.until,
          limit: 120
        })

        if (!adResult.ok) {
          return this._failFromMetaError(adResult)
        }

        adInsights = adResult.insights
      }

      const updatedConnection =
        (await MetaConnectionDB.updateValidationState({
          user_id: this._payload.user_id,
          status: 'ACTIVE',
          last_error: null,
          last_validated_at: new Date()
        })) ?? connection

      const preset = buildPreset({
        presetId: this._payload.preset_id,
        overview: {
          ...overviewResult.overview,
          account_name: overviewResult.overview.account_name ?? updatedConnection.account_name,
          account_currency: overviewResult.overview.account_currency ?? updatedConnection.account_currency
        },
        campaigns: campaignInsights,
        ads: adInsights
      })

      return {
        data: {
          connection: toPublicMetaConnection(updatedConnection),
          preset
        }
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_RunMetaPreset.main',
        controller: 'meta',
        additionalContext: {
          user_id: this._payload.user_id,
          preset_id: this._payload.preset_id,
          since: this._payload.since,
          until: this._payload.until
        }
      })

      return { error: true, message: 'No se pudo ejecutar el preset de Meta.' }
    }
  }
}
