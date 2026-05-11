import { z } from 'zod'

// ─── Constantes de validación ─────────────────────────────────────────────────

/** Códigos ISO de países habilitados — deben coincidir con la tabla `countries` */
export const ENABLED_COUNTRY_CODES = ['AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'UY', 'VE'] as const

// ─── Schemas de campos base ───────────────────────────────────────────────────

const emailField = z.string().min(1, 'El email es requerido').email('El email no es válido').toLowerCase().trim()

const passwordField = z.string().min(1, 'La contraseña es requerida')

export const strongPasswordField = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un símbolo')

const countryField = z
  .string()
  .min(1, 'El país es requerido')
  .toUpperCase()
  .trim()
  // La verificación definitiva de existencia en BD la hace _validatePayload,
  // aquí solo chequeamos que sea un código de 2 letras para cortar ruido obvio
  .regex(/^[A-Z]{2}$/, 'El país seleccionado no es válido')

// ─── Schemas por acción ───────────────────────────────────────────────────────

export const SignupSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(40).trim(),
  last_name: z.string().min(1, 'Los apellidos son requeridos').max(40).trim(),
  email: emailField,
  password: strongPasswordField,
  country_id: countryField
})

export const LoginSchema = z.object({
  email: emailField,
  password: passwordField
})

export const ForgotPasswordSchema = z.object({
  email: emailField
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  password: strongPasswordField
})

export const ResendVerifyEmailSchema = z.object({
  email: emailField
})

export const GoogleRegisterSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(40).trim(),
  last_name: z.string().min(1, 'Los apellidos son requeridos').max(40).trim(),
  email: emailField,
  country_id: countryField,
  google_id: z.string().min(1, 'Google ID requerido'),
  access_token: z.string().min(1, 'Access token requerido'),
  picture: z.string().optional(),
  verified_email: z.string().optional()
})

// ─── Schemas cliente (incluyen campos form extra no enviados al server) ─────────

/** Schema para el formulario de registro en cliente: añade password_repeat y terms */
export const SignupFormSchema = SignupSchema.extend({
  provider: z.enum(['google', 'local']).default('local'),
  password: z.string().optional(),
  password_repeat: z.string().optional(),
  terms: z.literal(true, { message: 'Debes aceptar los términos y condiciones' })
}).superRefine((data, ctx) => {
  if (data.provider === 'google') {
    return
  }

  const passwordResult = strongPasswordField.safeParse(data.password ?? '')
  if (!passwordResult.success) {
    for (const issue of passwordResult.error.issues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: issue.message,
        path: ['password']
      })
    }
  }

  if (!data.password_repeat) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Repite la contraseña',
      path: ['password_repeat']
    })
    return
  }

  if (data.password !== data.password_repeat) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Las contraseñas no coinciden',
      path: ['password_repeat']
    })
  }
})

/** Schema para el formulario de restablecimiento de contraseña en cliente */
export const ResetPasswordFormSchema = z
  .object({
    password: strongPasswordField,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type SignupPayload = z.infer<typeof SignupSchema>
export type LoginPayload = z.infer<typeof LoginSchema>
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>
export type ResendVerifyEmailPayload = z.infer<typeof ResendVerifyEmailSchema>
export type GoogleRegisterPayload = z.infer<typeof GoogleRegisterSchema>
export type SignupFormValues = z.infer<typeof SignupFormSchema>
export type SignupFormInputValues = z.input<typeof SignupFormSchema>
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>
