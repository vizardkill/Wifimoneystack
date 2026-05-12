import type { JSX } from 'react'

import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, useActionData, useLoaderData, useNavigation } from 'react-router'

import { CONFIG_PROMOTE_USER_TO_ADMIN } from '@types'

type LoaderData = {
  admins: Array<{
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'SUPERADMIN'
    created_at: Date
  }>
  current_role: 'ADMIN' | 'SUPERADMIN'
}

type ActionData = {
  error?: boolean
  message?: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { listAdminAccountsController } = await import('@/core/auth/auth.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }

  if (user.role !== 'SUPERADMIN') {
    throw redirect('/dashboard/marketplace')
  }

  const result = await listAdminAccountsController({ actor_user_id: user.id })

  if (result.error) {
    return data<LoaderData>({ admins: [], current_role: 'SUPERADMIN' })
  }

  return data<LoaderData>({
    admins: result.data?.admins ?? [],
    current_role: 'SUPERADMIN'
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { promoteUserToAdminController } = await import('@/core/auth/auth.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }

  if (user.role !== 'SUPERADMIN') {
    return data<ActionData>({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const emailRaw = formData.get('email')
  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : ''

  if (!email) {
    return data<ActionData>({ error: true, message: 'El email es requerido.' }, { status: 400 })
  }

  const result = await promoteUserToAdminController({
    actor_user_id: user.id,
    target_email: email
  })

  if (result.error) {
    const statusCode =
      result.status === CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.AlreadyAdmin
        ? 409
        : result.status === CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.NotFound
          ? 404
          : result.status === CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.Forbidden
            ? 403
            : 400

    return data<ActionData>({ error: true, message: result.message ?? 'No se pudo promover el administrador.' }, { status: statusCode })
  }

  return data<ActionData>({ error: false, message: 'Administrador promovido correctamente.' })
}

export default function AdminsPage(): JSX.Element {
  const { admins } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Administradores</h1>
        <p className="mt-1 text-sm text-slate-600">Solo superadmins pueden promover cuentas existentes a rol administrativo.</p>

        <Form method="post" className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-900">
              Email de la cuenta a promover
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="usuario@empresa.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Promoviendo...' : 'Promover a admin'}
          </button>
        </Form>
      </section>

      {actionData?.message && (
        <div
          className={`rounded-xl border p-4 text-sm ${actionData.error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}
        >
          {actionData.message}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cuentas administrativas</h2>
        </div>

        {admins.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No hay cuentas administrativas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{admin.name ?? 'Sin nombre'}</td>
                    <td className="px-4 py-3 text-slate-600">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          admin.role === 'SUPERADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
