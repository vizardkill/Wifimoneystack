import type { FormEvent } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

const MarketplaceBasicAppSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido.').max(120, 'El nombre no puede superar 120 caracteres.'),
  summary: z.string().trim().min(1, 'El resumen es requerido.').max(300, 'El resumen no puede superar 300 caracteres.'),
  slug: z
    .string()
    .trim()
    .max(120, 'El slug no puede superar 120 caracteres.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'El slug solo permite minúsculas, números y guiones.')
})

export type MarketplaceBasicAppFormValues = z.infer<typeof MarketplaceBasicAppSchema>

type UseMarketplaceBasicAppFormParams = {
  defaultValues: {
    name: string
    summary: string
    slug: string
  }
}

type UseMarketplaceBasicAppFormReturn = {
  form: UseFormReturn<MarketplaceBasicAppFormValues>
  handleValidatedSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function useMarketplaceBasicAppForm({ defaultValues }: UseMarketplaceBasicAppFormParams): UseMarketplaceBasicAppFormReturn {
  const form = useForm<MarketplaceBasicAppFormValues>({
    resolver: zodResolver(MarketplaceBasicAppSchema),
    defaultValues,
    mode: 'onSubmit'
  })

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
