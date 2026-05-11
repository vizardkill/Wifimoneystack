import type { JSX } from 'react'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, type MetaFunction, redirect } from 'react-router'
import { Form, Link, useSubmit } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { commitSession } from '@/core/auth/cookie.server'

import { AuthShell, GoogleAuthButton, LoginAlerts, useLoginPage } from '@modules/auth'

import { validateRequest } from '@lib/helpers/_parse-request.helper'
import { LoginSchema } from '@lib/schemas/auth.schemas'

import { type CONFIG_LOGIN_USER, type DataWithResponseInit } from '@types'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response | null> {
  const { getSession } = await import('@/core/auth/cookie.server')
  const session = await getSession(request.headers.get('Cookie'))
  const tokenValue: unknown = session.get('token')
  const token = typeof tokenValue === 'string' ? tokenValue : ''
  if (token.length > 0) {
    return redirect('/')
  }
  return null
}

export async function action({ request }: ActionFunctionArgs): Promise<Response | DataWithResponseInit<CONFIG_LOGIN_USER.RequestResponse>> {
  const { loginController } = await import('@/core/auth/auth.server')
  const { userSessionStorage } = await import('@/core/auth/cookie.server')

  const validation = await validateRequest(request, LoginSchema)
  if (!validation.success) {
    return validation.response as DataWithResponseInit<CONFIG_LOGIN_USER.RequestResponse>
  }

  const response = await loginController(validation.data)

  if (!response.error && response.data?.token) {
    const session = await userSessionStorage.getSession(request.headers.get('Cookie'))
    session.set('token', response.data.token)

    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  }

  return data(response)
}

export const meta: MetaFunction = () => {
  return [{ title: 'Iniciar Sesión - WMC Marketplace' }, { name: 'description', content: 'Accedé al stack de 21 aplicaciones ecommerce de Wifi Money Code.' }]
}

export default function LoginPage(): JSX.Element {
  const {
    form,
    showPassword,
    setShowPassword,
    isLoading,
    isResending,
    needsVerification,
    successMessage,
    fetcherMessage,
    fetcherHasError,
    fetcherIsSuccess,
    actionData,
    handleResend
  } = useLoginPage()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = form
  const submit = useSubmit()

  return (
    <AuthShell mode="login" title="Iniciar sesión" subtitle="Accedé al marketplace de apps ecommerce">
      <LoginAlerts
        fetcherMessage={fetcherMessage}
        fetcherHasError={fetcherHasError}
        fetcherIsSuccess={fetcherIsSuccess}
        needsVerification={needsVerification}
        actionMessage={actionData?.message}
        successMessage={successMessage}
        generalError={errors.root?.message}
        isResending={isResending}
        onResend={handleResend}
      />

      <Form
        method="post"
        className="space-y-4"
        onSubmit={(e) => {
          const formElement = e.currentTarget
          void handleSubmit(() => {
            void submit(formElement)
          })(e)
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register('email')}
            className={errors.email ? 'h-11 border-red-500' : 'h-11'}
            disabled={isLoading}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              {...register('password')}
              className={errors.password ? 'h-11 border-red-500 pr-10' : 'h-11 pr-10'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o continúa con</span>
        </div>
      </div>

      <GoogleAuthButton mode="login" disabled={isLoading} />

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{' '}
        <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </AuthShell>
  )
}
