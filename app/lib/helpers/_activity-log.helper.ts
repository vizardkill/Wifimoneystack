/**
 * Stub de activity-log para el marketplace.
 * Las funciones no hacen nada en esta versión MVP.
 */

type StubArgs = unknown[]

// Stub no-op — acepta cualquier argumento, no lanza, no escribe a DB
export const logAuthActivity = {
  login: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  logout: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  failed: (..._args: StubArgs): Promise<void> => Promise.resolve()
}

export const logAuthActivityExtra = {
  registered: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  verificationSent: (..._args: StubArgs): Promise<void> => Promise.resolve()
}

export const logSecurityActivity = {
  passwordReset: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  passwordResetRequested: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  passwordChanged: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  emailVerified: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  forgotPassword: (..._args: StubArgs): Promise<void> => Promise.resolve()
}

export const logUserActivity = {
  profileUpdated: (..._args: StubArgs): Promise<void> => Promise.resolve(),
  created: (..._args: StubArgs): Promise<void> => Promise.resolve()
}
