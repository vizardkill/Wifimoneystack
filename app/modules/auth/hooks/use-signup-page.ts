import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useActionData, useNavigation } from 'react-router'

import type { SignupLoaderData } from '@lib/interfaces'
import { type SignupFormInputValues, SignupFormSchema, type SignupFormValues } from '@lib/schemas/auth.schemas'

import { checkPasswordStrength } from '@utils'

import type { CONFIG_REGISTER_USER } from '@types'

type UseSignupPageReturn = {
  form: UseFormReturn<SignupFormInputValues, unknown, SignupFormValues>
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  strength: number
  isLoading: boolean
  isGoogleRegistration: boolean
  actionData: CONFIG_REGISTER_USER.RequestResponse | undefined
}

/**
 * Encapsula todo el estado, efectos y lógica de handlers de la página de registro.
 * Usa react-hook-form + zodResolver(SignupFormSchema) para validación cliente.
 */
export function useSignupPage(loaderData: SignupLoaderData): UseSignupPageReturn {
  const nav = useNavigation()
  const actionData = useActionData<CONFIG_REGISTER_USER.RequestResponse>()

  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)

  const isLoading = nav.state === 'submitting' || nav.state === 'loading'
  const isGoogleRegistration = loaderData.googleData.provider === 'google'

  const form = useForm<SignupFormInputValues, unknown, SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      first_name: loaderData.googleData.first_name ?? '',
      last_name: loaderData.googleData.last_name ?? '',
      email: loaderData.googleData.email ?? '',
      provider: isGoogleRegistration ? 'google' : 'local',
      password: '',
      password_repeat: '',
      country_id: '',
      terms: undefined as unknown as true
    },
    mode: 'onSubmit'
  })

  // Actualizar fuerza de contraseña al cambiar el campo
  const passwordValue = form.watch('password') ?? ''
  useEffect(() => {
    setStrength(checkPasswordStrength(passwordValue))
  }, [passwordValue])

  // Mapear errores del server a campos del formulario
  useEffect(() => {
    if (!actionData?.error) {
      return
    }

    if (actionData.field === 'email' || actionData.suggestion === 'login') {
      form.setError('email', { message: actionData.message })
    } else {
      form.setError('root', { message: actionData.message ?? 'Error al crear la cuenta' })
    }
  }, [actionData, form])

  return {
    form,
    showPassword,
    setShowPassword,
    strength,
    isLoading,
    isGoogleRegistration,
    actionData
  }
}
