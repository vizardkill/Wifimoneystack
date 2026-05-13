import type { FormEvent } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormRegisterReturn, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

const OptionalHttpsUrlSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || /^https:\/\//.test(value), 'La URL debe iniciar con https://')
  .refine((value) => value.length === 0 || /^https:\/\/.+/.test(value), 'La URL no es válida')

const OptionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'El correo de soporte no es válido')

const StorefrontDraftSchema = z.object({
  summary: z.string().trim().max(300, 'El resumen no puede superar 300 caracteres.'),
  description: z.string().trim(),
  instructions: z.string().trim(),
  developer_name: z.string().trim().max(120, 'El nombre del desarrollador no puede superar 120 caracteres.'),
  developer_website: OptionalHttpsUrlSchema,
  support_email: OptionalEmailSchema,
  support_url: OptionalHttpsUrlSchema,
  language_codes: z.array(z.string().trim().min(2, 'Código de idioma inválido')).max(12, 'No puedes seleccionar más de 12 idiomas.')
})

export type StorefrontDraftFormValues = z.infer<typeof StorefrontDraftSchema>

type UseStorefrontDraftFormParams = {
  defaultValues: {
    summary: string
    description: string
    instructions: string
    developer_name: string
    developer_website: string
    support_email: string
    support_url: string
    language_codes: string[]
  }
}

type UseStorefrontDraftFormReturn = {
  form: UseFormReturn<StorefrontDraftFormValues>
  languageCodesRegister: UseFormRegisterReturn<'language_codes'>
  handleValidatedSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function useStorefrontDraftForm({ defaultValues }: UseStorefrontDraftFormParams): UseStorefrontDraftFormReturn {
  const form = useForm<StorefrontDraftFormValues>({
    resolver: zodResolver(StorefrontDraftSchema),
    defaultValues,
    mode: 'onSubmit'
  })

  const languageCodesRegister = form.register('language_codes')

  const handleValidatedSubmit = (event: FormEvent<HTMLFormElement>): void => {
    const formElement = event.currentTarget
    event.preventDefault()

    void form.handleSubmit(() => {
      formElement.submit()
    })(event)
  }

  return {
    form,
    languageCodesRegister,
    handleValidatedSubmit
  }
}
