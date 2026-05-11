import { type ActionFunctionArgs, data } from 'react-router'

import { validateRequest } from '@lib/helpers/_parse-request.helper'
import { AuthProviderType, type GoogleRegisterActionResponse } from '@lib/interfaces'
import { GoogleRegisterSchema } from '@lib/schemas/auth.schemas'
import { type DataWithResponseInit } from '@lib/types'

export async function action({ request }: ActionFunctionArgs): Promise<DataWithResponseInit<GoogleRegisterActionResponse>> {
  const { registerUserAgnosticController } = await import('@/core/auth/auth.server')
  const validation = await validateRequest(request, GoogleRegisterSchema)
  if (!validation.success) {
    return validation.response as DataWithResponseInit<GoogleRegisterActionResponse>
  }

  const { first_name, last_name, email, country_id, google_id, access_token, picture, verified_email } = validation.data

  const payload = {
    first_name,
    last_name,
    email,
    country_id,
    provider_type: AuthProviderType.GOOGLE,
    provider_data: {
      google_id,
      access_token,
      profile: {
        picture: picture || undefined,
        verified_email: verified_email === 'true'
      }
    }
  }

  const result = await registerUserAgnosticController(payload)

  return data(
    {
      error: result.error,
      status: result.status,
      message: result.message,
      data: result.data
    },
    { status: result.error ? 400 : 201 }
  )
}
