export namespace CONFIG_REGISTER_USER {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type Payload = {
    first_name: string
    last_name: string
    email: string
    password: string
    country_id: string
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
    field?: string
    suggestion?: string
    fieldErrors?: Record<string, string>
    status?: string
    data?: {
      user?: {
        id: string
        email: string
        first_name: string
        last_name: string
      }
      token?: string
    }
  }
}

export namespace CONFIG_VERIFY_EMAIL {
  export enum RequestStatus {
    Pending = 'pending',
    Error = 'error',
    Completed = 'completed'
  }

  export type RequestResponse = {
    error?: boolean
    message?: string
  }
}
