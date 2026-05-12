import type { JSX } from 'react'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, Link, useActionData, useLoaderData, useNavigation } from 'react-router'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { db } = await import('@/db.server')

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
  if (!params.appId) {
    throw redirect('/dashboard/marketplace/apps')
  }

  const app = await db.marketplaceApp.findUnique({
    where: { id: params.appId },
    include: {
      media: { orderBy: { sort_order: 'asc' } },
      artifacts: { orderBy: { created_at: 'desc' }, take: 5 }
    }
  })

  if (!app) {
    throw redirect('/dashboard/marketplace/apps')
  }

  return data({ app, actor_id: user.id })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_UpsertMarketplaceApp } = await import('@/core/marketplace/marketplace.server')
  const { db } = await import('@/db.server')

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
  if (!params.appId) {
    throw redirect('/dashboard/marketplace/apps')
  }

  const formData = await request.formData()
  const nameRaw = formData.get('name')
  const slugFormValue = formData.get('slug')
  const summaryRaw = formData.get('summary')

  const name = typeof nameRaw === 'string' ? nameRaw.trim() : ''
  const slugRaw = typeof slugFormValue === 'string' ? slugFormValue.trim() : ''
  const summary = typeof summaryRaw === 'string' ? summaryRaw.trim() : ''

  const existingApp = await db.marketplaceApp.findUnique({
    where: { id: params.appId },
    select: {
      description: true,
      instructions: true,
      access_mode: true,
      web_url: true
    }
  })

  if (!existingApp) {
    return data({ error: true, message: 'No se encontró la aplicación a editar.' }, { status: 404 })
  }

  if (!name || !summary) {
    return data({ error: true, message: 'Nombre y resumen son requeridos.' })
  }

  const result = await new CLS_UpsertMarketplaceApp({
    id: params.appId,
    actor_user_id: user.id,
    name,
    slug: slugRaw || undefined,
    summary,
    description: existingApp.description,
    instructions: existingApp.instructions,
    access_mode: existingApp.access_mode,
    web_url: existingApp.web_url ?? undefined
  }).main()

  if (result.error) {
    return data({ error: true, message: result.message })
  }

  return data({ success: true, message: 'Aplicación actualizada correctamente.' })
}

export default function EditAppPage(): JSX.Element {
  const { app } = useLoaderData<typeof loader>()
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
          <h1 className="font-heading text-2xl font-bold text-slate-900">Editar: {app.name}</h1>
          <p className="text-sm text-slate-600">Actualiza la información base de la aplicación para mantener el catálogo ordenado y legible.</p>
        </div>

        {actionData && 'error' in actionData && actionData.error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionData.message}</div>
        )}
        {actionData && 'success' in actionData && actionData.success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{actionData.message}</div>
        )}

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
                defaultValue={app.name}
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
                defaultValue={app.slug}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              <p className="text-xs text-slate-500">Si lo vacías, se conserva o genera desde el nombre automáticamente.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="summary" className="text-sm font-semibold text-slate-700">
                Resumen *
              </label>
              <input
                id="summary"
                name="summary"
                required
                defaultValue={app.summary}
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
              Guardar cambios
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
