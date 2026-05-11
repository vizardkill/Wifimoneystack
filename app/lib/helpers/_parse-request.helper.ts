import { data } from 'react-router'
import { type ZodError, type ZodSchema } from 'zod'

/**
 * Parsea el body de una Request independientemente de si llega como
 * application/x-www-form-urlencoded, multipart/form-data o application/json.
 * Devuelve un Record<string, string> con primitivos normalizados a string.
 */
export async function parseRequestBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const json = (await request.json()) as Record<string, unknown>
      return Object.fromEntries(
        Object.entries(json).map(([k, v]) => {
          if (typeof v === 'string') {
            return [k, v]
          }
          if (typeof v === 'number' || typeof v === 'boolean') {
            return [k, String(v)]
          }
          return [k, '']
        })
      )
    } catch {
      return {}
    }
  }

  try {
    const formData = await request.formData()
    return Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']))
  } catch {
    return {}
  }
}

/**
 * Formatea el primer error de un ZodError como mensaje legible en español.
 */
export function formatZodError(error: ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos'
}

/**
 * Extrae un mapa campo → primer mensaje de error de un ZodError.
 * Útil para enviar errores por campo al cliente.
 */
export function extractFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !(field in fieldErrors)) {
      fieldErrors[field] = issue.message
    }
  }
  return fieldErrors
}

/**
 * Valida el body de una Request contra un schema Zod.
 * Si falla devuelve una Response 422 lista para retornar desde el action.
 * Si pasa devuelve `{ data: T }`.
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: ReturnType<typeof data> }> {
  const fields = await parseRequestBody(request)
  const result = schema.safeParse(fields)

  if (!result.success) {
    return {
      success: false,
      response: data({ error: true, message: formatZodError(result.error), fieldErrors: extractFieldErrors(result.error) }, { status: 422 })
    }
  }

  return { success: true, data: result.data }
}
