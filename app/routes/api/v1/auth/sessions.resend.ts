import { type ActionFunctionArgs, data } from 'react-router'

import { validateRequest } from '@lib/helpers/_parse-request.helper'
import { ResendVerifyEmailSchema } from '@lib/schemas/auth.schemas'
import { type DataWithResponseInit } from '@lib/types'

export async function action({ request }: ActionFunctionArgs): Promise<DataWithResponseInit<{ error?: boolean; message?: string }>> {
  const { resendVerificationEmailController } = await import('@/core/auth/auth.server')
  const validation = await validateRequest(request, ResendVerifyEmailSchema)
  if (!validation.success) {
    return validation.response as DataWithResponseInit<{ error?: boolean; message?: string }>
  }

  const result = await resendVerificationEmailController(validation.data.email)
  return data(result, { status: result.error ? 400 : 200 })
}
