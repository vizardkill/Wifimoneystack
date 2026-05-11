import type { JSX } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { type ActionFunctionArgs, data, type MetaFunction } from 'react-router'
import { Form, Link, useActionData, useNavigation, useSubmit } from 'react-router'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { AuthShell } from '@modules/auth'

import { validateRequest } from '@lib/helpers/_parse-request.helper'
import { type ForgotPasswordActionResponse } from '@lib/interfaces'
import { type ForgotPasswordPayload, ForgotPasswordSchema } from '@lib/schemas/auth.schemas'
import { type DataWithResponseInit } from '@lib/types'

export async function action({ request }: ActionFunctionArgs): Promise<DataWithResponseInit<ForgotPasswordActionResponse>> {
  const { forgotPasswordController } = await import('@/core/auth/auth.server')

  const validation = await validateRequest(request, ForgotPasswordSchema)
  if (!validation.success) {
    return validation.response as DataWithResponseInit<ForgotPasswordActionResponse>
  }

  const response = await forgotPasswordController(validation.data.email)
  return data(response)
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Recuperar Contraseña - WMC Marketplace' },
    { name: 'description', content: 'Recuperá el acceso al marketplace WMC ingresando tu correo electrónico.' }
  ]
}

export default function ForgotPasswordPage(): JSX.Element {
  const actionData = useActionData<typeof action>()
  const nav = useNavigation()
  const isLoading = nav.state === 'submitting'

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onSubmit'
  })
  const submit = useSubmit()

  if (actionData && !actionData.error) {
    return (
      <AuthShell mode="forgot" title="" subtitle="">
        <Card className="border-0 shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold">Revisa tu correo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{actionData.message}</p>
            <Button variant="link" asChild>
              <Link to="/login">Volver a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell mode="forgot" title="¿Olvidaste tu contraseña?" subtitle="Ingresa tu correo y te enviaremos un enlace seguro">
      {actionData?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionData.message}</AlertDescription>
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
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            className={errors.email ? 'h-11 border-red-500' : 'h-11'}
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar enlace de recuperación'
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
