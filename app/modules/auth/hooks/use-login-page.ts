import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useActionData, useFetcher, useNavigate, useNavigation, useSearchParams } from 'react-router'

import type { ResendVerificationResponse } from '@lib/interfaces'
import { type LoginPayload, LoginSchema } from '@lib/schemas/auth.schemas'

import type { CONFIG_LOGIN_USER } from '@types'

type UseLoginPageReturn = {
  form: UseFormReturn<LoginPayload>
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  isLoading: boolean
  isResending: boolean
  needsVerification: boolean
  successMessage: string | null
  fetcherMessage: string | null
  fetcherHasError: boolean
  fetcherIsSuccess: boolean
  actionData: CONFIG_LOGIN_USER.RequestResponse | undefined
  handleResend: () => void
}

/**
 * Encapsula todo el estado, efectos y lógica de handlers de la página de login.
 * Usa react-hook-form + zodResolver(LoginSchema) para validación cliente.
 */
export function useLoginPage(): UseLoginPageReturn {
  const fetcher = useFetcher<ResendVerificationResponse>()
  const actionData = useActionData<CONFIG_LOGIN_USER.RequestResponse>()
  const nav = useNavigation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)

  const isLoading = nav.state === 'submitting' || nav.state === 'loading'
  const isResending = fetcher.state === 'submitting'

  const fetcherHasError = fetcher.data?.error === true
  const fetcherIsSuccess = fetcher.data?.error === false
  const fetcherMessage = fetcher.data?.message ?? null

  const form = useForm<LoginPayload>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit'
  })

  const handleResend = (): void => {
    const email = form.getValues('email')
    if (email) {
      void fetcher.submit({ email }, { method: 'POST', action: '/api/v1/auth/sessions/resend' })
    }
  }

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const emailFromParams = searchParams.get('email')

    if (
      actionData?.field === 'email' ||
      actionData?.message === 'Debes verificar tu correo electrónico antes de iniciar sesión.' ||
      errorParam === 'google_login_failed'
    ) {
      setNeedsVerification(true)
      if (emailFromParams) {
        form.setValue('email', emailFromParams)
      }

      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('error')
      newSearchParams.delete('email')
      void navigate({ search: newSearchParams.toString() }, { replace: true })
    }

    if (actionData?.error && actionData.field !== 'email') {
      form.setError('root', { message: actionData.message ?? 'Error al iniciar sesión' })
    }
  }, [actionData, searchParams, navigate, form])

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage('¡Correo verificado! Ahora puedes iniciar sesión.')
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('verified')
      void navigate({ search: newSearchParams.toString() }, { replace: true })
    }
  }, [searchParams, navigate])

  return {
    form,
    showPassword,
    setShowPassword,
    isLoading,
    isResending,
    needsVerification,
    successMessage,
    fetcherMessage,
    fetcherHasError,
    fetcherIsSuccess,
    actionData,
    handleResend
  }
}
