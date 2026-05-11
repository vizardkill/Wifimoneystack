import { type AuthResult } from '@lib/interfaces'

/**
 * Types específicos para el provider JWT
 */

export namespace JWT_REGISTER {
  export enum RequestStatus {
    Pending = 'pending',
    ValidatingPayload = 'validating_payload',
    CheckingExistingUser = 'checking_existing_user',
    CreatingUser = 'creating_user',
    SendingVerification = 'sending_verification',
    GeneratingToken = 'generating_token',
    Completed = 'completed',
    Error = 'error'
  }

  export type RequestResponse = AuthResult
}

export namespace JWT_LOGIN {
  export enum RequestStatus {
    Pending = 'pending',
    ValidatingPayload = 'validating_payload',
    FetchingUser = 'fetching_user',
    ValidatingPassword = 'validating_password',
    CheckingActiveStatus = 'checking_active_status',
    GeneratingToken = 'generating_token',
    LoggingActivity = 'logging_activity',
    Completed = 'completed',
    Error = 'error'
  }

  export type RequestResponse = AuthResult
}

export namespace JWT_VALIDATE_TOKEN {
  export type RequestResponse = {
    valid: boolean
    user?: Partial<{
      id: string
      email: string
      first_name: string
      last_name: string
      role: string
      KYC_status: string
      country_id: string
    }>
    expires_at?: Date
    error?: string
  }
}
