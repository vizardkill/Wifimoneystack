import type { JSX } from 'react'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, Link, useActionData, useNavigation } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    throw redirect('/dashboard')
  }

  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_UpsertMarketplaceApp } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const nameRaw = formData.get('name')
  const slugFormValue = formData.get('slug')
  const summaryRaw = formData.get('summary')

  const name = typeof nameRaw === 'string' ? nameRaw.trim() : ''
  const slugRaw = typeof slugFormValue === 'string' ? slugFormValue.trim() : ''
  const summary = typeof summaryRaw === 'string' ? summaryRaw.trim() : ''

  if (!name || !summary) {
    return data({ error: true, message: 'Nombre y resumen son requeridos.' })
  }

  const result = await new CLS_UpsertMarketplaceApp({
    actor_user_id: user.id,
    name,
    slug: slugRaw || undefined,
    summary,
    description: '',
    instructions: '',
    access_mode: 'WEB_LINK',
    web_url: undefined
  }).main()

  if (result.error) {
    return data({ error: true, message: result.message })
  }

  throw redirect(`/dashboard/marketplace/apps/${result.data!.app_id}/edit`)
}

export default function NewAppPage(): JSX.Element {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

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
          <p className="text-sm text-slate-600">Crea una aplicación con los datos mínimos y complétala después desde la edición.</p>
        </div>

        {actionData?.error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionData.message}</div>}

        <Form method="post" className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Nombre *
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                Slug (opcional)
              </label>
              <input
                id="slug"
                name="slug"
                placeholder="mi-app"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              <p className="text-xs text-slate-500">Si lo dejas vacío, se genera automáticamente desde el nombre.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="summary" className="text-sm font-semibold text-slate-700">
                Resumen *
              </label>
              <input
                id="summary"
                name="summary"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
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
