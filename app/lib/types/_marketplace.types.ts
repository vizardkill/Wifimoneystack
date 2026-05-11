import type { MarketplaceAppAccessMode } from '@prisma/client'

// ── US1: Solicitar acceso al marketplace ──────────────────────────────────────

export namespace CONFIG_REQUEST_MARKETPLACE_ACCESS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    AlreadyRequested = 'already_requested',
    Completed = 'completed'
  }

  export type Payload = {
    user_id: string
    company_name?: string
    business_url?: string
    business_type?: string
    request_notes?: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      request_id: string
      access_status: string
    }
  }
}

// ── US1: Consultar estado de acceso ───────────────────────────────────────────

export namespace CONFIG_GET_MARKETPLACE_ACCESS_STATUS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    NotFound = 'not_found',
    Completed = 'completed'
  }

  export type Payload = {
    user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      access_status: string
      request_id: string | null
      decided_at: Date | null
      decision_reason: string | null
    }
  }
}

// ── US2: Listar apps publicadas ────────────────────────────────────────────────

export namespace CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    AccessDenied = 'access_denied',
    Completed = 'completed'
  }

  export type Payload = {
    user_id: string
    search?: string
    access_mode?: MarketplaceAppAccessMode
    page?: number
    per_page?: number
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      apps: Array<{
        id: string
        slug: string
        name: string
        summary: string
        access_mode: MarketplaceAppAccessMode
        icon_url: string | null
        screenshot_count: number
      }>
      total: number
      page: number
      per_page: number
    }
  }
}

// ── US2: Obtener detalle de app ────────────────────────────────────────────────

export namespace CONFIG_GET_MARKETPLACE_APP {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    NotFound = 'not_found',
    AccessDenied = 'access_denied',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      id: string
      slug: string
      name: string
      summary: string
      description: string
      instructions: string
      access_mode: MarketplaceAppAccessMode
      web_url: string | null
      media: Array<{
        id: string
        type: string
        public_url: string | null
        alt_text: string | null
        sort_order: number
      }>
      has_active_artifact: boolean
    }
  }
}

// ── US2: Registrar uso de app ──────────────────────────────────────────────────

export namespace CONFIG_RECORD_MARKETPLACE_APP_USE {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    AccessDenied = 'access_denied',
    AppNotFound = 'app_not_found',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      redirect_url: string
    }
  }
}

// ── US2: Registrar descarga de app ────────────────────────────────────────────

export namespace CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    AccessDenied = 'access_denied',
    AppNotFound = 'app_not_found',
    NoArtifact = 'no_artifact',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      download_url: string
      file_name: string
      version_label: string | null
    }
  }
}

// ── US3: Listar solicitudes de acceso (admin) ─────────────────────────────────

export namespace CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type Payload = {
    status_filter?: string
    page?: number
    per_page?: number
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      requests: Array<{
        id: string
        user_id: string
        user_email: string
        user_name: string | null
        status: string
        company_name: string | null
        business_url: string | null
        created_at: Date
        decided_at: Date | null
      }>
      total: number
      page: number
      per_page: number
    }
  }
}

// ── US3: Decidir solicitud de acceso (admin) ──────────────────────────────────

export namespace CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    NotFound = 'not_found',
    InvalidTransition = 'invalid_transition',
    Completed = 'completed'
  }

  export type Payload = {
    request_id: string
    decision: 'APPROVED' | 'REJECTED'
    reason?: string
    actor_user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      request_id: string
      new_status: string
    }
  }
}

// ── US3: Revocar acceso (admin) ───────────────────────────────────────────────

export namespace CONFIG_REVOKE_MARKETPLACE_ACCESS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    NotFound = 'not_found',
    InvalidTransition = 'invalid_transition',
    Completed = 'completed'
  }

  export type Payload = {
    request_id: string
    reason?: string
    actor_user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      request_id: string
    }
  }
}

// ── US4: Crear/editar app (admin) ─────────────────────────────────────────────

export namespace CONFIG_UPSERT_MARKETPLACE_APP {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Validation = 'validation',
    Completed = 'completed'
  }

  export type Payload = {
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

  export type RequestResponse = {
    error?: boolean
    message?: string
    field_errors?: Record<string, string>
    status?: RequestStatus
    data?: {
      app_id: string
      slug: string
    }
  }
}

// ── US4: Publicar/despublicar app (admin) ─────────────────────────────────────

export namespace CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    ValidationFailed = 'validation_failed',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    publish: boolean
    actor_user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      app_id: string
      new_status: string
    }
  }
}

// ── US5: Dashboard marketplace (admin) ────────────────────────────────────────

export namespace CONFIG_GET_MARKETPLACE_DASHBOARD {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type Payload = {
    days?: number
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      kpis: {
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
      top_apps: Array<{
        app_id: string
        app_name: string
        detail_views: number
        web_opens: number
        downloads: number
        installs: number
        total_events: number
      }>
      no_activity_apps: Array<{
        id: string
        name: string
        status: string
        published_at: Date | null
      }>
    }
  }
}
