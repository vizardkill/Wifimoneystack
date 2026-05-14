/**
 * @file _marketplace.interfaces.ts
 * @description Interfaces de dominio para el marketplace de aplicaciones ecommerce
 */
import type {
  MarketplaceAccessStatus,
  MarketplaceAppAccessMode,
  MarketplaceAppStatus,
  MarketplaceAuditAction,
  MarketplaceMediaType,
  MarketplaceStorefrontReadinessStatus,
  MarketplaceStorefrontVersionKind,
  MarketplaceUsageEventType
} from '@prisma/client'

// ── Access Request ─────────────────────────────────────────────────────────────

export interface IMarketplaceAccessRequest {
  id: string
  user_id: string
  status: MarketplaceAccessStatus
  company_name: string | null
  business_url: string | null
  business_type: string | null
  request_notes: string | null
  decision_reason: string | null
  decided_by_user_id: string | null
  decided_at: Date | null
  revoked_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface IMarketplaceAccessRequestWithUser extends IMarketplaceAccessRequest {
  user: {
    id: string
    name: string | null
    email: string
    avatar_url?: string | null
  }
}

export interface ICreateAccessRequestInput {
  user_id: string
  company_name?: string
  business_url?: string
  business_type?: string
  request_notes?: string
}

export interface IDecideAccessRequestInput {
  request_id: string
  decision: 'APPROVED' | 'REJECTED'
  reason?: string
  actor_user_id: string
}

export interface IRevokeAccessInput {
  request_id: string
  reason?: string
  actor_user_id: string
}

// ── Marketplace App ────────────────────────────────────────────────────────────

export interface IMarketplaceApp {
  id: string
  slug: string
  name: string
  summary: string
  description: string
  instructions: string
  access_mode: MarketplaceAppAccessMode
  status: MarketplaceAppStatus
  web_url: string | null
  published_at: Date | null
  created_by_user_id: string
  updated_by_user_id: string | null
  created_at: Date
  updated_at: Date
}

export interface IMarketplaceAppWithMedia extends IMarketplaceApp {
  media: IMarketplaceAppMedia[]
  active_artifact: IMarketplaceAppArtifact | null
}

export interface IUpsertMarketplaceAppInput {
  id?: string
  slug?: string
  name: string
  summary: string
  description: string
  instructions: string
  access_mode: MarketplaceAppAccessMode
  web_url?: string
  actor_user_id: string
}

// ── App Media ──────────────────────────────────────────────────────────────────

export interface IMarketplaceAppMedia {
  id: string
  app_id: string
  type: MarketplaceMediaType
  storage_key: string | null
  public_url: string | null
  alt_text: string | null
  sort_order: number
  created_at: Date
  updated_at: Date
}

// ── Storefront Versioning ─────────────────────────────────────────────────────

export interface IMarketplaceAppStorefrontVersion {
  id: string
  app_id: string
  kind: MarketplaceStorefrontVersionKind
  readiness_status: MarketplaceStorefrontReadinessStatus
  summary: string
  description: string
  instructions: string
  developer_name: string
  developer_website: string
  support_email: string | null
  support_url: string | null
  created_by_user_id: string
  updated_by_user_id: string | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface IMarketplaceLanguageCatalog {
  code: string
  label: string
  sort_order: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface IMarketplaceAppStorefrontVersionLanguage {
  id: string
  storefront_version_id: string
  language_code: string
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface IMarketplaceAppStorefrontVersionMedia {
  id: string
  storefront_version_id: string
  media_id: string
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface IStorefrontReadinessResult {
  readiness_status: MarketplaceStorefrontReadinessStatus
  missing_requirements: string[]
}

export interface ISaveMarketplaceAppStorefrontDraftInput {
  app_id: string
  actor_user_id: string
  summary: string
  description: string
  instructions: string
  developer_name: string
  developer_website?: string
  support_email?: string
  support_url?: string
  language_codes: string[]
}

export interface IPublishMarketplaceAppStorefrontInput {
  app_id: string
  actor_user_id: string
}

export interface IPrepareMarketplaceAppMediaUploadInput {
  app_id: string
  actor_user_id: string
  media_type: Extract<MarketplaceMediaType, 'ICON' | 'SCREENSHOT'>
  file_name: string
  content_type: string
  size_bytes: number
}

export interface IRegisterMarketplaceAppMediaInput {
  app_id: string
  actor_user_id: string
  media_type: MarketplaceMediaType
  storage_key?: string
  public_url?: string
  external_video_url?: string
  alt_text?: string
  attach_to_draft?: boolean
}

export interface IRemoveMarketplaceAppMediaInput {
  app_id: string
  actor_user_id: string
  media_id: string
  detach_from_draft?: boolean
  remove_from_library?: boolean
}

export interface IReorderMarketplaceAppStorefrontMediaInput {
  app_id: string
  actor_user_id: string
  ordered_media_ids: string[]
}

// ── App Artifact ───────────────────────────────────────────────────────────────

export interface IMarketplaceAppArtifact {
  id: string
  app_id: string
  storage_key: string
  file_name: string
  mime_type: string
  size_bytes: bigint
  checksum: string | null
  version_label: string | null
  is_active: boolean
  created_by_user_id: string
  created_at: Date
  updated_at: Date
}

// ── Usage Event ────────────────────────────────────────────────────────────────

export interface IMarketplaceUsageEvent {
  id: string
  app_id: string
  user_id: string
  type: MarketplaceUsageEventType
  metadata: Record<string, unknown> | null
  created_at: Date
}

export interface ICreateUsageEventInput {
  app_id: string
  user_id: string
  type: MarketplaceUsageEventType
  metadata?: Record<string, unknown>
}

// ── Audit Event ────────────────────────────────────────────────────────────────

export interface IMarketplaceAuditEvent {
  id: string
  actor_user_id: string
  target_user_id: string | null
  app_id: string | null
  action: MarketplaceAuditAction
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: Date
}

export interface ICreateAuditEventInput {
  actor_user_id: string
  target_user_id?: string
  app_id?: string
  action: MarketplaceAuditAction
  reason?: string
  metadata?: Record<string, unknown>
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export interface IMarketplaceDashboardKPIs {
  total_requests: number
  pending_requests: number
  approved_users: number
  rejected_requests: number
  revoked_users: number
  total_apps: number
  active_apps: number
  draft_apps: number
  inactive_apps: number
}

export interface IMarketplaceAppUsageSummary {
  app_id: string
  app_name: string
  detail_views: number
  web_opens: number
  downloads: number
  installs: number
  total_events: number
}

export interface IMarketplaceDashboard {
  kpis: IMarketplaceDashboardKPIs
  top_apps: IMarketplaceAppUsageSummary[]
  no_activity_apps: IMarketplaceApp[]
}
