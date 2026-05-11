import type { JSX } from 'react'

import { AlertCircle, CheckCircle } from 'lucide-react'
import { data, type LoaderFunctionArgs, type MetaFunction } from 'react-router'
import { Link, useFetcher, useLoaderData } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { AuthShell } from '@modules/auth'

import { Input } from '@components/ui/input'

import { type ResendVerificationResponse, type VerificationStatusLoaderResponse } from '@lib/interfaces'
import { type DataWithResponseInit } from '@lib/types'

export async function loader({ request }: LoaderFunctionArgs): Promise<DataWithResponseInit<VerificationStatusLoaderResponse>> {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'error'
  const message = url.searchParams.get('message') || 'Ha ocurrido un error inesperado.'
  return data({ status, message })
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Estado de Verificación - WMC Marketplace' },
    { name: 'description', content: 'Consultá el estado de validación de tu cuenta y reenviá el enlace si es necesario.' }
  ]
}

export default function VerificationStatusPage(): JSX.Element {
  const { status, message } = useLoaderData<VerificationStatusLoaderResponse>()

  const fetcher = useFetcher<ResendVerificationResponse>()
  const isError = status === 'error'
  const isPartialSuccess = status === 'partial_success'
  const isResending = fetcher.state === 'submitting'

  // Estados del fetcher para el reenvío
  const fetcherHasError = fetcher.data?.error === true
  const fetcherIsSuccess = fetcher.data?.error === false
  const fetcherMessage = fetcher.data?.message ?? null
  const defaultEmail = typeof document !== 'undefined' ? new URLSearchParams(document.location.search).get('email') || '' : ''

  const Icon = isError ? AlertCircle : isPartialSuccess ? AlertCircle : CheckCircle
  const iconColor = isError ? 'text-red-600' : isPartialSuccess ? 'text-yellow-600' : 'text-green-600'
  const bgColor = isError ? 'bg-red-100' : isPartialSuccess ? 'bg-yellow-100' : 'bg-green-100'
  const title = isError ? 'Error de Verificación' : isPartialSuccess ? '¡Cuenta Creada!' : 'Verificación Exitosa'

  const canResend = (isError && message.toLowerCase().includes('expirado')) || isPartialSuccess

  return (
    <AuthShell mode="verify" title="" subtitle="">
      <Card className="border-0 shadow-lg text-center">
        <CardHeader>
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${bgColor} mb-2`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isPartialSuccess ? 'Tu cuenta ha sido creada exitosamente, pero hubo un problema al enviar el correo de verificación.' : message}
          </p>

          {canResend && (
            <fetcher.Form method="post" action="/api/v1/auth/sessions/resend" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isPartialSuccess
                  ? 'Ingresa tu correo electrónico para recibir el enlace de verificación.'
                  : 'Ingresa tu correo electrónico para recibir un nuevo enlace.'}
              </p>
              <Input name="email" type="email" disabled={isResending} placeholder="tu@correo.com" defaultValue={defaultEmail} className="h-11" required />
              <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isResending}>
                {isResending ? 'Enviando...' : 'Reenviar Enlace'}
              </Button>

              {fetcherHasError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="flex items-center text-sm text-red-600">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {fetcherMessage || 'Error al reenviar el correo. Inténtalo de nuevo.'}
                  </p>
                </div>
              )}

              {fetcherIsSuccess && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="flex items-center text-sm text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {fetcherMessage || 'Correo de verificación enviado exitosamente.'}
                  </p>
                </div>
              )}
            </fetcher.Form>
          )}

          <Button variant="link" asChild>
            <Link to={isError || isPartialSuccess ? '/signup' : '/login'}>{isError || isPartialSuccess ? 'Volver a Registrarse' : 'Ir a Iniciar Sesión'}</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
