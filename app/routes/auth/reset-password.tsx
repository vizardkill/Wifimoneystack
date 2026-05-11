import { type JSX, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { type ActionFunctionArgs, data, type MetaFunction } from 'react-router'
import { Form, Link, useActionData, useNavigation, useSearchParams, useSubmit } from 'react-router'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

import { AuthShell, PasswordStrengthBar } from '@modules/auth'

import { Input } from '@components/ui/input'

import { type ResetPasswordActionResponse } from '@lib/interfaces'
import { ResetPasswordFormSchema, type ResetPasswordFormValues } from '@lib/schemas/auth.schemas'
import { type DataWithResponseInit } from '@lib/types'
import { checkPasswordStrength } from '@lib/utils'

export async function action({ request }: ActionFunctionArgs): Promise<DataWithResponseInit<ResetPasswordActionResponse>> {
  const { resetPasswordController } = await import('@/core/auth/auth.server')

  const { validateRequest: vr } = await import('@lib/helpers/_parse-request.helper')
  const { ResetPasswordSchema } = await import('@lib/schemas/auth.schemas')

  const validation = await vr(request, ResetPasswordSchema)
  if (!validation.success) {
    return validation.response as DataWithResponseInit<ResetPasswordActionResponse>
  }

  const response = await resetPasswordController(validation.data)
  return data(response)
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Restablecer Contraseña - WMC Marketplace' },
    { name: 'description', content: 'Crea una nueva contraseña para volver a acceder al marketplace WMC.' }
  ]
}

export default function ResetPasswordPage(): JSX.Element {
  const actionData = useActionData<typeof action>()
  const nav = useNavigation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isLoading = nav.state === 'submitting'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: 'onSubmit'
  })
  const submit = useSubmit()

  const passwordValue = watch('password', '')

  if (actionData && !actionData.error) {
    return (
      <AuthShell mode="reset" title="" subtitle="">
        <Card className="border-0 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold">¡Contraseña actualizada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{actionData.message}</p>
            <Button asChild className="h-12 w-full text-base font-semibold">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell mode="reset" title="Restablecer contraseña" subtitle="Definí tu nueva contraseña para volver al stack">
      {actionData?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionData.message}</AlertDescription>
        </Alert>
      )}
      {!token && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Token de recuperación inválido o no proporcionado.</AlertDescription>
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
        <input type="hidden" name="token" value={token || ''} />

        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              disabled={isLoading || !token}
              {...register('password')}
              className={errors.password ? 'h-11 border-red-500 pr-10' : 'h-11 pr-10'}
            />
            <button
              type="button"
              disabled={isLoading || !token}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          <PasswordStrengthBar strength={checkPasswordStrength(passwordValue)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              disabled={isLoading || !token}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'h-11 border-red-500 pr-10' : 'h-11 pr-10'}
            />
            <button
              type="button"
              disabled={isLoading || !token}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading || !token}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restableciendo...
            </>
          ) : (
            'Restablecer contraseña'
          )}
        </Button>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthShell>
  )
}
