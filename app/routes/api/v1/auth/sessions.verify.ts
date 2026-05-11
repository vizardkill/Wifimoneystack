import { type LoaderFunctionArgs, redirect } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const { verifyEmailController } = await import('@/core/auth/auth.server')
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return redirect(`/verification-status?status=error&message=${encodeURIComponent('Token de verificación inválido o no proporcionado.')}`)
  }

  const result = await verifyEmailController(token)
  const status = result.error ? 'error' : 'success'
  const message = encodeURIComponent(result.message ?? 'No se pudo verificar el correo.')

  return redirect(`/verification-status?status=${status}&message=${message}`)
}
