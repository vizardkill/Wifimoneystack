export namespace CONFIG_LOGIN_USER {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type Payload = {
    email: string
    password: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    field?: string
    fieldErrors?: Record<string, string>
    data?: {
      user?: {
        id: string
        email: string
        first_name: string
        last_name: string
        KYC_status?: string
        role?: string
        country_id?: string
      }
      token?: string
    }
  }
}
