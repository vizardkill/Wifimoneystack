import type { FormEvent } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

const MarketplaceBasicAppWebUrlSchema = z
  .string()
  .trim()
  .optional()
  .superRefine((value, ctx) => {
    if (!value) {
      return
    }

    let parsedUrl: URL

    try {
      parsedUrl = new URL(value)
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La URL web no es válida.'
      })
      return
    }

    if (parsedUrl.protocol !== 'https:') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La URL web debe usar HTTPS.'
      })
    }
  })

const MarketplaceBasicAppSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es requerido.').max(120, 'El nombre no puede superar 120 caracteres.'),
    summary: z.string().trim().min(1, 'El resumen es requerido.').max(300, 'El resumen no puede superar 300 caracteres.'),
    slug: z
      .string()
      .trim()
      .max(120, 'El slug no puede superar 120 caracteres.')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'El slug solo permite minúsculas, números y guiones.'),
    access_mode: z.enum(['WEB_LINK', 'PACKAGE_DOWNLOAD']),
    web_url: MarketplaceBasicAppWebUrlSchema
  })
  .superRefine((data, ctx) => {
    if (data.access_mode === 'WEB_LINK' && !data.web_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['web_url'],
        message: 'La URL web es requerida para apps de tipo WEB_LINK.'
      })
    }
  })

export type MarketplaceBasicAppFormValues = z.infer<typeof MarketplaceBasicAppSchema>

type UseMarketplaceBasicAppFormParams = {
  defaultValues: {
    name: string
    summary: string
    slug: string
    access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
    web_url: string
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
