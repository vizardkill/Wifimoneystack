import type { FormEvent } from 'react'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

const MarketplaceNewAppFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido.').max(120, 'El nombre no puede superar 120 caracteres.'),
  slug: z
    .string()
    .trim()
    .max(120, 'El slug no puede superar 120 caracteres.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'El slug solo permite minúsculas, números y guiones.'),
  summary: z.string().trim().min(1, 'El resumen es requerido.').max(300, 'El resumen no puede superar 300 caracteres.')
})

export type MarketplaceNewAppFormValues = z.infer<typeof MarketplaceNewAppFormSchema>

type UseMarketplaceNewAppFormParams = {
  actionError: string | null
}

type UseMarketplaceNewAppFormReturn = {
  form: UseFormReturn<MarketplaceNewAppFormValues>
  handleValidatedSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function useMarketplaceNewAppForm({ actionError }: UseMarketplaceNewAppFormParams): UseMarketplaceNewAppFormReturn {
  const form = useForm<MarketplaceNewAppFormValues>({
    resolver: zodResolver(MarketplaceNewAppFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      summary: ''
    },
    mode: 'onSubmit'
  })

  useEffect(() => {
    if (!actionError) {
      return
    }

    form.setError('root', { message: actionError })
  }, [actionError, form])

  const handleValidatedSubmit = (event: FormEvent<HTMLFormElement>): void => {
    const formElement = event.currentTarget
    event.preventDefault()

    void form.handleSubmit(() => {
      formElement.submit()
    })(event)
  }

  return {
    form,
    handleValidatedSubmit
  }
}
