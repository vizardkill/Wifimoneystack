import type { FormEvent } from 'react'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

const MarketplaceAdminPromotionSchema = z.object({
  email: z.string().trim().min(1, 'El email es requerido.').email('Ingresa un correo electrónico válido.')
})

export type MarketplaceAdminPromotionValues = z.infer<typeof MarketplaceAdminPromotionSchema>

type UseMarketplaceAdminPromotionFormParams = {
  actionMessage?: string
  actionError?: boolean
}

type UseMarketplaceAdminPromotionFormReturn = {
  form: UseFormReturn<MarketplaceAdminPromotionValues>
  handleValidatedSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function useMarketplaceAdminPromotionForm({
  actionMessage,
  actionError
}: UseMarketplaceAdminPromotionFormParams): UseMarketplaceAdminPromotionFormReturn {
  const form = useForm<MarketplaceAdminPromotionValues>({
    resolver: zodResolver(MarketplaceAdminPromotionSchema),
    defaultValues: {
      email: ''
    },
    mode: 'onSubmit'
  })

  useEffect(() => {
    if (!actionError || typeof actionMessage !== 'string') {
      return
    }

    form.setError('root', { message: actionMessage })
  }, [actionError, actionMessage, form])

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
