import type { JSX } from 'react'

import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { useActionData, useLoaderData, useNavigation } from 'react-router'

import { MarketplaceAdminAdminsShell } from '@modules/marketplace/admin/admins'

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
    <MarketplaceAdminAdminsShell admins={admins} isSubmitting={isSubmitting} actionMessage={actionData?.message} actionError={actionData?.error ?? false} />
  )
}
