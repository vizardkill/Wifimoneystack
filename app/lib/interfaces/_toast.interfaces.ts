export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

export interface ToastApi {
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
}

export interface UseToastReturn {
  toast: ToastApi
  /** @deprecated Sonner manages its own toast state internally; this array is always empty. */
  toasts: Toast[]
  dismiss: (id: string) => void
}
