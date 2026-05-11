import type { AuthResultStatus } from '@lib/interfaces'

export namespace CONFIG_LINK_GOOGLE_ACCOUNT {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type Payload = {
    userId: string
    googleProfile: {
      google_id: string
      email: string
      picture?: string
      verified_email?: boolean
      locale?: string
    }
  }

  export type RequestResponse = {
    status: AuthResultStatus
    error: boolean
    message: string
    data: Record<string, unknown>
  }
}
