import { trackError } from '@lib/functions/_track_error.function'
import type { IMetaAccountOverview, IMetaAdInsight, IMetaCampaignInsight, IMetaValidatedAccount } from '@lib/interfaces'

const META_GRAPH_VERSION = 'v25.0'
const META_GRAPH_API_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`
const META_RECONNECT_ERROR_CODES = new Set([10, 190, 200, 2500])
const PURCHASE_ACTION_TYPES = ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase']
const LEAD_ACTION_TYPES = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead']

interface MetaGraphErrorShape {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
}

interface MetaGraphResultError {
  ok: false
  status: number
  message: string
  type: string | null
  code: number | null
  subcode: number | null
}

interface MetaGraphResultSuccess<T> {
  ok: true
  data: T
}

type MetaGraphResult<T> = MetaGraphResultSuccess<T> | MetaGraphResultError

interface MetaAdAccountResponse {
  id: string
  account_id?: string
  name?: string
  currency?: string
  timezone_name?: string
  timezone_offset_hours_utc?: number
  timezone_offset_hours?: number
}

interface MetaInsightActionRow {
  action_type?: string
  value?: string | number
}

interface MetaInsightRow {
  account_id?: string
  account_name?: string
  campaign_id?: string
  campaign_name?: string
  ad_id?: string
  ad_name?: string
  spend?: string | number
  impressions?: string | number
  reach?: string | number
  clicks?: string | number
  ctr?: string | number
  cpc?: string | number
  cpm?: string | number
  date_start?: string
  date_stop?: string
  actions?: MetaInsightActionRow[]
  cost_per_action_type?: MetaInsightActionRow[]
}

interface MetaInsightsResponse {
  data?: MetaInsightRow[]
}

const normalizeMetaMessage = (payload: MetaGraphErrorShape | null, fallbackStatus: number): string => {
  const message = payload?.error?.message?.trim()
  if (message && message.length > 0) {
    return message
  }

  if (fallbackStatus === 401 || fallbackStatus === 403) {
    return 'Meta rechazó la credencial o el acceso a la cuenta publicitaria.'
  }

  return 'No se pudo completar la consulta con Meta.'
}

const parseNumeric = (value: string | number | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const sumActionValues = (rows: MetaInsightActionRow[] | undefined, types: string[]): number => {
  if (!rows) {
    return 0
  }

  return rows.reduce((total, row) => {
    const actionType = row.action_type ?? ''
    if (!types.includes(actionType)) {
      return total
    }

    return total + parseNumeric(row.value)
  }, 0)
}

const firstMatchingCost = (rows: MetaInsightActionRow[] | undefined, types: string[]): number | null => {
  if (!rows) {
    return null
  }

  const match = rows.find((row) => types.includes(row.action_type ?? ''))
  if (!match) {
    return null
  }

  const value = parseNumeric(match.value)
  return value > 0 ? value : null
}

const collectRawActions = (rows: MetaInsightActionRow[] | undefined): Record<string, number> => {
  if (!rows) {
    return {}
  }

  return rows.reduce<Record<string, number>>((acc, row) => {
    const actionType = row.action_type ?? ''
    if (actionType.length === 0) {
      return acc
    }

    acc[actionType] = parseNumeric(row.value)
    return acc
  }, {})
}

export const normalizeMetaAdAccountId = (value: string): string => {
  return value.trim().replace(/^act_/i, '')
}

const buildMetaActAccountId = (value: string): string => {
  return `act_${normalizeMetaAdAccountId(value)}`
}

async function requestMetaGraph<T>(params: { path: string; accessToken: string; query?: Record<string, string> }): Promise<MetaGraphResult<T>> {
  const url = new URL(`${META_GRAPH_API_BASE_URL}/${params.path.replace(/^\/+/, '')}`)
  const query = params.query ?? {}

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }

  url.searchParams.set('access_token', params.accessToken)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
  } catch (error) {
    trackError({
      error: error as Error,
      method: 'requestMetaGraph.fetch',
      controller: 'meta',
      additionalContext: { path: params.path }
    })

    return {
      ok: false,
      status: 503,
      message: 'No fue posible conectar con Meta en este momento.',
      type: null,
      code: null,
      subcode: null
    }
  }

  let payload: unknown = null
  try {
    payload = (await response.json()) as unknown
  } catch {
    payload = null
  }

  const typedPayload = (payload ?? null) as MetaGraphErrorShape | T
  const graphError = (typedPayload as MetaGraphErrorShape | null)?.error

  if (!response.ok || graphError) {
    return {
      ok: false,
      status: response.status,
      message: normalizeMetaMessage(typedPayload as MetaGraphErrorShape | null, response.status),
      type: graphError?.type ?? null,
      code: graphError?.code ?? null,
      subcode: graphError?.error_subcode ?? null
    }
  }

  return {
    ok: true,
    data: typedPayload as T
  }
}

export function shouldMarkMetaConnectionForReconnect(error: MetaGraphResultError): boolean {
  if (error.status === 401 || error.status === 403) {
    return true
  }

  return error.code !== null && META_RECONNECT_ERROR_CODES.has(error.code)
}

export async function validateMetaAdAccountConnection(params: {
  accessToken: string
  adAccountId: string
  businessId?: string
}): Promise<{ ok: true; account: IMetaValidatedAccount } | MetaGraphResultError> {
  const normalizedAccountId = normalizeMetaAdAccountId(params.adAccountId)
  const result = await requestMetaGraph<MetaAdAccountResponse>({
    path: buildMetaActAccountId(normalizedAccountId),
    accessToken: params.accessToken,
    query: {
      fields: 'id,account_id,name,currency,timezone_name,timezone_offset_hours,timezone_offset_hours_utc'
    }
  })

  if (!result.ok) {
    return result
  }

  return {
    ok: true,
    account: {
      meta_account_node_id: result.data.id,
      ad_account_id: normalizeMetaAdAccountId(result.data.account_id ?? normalizedAccountId),
      account_name: result.data.name ?? null,
      account_currency: result.data.currency ?? null,
      timezone_name: result.data.timezone_name ?? null,
      timezone_offset_hours: result.data.timezone_offset_hours ?? result.data.timezone_offset_hours_utc ?? null,
      business_id: params.businessId ?? null
    }
  }
}

export async function fetchMetaAccountOverview(params: {
  accessToken: string
  adAccountId: string
  since: string
  until: string
}): Promise<{ ok: true; overview: IMetaAccountOverview } | MetaGraphResultError> {
  const normalizedAccountId = normalizeMetaAdAccountId(params.adAccountId)
  const result = await requestMetaGraph<MetaInsightsResponse>({
    path: `${buildMetaActAccountId(normalizedAccountId)}/insights`,
    accessToken: params.accessToken,
    query: {
      fields: 'account_id,account_name,spend,impressions,reach,clicks,ctr,cpc,cpm,actions,cost_per_action_type,date_start,date_stop',
      limit: '1',
      time_range: JSON.stringify({ since: params.since, until: params.until })
    }
  })

  if (!result.ok) {
    return result
  }

  const row = result.data.data?.[0]
  const purchases = sumActionValues(row?.actions, PURCHASE_ACTION_TYPES)
  const leads = sumActionValues(row?.actions, LEAD_ACTION_TYPES)

  return {
    ok: true,
    overview: {
      ad_account_id: normalizeMetaAdAccountId(row?.account_id ?? normalizedAccountId),
      account_name: row?.account_name ?? null,
      account_currency: null,
      since: row?.date_start ?? params.since,
      until: row?.date_stop ?? params.until,
      spend: parseNumeric(row?.spend),
      impressions: parseNumeric(row?.impressions),
      reach: parseNumeric(row?.reach),
      clicks: parseNumeric(row?.clicks),
      ctr: parseNumeric(row?.ctr),
      cpc: row?.cpc !== undefined ? parseNumeric(row.cpc) : null,
      cpm: row?.cpm !== undefined ? parseNumeric(row.cpm) : null,
      purchases,
      leads,
      cost_per_purchase: firstMatchingCost(row?.cost_per_action_type, PURCHASE_ACTION_TYPES),
      cost_per_lead: firstMatchingCost(row?.cost_per_action_type, LEAD_ACTION_TYPES),
      raw_actions: collectRawActions(row?.actions)
    }
  }
}

const mapCampaignInsight = (row: MetaInsightRow, index: number): IMetaCampaignInsight => {
  const purchases = sumActionValues(row.actions, PURCHASE_ACTION_TYPES)
  const leads = sumActionValues(row.actions, LEAD_ACTION_TYPES)

  return {
    rank: index + 1,
    campaign_id: row.campaign_id ?? `campaign-${index + 1}`,
    campaign_name: row.campaign_name ?? `Campana ${index + 1}`,
    spend: parseNumeric(row.spend),
    impressions: parseNumeric(row.impressions),
    reach: parseNumeric(row.reach),
    clicks: parseNumeric(row.clicks),
    ctr: parseNumeric(row.ctr),
    cpc: row.cpc !== undefined ? parseNumeric(row.cpc) : null,
    cpm: row.cpm !== undefined ? parseNumeric(row.cpm) : null,
    purchases,
    leads,
    cost_per_purchase: firstMatchingCost(row.cost_per_action_type, PURCHASE_ACTION_TYPES),
    cost_per_lead: firstMatchingCost(row.cost_per_action_type, LEAD_ACTION_TYPES)
  }
}

const mapAdInsight = (row: MetaInsightRow, index: number): IMetaAdInsight => {
  const purchases = sumActionValues(row.actions, PURCHASE_ACTION_TYPES)
  const leads = sumActionValues(row.actions, LEAD_ACTION_TYPES)

  return {
    rank: index + 1,
    ad_id: row.ad_id ?? `ad-${index + 1}`,
    ad_name: row.ad_name ?? `Anuncio ${index + 1}`,
    spend: parseNumeric(row.spend),
    impressions: parseNumeric(row.impressions),
    clicks: parseNumeric(row.clicks),
    ctr: parseNumeric(row.ctr),
    cpc: row.cpc !== undefined ? parseNumeric(row.cpc) : null,
    purchases,
    leads,
    cost_per_purchase: firstMatchingCost(row.cost_per_action_type, PURCHASE_ACTION_TYPES),
    cost_per_lead: firstMatchingCost(row.cost_per_action_type, LEAD_ACTION_TYPES)
  }
}

export async function fetchMetaCampaignInsights(params: {
  accessToken: string
  adAccountId: string
  since: string
  until: string
  limit?: number
}): Promise<{ ok: true; insights: IMetaCampaignInsight[] } | MetaGraphResultError> {
  const normalizedAccountId = normalizeMetaAdAccountId(params.adAccountId)
  const limit = Math.max(1, Math.min(params.limit ?? 50, 200))

  const result = await requestMetaGraph<MetaInsightsResponse>({
    path: `${buildMetaActAccountId(normalizedAccountId)}/insights`,
    accessToken: params.accessToken,
    query: {
      fields: 'campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpc,cpm,actions,cost_per_action_type',
      level: 'campaign',
      limit: String(limit),
      time_range: JSON.stringify({ since: params.since, until: params.until })
    }
  })

  if (!result.ok) {
    return result
  }

  const sortedRows = [...(result.data.data ?? [])].sort((a, b) => parseNumeric(b.spend) - parseNumeric(a.spend))
  return {
    ok: true,
    insights: sortedRows.map(mapCampaignInsight)
  }
}

export async function fetchMetaAdInsights(params: {
  accessToken: string
  adAccountId: string
  since: string
  until: string
  limit?: number
}): Promise<{ ok: true; insights: IMetaAdInsight[] } | MetaGraphResultError> {
  const normalizedAccountId = normalizeMetaAdAccountId(params.adAccountId)
  const limit = Math.max(1, Math.min(params.limit ?? 100, 500))

  const result = await requestMetaGraph<MetaInsightsResponse>({
    path: `${buildMetaActAccountId(normalizedAccountId)}/insights`,
    accessToken: params.accessToken,
    query: {
      fields: 'ad_id,ad_name,spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type',
      level: 'ad',
      limit: String(limit),
      time_range: JSON.stringify({ since: params.since, until: params.until })
    }
  })

  if (!result.ok) {
    return result
  }

  const sortedRows = [...(result.data.data ?? [])].sort((a, b) => parseNumeric(b.spend) - parseNumeric(a.spend))
  return {
    ok: true,
    insights: sortedRows.map(mapAdInsight)
  }
}
