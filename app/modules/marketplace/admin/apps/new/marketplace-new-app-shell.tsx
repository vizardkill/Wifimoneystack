import type { JSX } from 'react'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { Form, Link } from 'react-router'

import { useMarketplaceNewAppForm } from './hooks/use-marketplace-new-app-form'

interface MarketplaceNewAppShellProps {
  autoCreateError: string | null
  actionError: string | null
  isSubmitting: boolean
}

export function MarketplaceNewAppShell({ autoCreateError, actionError, isSubmitting }: MarketplaceNewAppShellProps): JSX.Element {
  const { form, handleValidatedSubmit } = useMarketplaceNewAppForm({ actionError })

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link to="/dashboard/marketplace/apps" className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold text-slate-900">Nueva aplicación</h1>
          <p className="text-sm text-slate-600">Intentamos abrirte directo en el workspace completo. Si falla, usa este formulario de respaldo.</p>
        </div>

        {autoCreateError && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{autoCreateError}</div>}

        {form.formState.errors.root?.message && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{form.formState.errors.root.message}</div>
        )}

        <Form method="post" className="mt-5 space-y-4" noValidate onSubmit={handleValidatedSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Nombre *
              </label>
              <input
                id="name"
                {...form.register('name')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              {form.formState.errors.name?.message && <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                Slug (opcional)
              </label>
              <input
                id="slug"
                {...form.register('slug')}
                placeholder="mi-app"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              {form.formState.errors.slug?.message && <p className="text-xs text-red-600">{form.formState.errors.slug.message}</p>}
              <p className="text-xs text-slate-500">Si lo dejas vacío, se genera automáticamente desde el nombre.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="summary" className="text-sm font-semibold text-slate-700">
                Resumen *
              </label>
              <input
                id="summary"
                {...form.register('summary')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              {form.formState.errors.summary?.message && <p className="text-xs text-red-600">{form.formState.errors.summary.message}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear aplicación
            </button>
            <Link
              to="/dashboard/marketplace/apps"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </Link>
          </div>
        </Form>
      </section>
    </div>
  )
}
