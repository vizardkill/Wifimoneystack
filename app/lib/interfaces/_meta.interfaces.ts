export type MetaConnectionStatus = 'ACTIVE' | 'RECONNECT_REQUIRED'

export interface IMetaConnection {
  id: string
  user_id: string
  token_label: string | null
  encrypted_access_token: string
  ad_account_id: string
  business_id: string | null
  status: MetaConnectionStatus
  account_name: string | null
  account_currency: string | null
  timezone_name: string | null
  timezone_offset_hours: number | null
  last_validated_at: Date | null
  last_error: string | null
  metadata: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
}

export interface IMetaConnectionPublic {
  id: string
  token_label: string | null
  ad_account_id: string
  business_id: string | null
  status: MetaConnectionStatus
  account_name: string | null
  account_currency: string | null
  timezone_name: string | null
  timezone_offset_hours: number | null
  last_validated_at: Date | null
  last_error: string | null
  created_at: Date
  updated_at: Date
}

export interface IUpsertMetaConnectionInput {
  user_id: string
  access_token: string
  ad_account_id: string
  business_id?: string
  token_label?: string
}

export interface ISaveMetaConnectionRecordInput {
  user_id: string
  encrypted_access_token: string
  ad_account_id: string
  business_id?: string | null
  token_label?: string | null
  status: MetaConnectionStatus
  account_name?: string | null
  account_currency?: string | null
  timezone_name?: string | null
  timezone_offset_hours?: number | null
  last_validated_at?: Date | null
  last_error?: string | null
  metadata?: Record<string, unknown> | null
}

export interface IMetaValidatedAccount {
  meta_account_node_id: string
  ad_account_id: string
  account_name: string | null
  account_currency: string | null
  timezone_name: string | null
  timezone_offset_hours: number | null
  business_id: string | null
}

export interface IMetaAccountOverview {
  ad_account_id: string
  account_name: string | null
  account_currency: string | null
  since: string
  until: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number | null
  cpm: number | null
  purchases: number
  leads: number
  cost_per_purchase: number | null
  cost_per_lead: number | null
  raw_actions: Record<string, number>
}

export interface IMetaCampaignInsight {
  rank: number
  campaign_id: string
  campaign_name: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number | null
  cpm: number | null
  purchases: number
  leads: number
  cost_per_purchase: number | null
  cost_per_lead: number | null
}

export interface IMetaAdInsight {
  rank: number
  ad_id: string
  ad_name: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number | null
  purchases: number
  leads: number
  cost_per_purchase: number | null
  cost_per_lead: number | null
}

export type MetaPresetId =
  | 'spend_report'
  | 'top_creatives'
  | 'budget_leakage'
  | 'performance_by_product_or_account'
  | 'pause_today'
  | 'creative_fatigue'
  | 'opportunities_breakdown'
  | 'campaign_structure_recommendation'

export interface IMetaPresetKpi {
  label: string
  value: string
  hint?: string
}

export interface IMetaPresetTable {
  title: string
  columns: string[]
  rows: Array<Record<string, string>>
}

export interface IMetaPresetResult {
  preset_id: MetaPresetId
  title: string
  summary: string
  kpis: IMetaPresetKpi[]
  alerts: string[]
  recommendations: string[]
  tables: IMetaPresetTable[]
  generated_at: string
}

export interface IMetaServiceResponse<T> {
  error?: boolean
  message?: string
  data?: T
}
