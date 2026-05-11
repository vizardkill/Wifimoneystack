export namespace CONFIG_FORGOT_PASSWORD {
  export enum RequestStatus {
    Pending = 'Pending',
    FetchingUser = 'FetchingUser',
    ValidatingUser = 'ValidatingUser',
    DeletingOldTokens = 'DeletingOldTokens',
    GeneratingToken = 'GeneratingToken',
    CreatingToken = 'CreatingToken',
    BuildingResetUrl = 'BuildingResetUrl',
    SendingEmail = 'SendingEmail',
    LoggingActivity = 'LoggingActivity',
    Completed = 'Completed',
    Error = 'Error'
  }

  export type RequestResponse = {
    error: boolean
    message: string
  }
}

export namespace CONFIG_RESET_PASSWORD {
  export type Payload = {
    token: string
    password: string
  }
  export type RequestResponse = {
    error: boolean
    message: string
  }
}
