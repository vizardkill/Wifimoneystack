import type { JSX } from 'react'

import { Loader2 } from 'lucide-react'
import { Form } from 'react-router'

import { useStorefrontDraftForm } from '../hooks/use-storefront-draft-form'
import { LanguageMultiSelect } from './language-multi-select'

interface StorefrontDraftValues {
  summary: string
  description: string
  instructions: string
  developer_name: string
  developer_website: string
  support_email: string | null
  support_url: string | null
  language_codes: string[]
}

interface LanguageCatalogOption {
  code: string
  label: string
  sort_order: number
  is_active: boolean
}

interface StorefrontAuthoringFormProps {
  appId: string
  defaultValues: StorefrontDraftValues
  languageCatalog: LanguageCatalogOption[]
  isSubmitting?: boolean
}

export function StorefrontAuthoringForm({ appId, defaultValues, languageCatalog, isSubmitting = false }: StorefrontAuthoringFormProps): JSX.Element {
  const { form, languageCodesRegister, handleValidatedSubmit } = useStorefrontDraftForm({
    defaultValues: {
      summary: defaultValues.summary,
      description: defaultValues.description,
      instructions: defaultValues.instructions,
      developer_name: defaultValues.developer_name,
      developer_website: defaultValues.developer_website,
      support_email: defaultValues.support_email ?? '',
      support_url: defaultValues.support_url ?? '',
      language_codes: defaultValues.language_codes
    }
  })

  const languageCodesError = form.formState.errors.language_codes
  const languageCodesErrorMessage = typeof languageCodesError?.message === 'string' ? languageCodesError.message : undefined

  return (
    <Form method="post" noValidate onSubmit={handleValidatedSubmit}>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900">Contenido comercial de vitrina</h2>
          <p className="text-sm text-slate-600">Define descripción, instrucciones, desarrollador y compatibilidad de idiomas.</p>
        </div>

        <input type="hidden" name="intent" value="save_storefront_draft" />
        <input type="hidden" name="app_id" value={appId} />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="storefront-summary" className="text-sm font-semibold text-slate-700">
              Resumen comercial
            </label>
            <input
              id="storefront-summary"
              {...form.register('summary')}
              maxLength={300}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Describe el valor principal de la app para la vitrina"
            />
            {form.formState.errors.summary?.message && <p className="text-xs text-red-600">{form.formState.errors.summary.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="storefront-description" className="text-sm font-semibold text-slate-700">
              Descripción extendida
            </label>
            <textarea
              id="storefront-description"
              {...form.register('description')}
              rows={5}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Explica casos de uso, beneficios y contexto comercial"
            />
            {form.formState.errors.description?.message && <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="storefront-instructions" className="text-sm font-semibold text-slate-700">
              Instrucciones de uso
            </label>
            <textarea
              id="storefront-instructions"
              {...form.register('instructions')}
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Incluye pasos de activación o uso inicial"
            />
            {form.formState.errors.instructions?.message && <p className="text-xs text-red-600">{form.formState.errors.instructions.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="storefront-developer-name" className="text-sm font-semibold text-slate-700">
                Desarrollado por
              </label>
              <input
                id="storefront-developer-name"
                {...form.register('developer_name')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="Nombre visible del desarrollador"
              />
              {form.formState.errors.developer_name?.message && <p className="text-xs text-red-600">{form.formState.errors.developer_name.message}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="storefront-developer-website" className="text-sm font-semibold text-slate-700">
                Sitio web del desarrollador
              </label>
              <input
                id="storefront-developer-website"
                {...form.register('developer_website')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="https://..."
              />
              {form.formState.errors.developer_website?.message && <p className="text-xs text-red-600">{form.formState.errors.developer_website.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="storefront-support-email" className="text-sm font-semibold text-slate-700">
                Email de soporte (opcional)
              </label>
              <input
                id="storefront-support-email"
                {...form.register('support_email')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="soporte@tuempresa.com"
              />
              {form.formState.errors.support_email?.message && <p className="text-xs text-red-600">{form.formState.errors.support_email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="storefront-support-url" className="text-sm font-semibold text-slate-700">
                URL de soporte (opcional)
              </label>
              <input
                id="storefront-support-url"
                {...form.register('support_url')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="https://..."
              />
              {form.formState.errors.support_url?.message && <p className="text-xs text-red-600">{form.formState.errors.support_url.message}</p>}
            </div>
          </div>

          <LanguageMultiSelect
            options={languageCatalog}
            selectedCodes={defaultValues.language_codes}
            languageCodesRegister={languageCodesRegister}
            errorMessage={languageCodesErrorMessage}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar borrador de vitrina
            </button>
          </div>
        </div>
      </section>
    </Form>
  )
}
