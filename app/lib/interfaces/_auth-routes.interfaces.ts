import { type AuthResultStatus } from './_auth-provider.interfaces'

export interface GooglePrefillData {
  provider: string | null
  prefill: string | null
  email: string | null
  first_name: string | null
  last_name: string | null
  google_id: string | null
  verified_email: string | null
  picture: string | null
  access_token: string | null
}

export interface SignupLoaderData {
  googleData: GooglePrefillData
  returnTo?: string | null
}

export interface ResendVerificationResponse {
  error: boolean
  message: string
}

export interface VerificationStatusLoaderResponse {
  status: string
  message: string
}

export interface ForgotPasswordActionResponse {
  error: boolean
  message: string
}

export interface ResetPasswordActionResponse {
  error?: boolean
  message: string
}

export interface GoogleCallbackState {
  mode?: 'login' | 'signup'
  returnTo?: string
}

export interface GoogleRegisterActionResponse {
  error: boolean
  status: AuthResultStatus
  message: string
  data?: unknown
}
