import type { JSX } from 'react'

import { AlertCircle, CheckCircle as CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, type MetaFunction, redirect } from 'react-router'
import { Form, Link, useLoaderData, useSubmit } from 'react-router'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { AuthShell, GoogleAuthButton, GooglePrefillInfo, PasswordStrengthBar, useSignupPage } from '@modules/auth'

import { CountrySelector } from '@components/ui/country-select'

import { type SignupLoaderData } from '@lib/interfaces'

import { type CONFIG_REGISTER_USER, type DataWithResponseInit } from '@types'

type GoogleRegisterResponse = CONFIG_REGISTER_USER.RequestResponse

export async function loader({ request }: LoaderFunctionArgs): Promise<DataWithResponseInit<SignupLoaderData> | Response> {
  const { destroySession, getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { getReturnToFromRequest } = await import('@/core/auth/subapp-session.server')
  const session = await getSession(request.headers.get('Cookie'))
  const tokenValue: unknown = session.get('token')
  const token = typeof tokenValue === 'string' ? tokenValue : ''

  if (token.length > 0) {
    const user = verifyUserToken(token)

    if (user) {
      return redirect('/')
    }

    return redirect('/signup', {
      headers: {
        'Set-Cookie': await destroySession(session)
      }
    })
  }

  // Obtener parámetros de URL para pre-llenar datos de Google
  const url = new URL(request.url)
  const googleData = {
    provider: url.searchParams.get('provider'),
    prefill: url.searchParams.get('prefill'),
    email: url.searchParams.get('email'),
    first_name: url.searchParams.get('first_name'),
    last_name: url.searchParams.get('last_name'),
    google_id: url.searchParams.get('google_id'),
    verified_email: url.searchParams.get('verified_email'),
    picture: url.searchParams.get('picture'),
    access_token: url.searchParams.get('access_token')
  }

  const returnTo = getReturnToFromRequest(request)

  return data({ googleData, returnTo })
}

/**
 * Extrae los campos del body usando el helper compartido.
 */
export async function action({ request }: ActionFunctionArgs): Promise<DataWithResponseInit<CONFIG_REGISTER_USER.RequestResponse>> {
  const { parseRequestBody } = await import('@lib/helpers/_parse-request.helper')
  // Clonamos antes de leer para preservar el stream original para validateRequest
  const fields = await parseRequestBody(request.clone())
  const get = (key: string): string => (typeof fields[key] === 'string' ? fields[key] : '')

  const provider = get('provider')

  // Si es registro con Google, usar el endpoint específico
  if (provider === 'google') {
    const googleData = {
      country_id: get('country_id'),
      google_id: get('google_id'),
      email: get('email'),
      first_name: get('first_name'),
      last_name: get('last_name'),
      picture: get('picture'),
      verified_email: get('verified_email'),
      access_token: get('access_token')
    }

    const googleFormData = new FormData()
    Object.entries(googleData).forEach(([key, value]) => {
      if (value) {
        googleFormData.append(key, value)
      }
    })

    const url = new URL('/api/v1/auth/oauth/google/register', request.url).toString()

    const response = await fetch(url, {
      method: 'POST',
      body: googleFormData
    })

    if (response.redirected) {
      throw redirect(response.url) as unknown as Error
    }

    const result = (await response.json()) as GoogleRegisterResponse
    return data(result)
  }

  // Registro normal — validar con Zod antes de llamar al controller
  const { validateRequest } = await import('@lib/helpers/_parse-request.helper')
  const { SignupSchema } = await import('@lib/schemas/auth.schemas')
  const validation = await validateRequest(request, SignupSchema)
  if (!validation.success) {
    return validation.response as DataWithResponseInit<CONFIG_REGISTER_USER.RequestResponse>
  }

  const { signUpController } = await import('@/core/auth/auth.server')
  const response = await signUpController(validation.data)
  return data(response)
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Crear Cuenta - WMC Marketplace' },
    { name: 'description', content: 'Registrate en el marketplace de aplicaciones ecommerce de Wifi Money Code.' }
  ]
}

export default function SignUpPage(): JSX.Element {
  const loaderData = useLoaderData<SignupLoaderData>()
  const { form, showPassword, setShowPassword, strength, isLoading, isGoogleRegistration, actionData } = useSignupPage(loaderData)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = form
  const submit = useSubmit()

  // Renderizar página cuando el usuario ya existía sin verificar y se reenvió el correo
  if (actionData?.status === 'pending_verification') {
    return (
      <AuthShell mode="verify" title="" subtitle="">
        <Card className="border-0 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <MailCheck className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold">Correo reenviado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Ya tenías una cuenta registrada con este correo. Te hemos reenviado el enlace de verificación.</p>
            <p className="text-xs text-muted-foreground">Revisa tu bandeja de entrada y la carpeta de spam.</p>
            <Button variant="link" asChild>
              <Link to="/login">Ir a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  // Renderizar página de éxito parcial (cuenta creada pero falló email)
  if (actionData?.status === 'partial_success') {
    return (
      <AuthShell mode="verify" title="Cuenta creada" subtitle="Solo falta validar tu correo para activar el acceso completo">
        <Card className="border-0 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl font-bold">¡Cuenta Creada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Tu cuenta ha sido creada exitosamente, pero hubo un problema al enviar el correo de verificación.</p>
            <p className="text-xs text-muted-foreground">Haz clic en el botón para reenviar el correo de verificación.</p>
            <Button asChild className="h-12 w-full text-base font-semibold">
              <Link
                to={`/verification-status?status=partial_success&message=${encodeURIComponent(actionData.message || '')}&email=${encodeURIComponent(form.getValues('email'))}`}
              >
                Reenviar Correo de Verificación
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link to={loaderData.returnTo ? `/login?returnTo=${encodeURIComponent(loaderData.returnTo)}` : '/login'}>Ir a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (actionData && !actionData.error) {
    const successTitle = isGoogleRegistration ? '¡Registro con Google completado!' : '¡Revisa tu correo!'
    const successMessage = isGoogleRegistration
      ? 'Tu cuenta fue creada correctamente con Google. Ya puedes iniciar sesión para continuar.'
      : 'Hemos enviado un enlace de verificación a tu dirección de correo electrónico. Haz clic en el enlace para activar tu cuenta.'
    const successButtonLabel = 'Ir a Iniciar Sesión'
    const SuccessIcon = isGoogleRegistration ? CheckCircle2 : MailCheck

    return (
      <AuthShell mode="verify" title="" subtitle="">
        <Card className="border-0 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <SuccessIcon className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold">{successTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{successMessage}</p>
            <Button variant="link" asChild>
              <Link to={loaderData.returnTo ? `/login?returnTo=${encodeURIComponent(loaderData.returnTo)}` : '/login'}>{successButtonLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell mode="signup" title="Crear cuenta" subtitle="Solicitá acceso al stack WMC">
      <GooglePrefillInfo isVisible={isGoogleRegistration} />

      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

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
        {/* Campos ocultos para registro con Google */}
        {isGoogleRegistration && (
          <>
            <input type="hidden" name="provider" value="google" />
            <input type="hidden" name="google_id" value={loaderData.googleData.google_id || ''} />
            <input type="hidden" name="picture" value={loaderData.googleData.picture || ''} />
            <input type="hidden" name="verified_email" value={loaderData.googleData.verified_email || ''} />
            <input type="hidden" name="access_token" value={loaderData.googleData.access_token || ''} />
          </>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="Tu nombre"
              {...register('first_name')}
              className={errors.first_name ? 'h-11 border-red-500' : 'h-11'}
              disabled={isLoading}
            />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Apellidos</Label>
            <Input
              id="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="Tus apellidos"
              {...register('last_name')}
              className={errors.last_name ? 'h-11 border-red-500' : 'h-11'}
              disabled={isLoading}
            />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'h-11 border-red-500' : 'h-11'}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}{' '}
              {actionData?.suggestion === 'login' && (
                <>
                  <Link to="/login" className="font-medium underline underline-offset-2 hover:opacity-80">
                    Inicia sesión
                  </Link>{' '}
                  o{' '}
                  <Link to="/forgot-password" className="font-medium underline underline-offset-2 hover:opacity-80">
                    recupera tu contraseña
                  </Link>
                  .
                </>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <CountrySelector
            id="country_id"
            name="country_id"
            disabled={isLoading}
            value={watch('country_id')}
            onChange={(value) => setValue('country_id', value || '', { shouldValidate: true })}
            placeholder="Selecciona tu país..."
            className={errors.country_id ? 'border-red-500' : ''}
          />
          {errors.country_id && <p className="text-sm text-red-500">{errors.country_id.message}</p>}
        </div>

        {/* Password Fields - Solo mostrar si NO es registro con Google */}
        {!isGoogleRegistration && (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  autoComplete="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8+ caracteres, mayúsculas, números..."
                  {...register('password')}
                  className={errors.password ? 'h-11 border-red-500 pr-10' : 'h-11 pr-10'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {strength > 0 && <PasswordStrengthBar strength={strength} />}
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_repeat">Repite la contraseña</Label>
              <Input
                id="password_repeat"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                {...register('password_repeat')}
                className={errors.password_repeat ? 'h-11 border-red-500' : 'h-11'}
                disabled={isLoading}
              />
              {errors.password_repeat && <p className="text-sm text-red-500">{errors.password_repeat.message}</p>}
            </div>
          </>
        )}

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              disabled={isLoading}
              checked={Boolean(watch('terms'))}
              onCheckedChange={(checked) => setValue('terms', checked === true ? true : (undefined as unknown as true), { shouldValidate: true })}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm">
              Acepto los{' '}
              <Link to="/terms" className="underline-offset-4 hover:underline">
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/privacy" className="underline-offset-4 hover:underline">
                política de privacidad
              </Link>
            </Label>
          </div>
          {errors.terms && <p className="text-sm text-red-500">{errors.terms.message}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isGoogleRegistration ? 'Completando registro...' : 'Creando cuenta...'}
            </>
          ) : isGoogleRegistration ? (
            'Completar Registro con Google'
          ) : (
            'Crear Cuenta'
          )}
        </Button>
      </Form>

      {/* Divider + Google - Solo mostrar si NO es registro con Google */}
      {!isGoogleRegistration && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o continúa con</span>
            </div>
          </div>
          <GoogleAuthButton mode="signup" disabled={isLoading} />
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link
          to={loaderData.returnTo ? `/login?returnTo=${encodeURIComponent(loaderData.returnTo)}` : '/login'}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Inicia sesión aquí
        </Link>
      </p>
    </AuthShell>
  )
}
