import { type AuthResult } from '@lib/interfaces'

/**
 * Types específicos para el provider Google
 */

export namespace GOOGLE_REGISTER {
  export enum RequestStatus {
    Pending = 'pending',
    ValidatingToken = 'validating_token',
    CheckingExistingUser = 'checking_existing_user',
    CreatingUser = 'creating_user',
    UpdatingUserStatus = 'updating_user_status',
    CreatingAuthProvider = 'creating_auth_provider',
    GeneratingToken = 'generating_token',
    LoggingActivity = 'logging_activity',
    Completed = 'completed',
    Error = 'error'
  }

  export type RequestResponse = AuthResult
}

export namespace GOOGLE_LOGIN {
  export enum RequestStatus {
    Pending = 'pending',
    FetchingUser = 'fetching_user',
    CheckingActiveStatus = 'checking_active_status',
    VerifyingOrCreatingProvider = 'verifying_or_creating_provider',
    GeneratingToken = 'generating_token',
    LoggingActivity = 'logging_activity',
    Completed = 'completed',
    Error = 'error'
  }

  export type RequestResponse = AuthResult
}

export namespace GOOGLE_VALIDATE_TOKEN {
  export type RequestResponse = {
    valid: boolean
    user?: Partial<{
      id: string
      email: string
      first_name: string
      last_name: string
      role: string
    }>
    error?: string
  }
}

export namespace GOOGLE_LINK_ACCOUNT {
  export enum RequestStatus {
    Pending = 'pending',
    ValidatingToken = 'validating_token',
    FetchingUser = 'fetching_user',
    VerifyingEmail = 'verifying_email',
    UpdatingUser = 'updating_user',
    Completed = 'completed',
    Error = 'error'
  }

  export type RequestResponse = {
    success: boolean
    message: string
  }
}

/**
 * Google User Profile del OAuth
 */
export type GoogleUserProfile = {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture?: string
  locale?: string
  accessToken: string
}
