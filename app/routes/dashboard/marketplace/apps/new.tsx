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
  if (user.role !== 'ADMIN') {
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
  if (user.role !== 'ADMIN') {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const summary = formData.get('summary') as string | null
  const description = formData.get('description') as string | null
  const instructions = formData.get('instructions') as string | null
  const access_mode = formData.get('access_mode') as 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  const web_url = formData.get('web_url') as string | null

  if (!name || !slug) {
    return data({ error: true, message: 'Nombre, slug y modo de acceso son requeridos.' })
  }

  const result = await new CLS_UpsertMarketplaceApp({
    actor_user_id: user.id,
    name,
    slug,
    summary: summary ?? '',
    description: description ?? '',
    instructions: instructions ?? '',
    access_mode,
    web_url: web_url ?? undefined
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
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/dashboard/marketplace/apps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-mp-charcoal)]">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>
      <h1 className="font-heading text-2xl font-bold text-[var(--color-mp-charcoal)]">Nueva aplicación</h1>

      {actionData?.error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionData.message}</div>}

      <Form method="post" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre *
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug *
            </label>
            <input
              id="slug"
              name="slug"
              required
              placeholder="mi-app"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label htmlFor="summary" className="text-sm font-medium">
              Resumen
            </label>
            <input
              id="summary"
              name="summary"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label htmlFor="instructions" className="text-sm font-medium">
              Instrucciones
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label htmlFor="access_mode" className="text-sm font-medium">
              Modo de acceso *
            </label>
            <select
              id="access_mode"
              name="access_mode"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            >
              <option value="WEB_LINK">Enlace web</option>
              <option value="PACKAGE_DOWNLOAD">Descarga de paquete</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1">
            <label htmlFor="web_url" className="text-sm font-medium">
              URL de la aplicación
            </label>
            <input
              id="web_url"
              name="web_url"
              type="url"
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-mp-charcoal)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear aplicación
          </button>
          <Link to="/dashboard/marketplace/apps" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
        </div>
      </Form>
    </div>
  )
}
