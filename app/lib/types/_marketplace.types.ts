import type { MarketplaceAppAccessMode, MarketplaceAppStatus } from '@prisma/client'

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
      presentation_mode?: 'LEGACY' | 'STOREFRONT'
      media: Array<{
        id: string
        type: string
        public_url: string | null
        alt_text: string | null
        sort_order: number
      }>
      storefront?: {
        summary: string
        description: string
        instructions: string
        developer_name: string
        developer_website: string
        support_email: string | null
        support_url: string | null
        languages: Array<{
          code: string
          label: string
          sort_order: number
        }>
        media: Array<{
          id: string
          type: string
          public_url: string | null
          alt_text: string | null
          sort_order: number
        }>
        video_url: string | null
      } | null
      has_active_artifact: boolean
    }
  }
}

// ── Admin: Storefront authoring (Feature 003) ────────────────────────────────

export namespace CONFIG_GET_MARKETPLACE_APP_AUTHORING {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    NotFound = 'not_found',
    Forbidden = 'forbidden',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    actor_user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      app: {
        id: string
        slug: string
        name: string
        status: string
        access_mode: MarketplaceAppAccessMode
        web_url: string | null
        summary: string
        description: string
        instructions: string
        has_active_artifact: boolean
      }
      draft_storefront: {
        id: string | null
        readiness_status: 'INCOMPLETE' | 'READY'
        summary: string
        description: string
        instructions: string
        developer_name: string
        developer_website: string
        support_email: string | null
        support_url: string | null
        language_codes: string[]
        missing_requirements: string[]
        updated_at: Date | null
      }
      published_storefront: {
        id: string
        published_at: Date | null
        summary: string
        description: string
        instructions: string
        developer_name: string
        developer_website: string
        support_email: string | null
        support_url: string | null
        language_codes: string[]
        media: Array<{
          id: string
          type: string
          public_url: string | null
          alt_text: string | null
          sort_order: number
        }>
      } | null
      draft_media: Array<{
        id: string
        type: string
        public_url: string | null
        alt_text: string | null
        sort_order: number
        storage_key: string
      }>
      media_library: Array<{
        id: string
        type: string
        public_url: string | null
        alt_text: string | null
        sort_order: number
        storage_key: string
      }>
      language_catalog: Array<{
        code: string
        label: string
        sort_order: number
        is_active: boolean
      }>
    }
  }
}

export namespace CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Validation = 'validation',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    Completed = 'completed'
  }

  export type Payload = {
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

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    field_errors?: Record<string, string>
    data?: {
      app_id: string
      storefront_version_id: string
      readiness_status: 'INCOMPLETE' | 'READY'
      missing_requirements: string[]
      updated_at: Date
    }
  }
}

export namespace CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    ValidationFailed = 'validation_failed',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    actor_user_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      app_id: string
      published_storefront_version_id: string
      published_at: Date
    }
  }
}

export namespace CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Validation = 'validation',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    actor_user_id: string
    media_type: 'ICON' | 'SCREENSHOT'
    file_name: string
    content_type: string
    size_bytes: number
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    field_errors?: Record<string, string>
    data?: {
      app_id: string
      media_type: 'ICON' | 'SCREENSHOT'
      signed_url: string
      public_url: string
      storage_key: string
      expires_in_seconds: number
    }
  }
}

export namespace CONFIG_REGISTER_MARKETPLACE_APP_MEDIA {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Validation = 'validation',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    actor_user_id: string
    media_type: 'ICON' | 'SCREENSHOT' | 'VIDEO'
    storage_key?: string
    public_url?: string
    external_video_url?: string
    alt_text?: string
    attach_to_draft?: boolean
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    field_errors?: Record<string, string>
    data?: {
      app_id: string
      media: {
        id: string
        type: string
        storage_key: string
        public_url: string | null
        alt_text: string | null
        sort_order: number
      }
      attached_to_draft: boolean
      readiness_status: 'INCOMPLETE' | 'READY'
      missing_requirements: string[]
    }
  }
}

export namespace CONFIG_REMOVE_MARKETPLACE_APP_MEDIA {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Validation = 'validation',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    actor_user_id: string
    media_id: string
    detach_from_draft?: boolean
    remove_from_library?: boolean
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      app_id: string
      media_id: string
      detached_from_draft: boolean
      removed_from_library: boolean
      readiness_status: 'INCOMPLETE' | 'READY'
      missing_requirements: string[]
    }
  }
}

export namespace CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Validation = 'validation',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    Completed = 'completed'
  }

  export type Payload = {
    app_id: string
    actor_user_id: string
    ordered_media_ids: string[]
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      app_id: string
      ordered_media_ids: string[]
      readiness_status: 'INCOMPLETE' | 'READY'
      missing_requirements: string[]
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
        updated_at: Date
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
    Conflict = 'conflict',
    InvalidTransition = 'invalid_transition',
    Completed = 'completed'
  }

  export type Payload = {
    request_id: string
    decision: 'APPROVED' | 'REJECTED'
    reason?: string
    expected_updated_at?: Date
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
    Conflict = 'conflict',
    InvalidTransition = 'invalid_transition',
    Completed = 'completed'
  }

  export type Payload = {
    request_id: string
    reason?: string
    expected_updated_at?: Date
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

export namespace CONFIG_LIST_ADMIN_MARKETPLACE_APPS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type Payload = {
    actor_user_id: string
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
        status: MarketplaceAppStatus
        access_mode: MarketplaceAppAccessMode
        icon_url: string | null
      }>
      total: number
      page: number
      per_page: number
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
      kpis_variation_7d: {
        new_users_7d: number
        access_decisions_7d: number
        apps_activated_7d: number
        apps_deactivated_7d: number
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

// ── US4: Administradores (superadmin) ───────────────────────────────────────

export namespace CONFIG_LIST_ADMIN_ACCOUNTS {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Forbidden = 'forbidden',
    Completed = 'completed'
  }

  export type Payload = {
    actor_user_id: string
    search?: string
    page?: number
    per_page?: number
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      admins: Array<{
        id: string
        email: string
        name: string | null
        role: 'ADMIN' | 'SUPERADMIN'
        created_at: Date
      }>
      total: number
      page: number
      per_page: number
    }
  }
}

export namespace CONFIG_PROMOTE_USER_TO_ADMIN {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Forbidden = 'forbidden',
    NotFound = 'not_found',
    AlreadyAdmin = 'already_admin',
    Completed = 'completed'
  }

  export type Payload = {
    actor_user_id: string
    target_email: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    status?: RequestStatus
    data?: {
      target_user_id: string
      new_role: 'ADMIN'
    }
  }
}
