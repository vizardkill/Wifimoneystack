import { toast as sonnerToast } from 'sonner'

import type { UseToastReturn } from '@lib/interfaces/_toast.interfaces'

export { Toaster } from 'sonner'

const toast = {
  success: (title: string, description?: string): string => String(sonnerToast.success(title, { description })),
  error: (title: string, description?: string): string => String(sonnerToast.error(title, { description })),
  info: (title: string, description?: string): string => String(sonnerToast.info(title, { description })),
  warning: (title: string, description?: string): string => String(sonnerToast.warning(title, { description }))
}

export const useToast = (): UseToastReturn => {
  return {
    toast,
    toasts: [],
    dismiss: (id: string) => sonnerToast.dismiss(id)
  }
}
