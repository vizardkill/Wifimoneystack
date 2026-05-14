import type { JSX } from 'react'

import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { useActionData, useLoaderData, useNavigation } from 'react-router'

import { MarketplaceAppAuthoringShell } from '@modules/marketplace/admin/apps/edit'

import { CONFIG_GET_MARKETPLACE_APP_AUTHORING } from '@types'

const toStringList = (values: FormDataEntryValue[]): string[] => values.flatMap((value) => (typeof value === 'string' ? [value] : []))

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceAppAuthoring } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }

  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    throw redirect('/dashboard')
  }

  if (!params.appId) {
    throw redirect('/dashboard/marketplace/apps')
  }

  const result = await new CLS_GetMarketplaceAppAuthoring({
    app_id: params.appId,
    actor_user_id: user.id
  }).main()

  if (result.error || !result.data) {
    if (result.status === CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.NotFound) {
      throw redirect('/dashboard/marketplace/apps')
    }

    throw data({ error: true, message: result.message ?? 'No se pudo cargar el workspace de authoring.' }, { status: 500 })
  }

  return data({ authoring: result.data, actor_id: user.id })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }

  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  if (!params.appId) {
    throw redirect('/dashboard/marketplace/apps')
  }

  const formData = await request.formData()
  const intentValue = formData.get('intent')
  const intent = typeof intentValue === 'string' ? intentValue : 'save_basic'

  if (intent === 'save_basic') {
    const { CLS_GetMarketplaceAppAuthoring, CLS_UpsertMarketplaceApp } = await import('@/core/marketplace/marketplace.server')

    const nameRaw = formData.get('name')
    const slugRaw = formData.get('slug')
    const summaryRaw = formData.get('summary')
    const webUrlRaw = formData.get('web_url')

    const name = typeof nameRaw === 'string' ? nameRaw.trim() : ''
    const slug = typeof slugRaw === 'string' ? slugRaw.trim() : ''
    const summary = typeof summaryRaw === 'string' ? summaryRaw.trim() : ''
    const webUrl = typeof webUrlRaw === 'string' ? webUrlRaw.trim() : ''

    const authoringResult = await new CLS_GetMarketplaceAppAuthoring({
      app_id: params.appId,
      actor_user_id: user.id
    }).main()

    if (authoringResult.error || !authoringResult.data) {
      if (authoringResult.status === CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.NotFound) {
        return data({ error: true, message: 'No se encontró la aplicación a editar.' }, { status: 404 })
      }

      return data({ error: true, message: authoringResult.message ?? 'No se pudo cargar la aplicación para guardar cambios.' }, { status: 400 })
    }

    const existingApp = authoringResult.data.app

    if (!name || !summary) {
      return data({ error: true, message: 'Nombre y resumen son requeridos.' }, { status: 400 })
    }

    if (existingApp.access_mode === 'WEB_LINK' && !webUrl) {
      return data({ error: true, message: 'La URL web es requerida para apps con modo WEB_LINK.' }, { status: 400 })
    }

    if (webUrl) {
      let parsedWebUrl: URL

      try {
        parsedWebUrl = new URL(webUrl)
      } catch {
        return data({ error: true, message: 'La URL web no es válida.' }, { status: 400 })
      }

      if (parsedWebUrl.protocol !== 'https:') {
        return data({ error: true, message: 'La URL web debe usar HTTPS.' }, { status: 400 })
      }
    }

    const result = await new CLS_UpsertMarketplaceApp({
      id: params.appId,
      actor_user_id: user.id,
      name,
      slug: slug || undefined,
      summary,
      description: existingApp.description,
      instructions: existingApp.instructions,
      access_mode: existingApp.access_mode,
      web_url: webUrl || undefined
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo guardar la app base.' }, { status: 400 })
    }

    return data({ success: true, message: 'Datos base guardados correctamente.' })
  }

  const {
    SaveMarketplaceAppStorefrontDraftSchema,
    PrepareMarketplaceAppMediaUploadSchema,
    RegisterMarketplaceAppMediaSchema,
    RemoveMarketplaceAppMediaSchema,
    ReorderMarketplaceAppStorefrontMediaSchema,
    PublishMarketplaceAppStorefrontSchema
  } = await import('@/lib/schemas/marketplace.schema')

  if (intent === 'save_storefront_draft') {
    const { CLS_SaveMarketplaceAppStorefrontDraft } = await import('@/core/marketplace/marketplace.server')

    const payload = {
      app_id: params.appId,
      summary: formData.get('summary'),
      description: formData.get('description'),
      instructions: formData.get('instructions'),
      developer_name: formData.get('developer_name'),
      developer_website: formData.get('developer_website'),
      support_email: formData.get('support_email'),
      support_url: formData.get('support_url'),
      language_codes: toStringList(formData.getAll('language_codes'))
    }

    const parsed = SaveMarketplaceAppStorefrontDraftSchema.safeParse(payload)
    if (!parsed.success) {
      return data({ error: true, message: 'Datos inválidos para guardar el borrador.' }, { status: 400 })
    }

    const result = await new CLS_SaveMarketplaceAppStorefrontDraft({
      ...parsed.data,
      actor_user_id: user.id
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo guardar el borrador de storefront.' }, { status: 400 })
    }

    return data({ success: true, message: 'Borrador de vitrina guardado.', details: result.data })
  }

  if (intent === 'prepare_media_upload') {
    const { CLS_PrepareMarketplaceAppMediaUpload } = await import('@/core/marketplace/marketplace.server')

    const parsed = PrepareMarketplaceAppMediaUploadSchema.safeParse({
      app_id: params.appId,
      media_type: formData.get('media_type'),
      file_name: formData.get('file_name'),
      content_type: formData.get('content_type'),
      size_bytes: formData.get('size_bytes')
    })

    if (!parsed.success) {
      return data({ error: true, message: 'Datos inválidos para preparar upload.' }, { status: 400 })
    }

    const result = await new CLS_PrepareMarketplaceAppMediaUpload({
      ...parsed.data,
      actor_user_id: user.id
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo preparar el upload de media.' }, { status: 400 })
    }

    return data({ success: true, message: 'Signed upload preparado.', details: result.data })
  }

  if (intent === 'register_media') {
    const { CLS_RegisterMarketplaceAppMedia } = await import('@/core/marketplace/marketplace.server')

    const parsed = RegisterMarketplaceAppMediaSchema.safeParse({
      app_id: params.appId,
      media_type: formData.get('media_type'),
      storage_key: formData.get('storage_key'),
      public_url: formData.get('public_url'),
      external_video_url: formData.get('external_video_url'),
      alt_text: formData.get('alt_text'),
      attach_to_draft: formData.get('attach_to_draft')
    })

    if (!parsed.success) {
      return data({ error: true, message: 'Datos inválidos para registrar media.' }, { status: 400 })
    }

    const result = await new CLS_RegisterMarketplaceAppMedia({
      ...parsed.data,
      actor_user_id: user.id
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo registrar media.' }, { status: 400 })
    }

    return data({ success: true, message: 'Media registrada en el borrador.', details: result.data })
  }

  if (intent === 'remove_media') {
    const { CLS_RemoveMarketplaceAppMedia } = await import('@/core/marketplace/marketplace.server')

    const parsed = RemoveMarketplaceAppMediaSchema.safeParse({
      app_id: params.appId,
      media_id: formData.get('media_id'),
      detach_from_draft: formData.get('detach_from_draft'),
      remove_from_library: formData.get('remove_from_library')
    })

    if (!parsed.success) {
      return data({ error: true, message: 'Datos inválidos para remover media.' }, { status: 400 })
    }

    const result = await new CLS_RemoveMarketplaceAppMedia({
      ...parsed.data,
      actor_user_id: user.id
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo remover media.' }, { status: 400 })
    }

    return data({ success: true, message: 'Media removida correctamente.', details: result.data })
  }

  if (intent === 'reorder_media') {
    const { CLS_ReorderMarketplaceAppStorefrontMedia } = await import('@/core/marketplace/marketplace.server')

    const orderedMediaIds = toStringList(formData.getAll('ordered_media_ids'))
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter((value) => value.length > 0)

    const parsed = ReorderMarketplaceAppStorefrontMediaSchema.safeParse({
      app_id: params.appId,
      ordered_media_ids: orderedMediaIds
    })

    if (!parsed.success) {
      return data({ error: true, message: 'Datos inválidos para reordenar media.' }, { status: 400 })
    }

    const result = await new CLS_ReorderMarketplaceAppStorefrontMedia({
      ...parsed.data,
      actor_user_id: user.id
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo reordenar media.' }, { status: 400 })
    }

    return data({ success: true, message: 'Orden de media actualizado.', details: result.data })
  }

  if (intent === 'publish_storefront') {
    const { CLS_PublishMarketplaceAppStorefront } = await import('@/core/marketplace/marketplace.server')

    const parsed = PublishMarketplaceAppStorefrontSchema.safeParse({
      app_id: params.appId
    })

    if (!parsed.success) {
      return data({ error: true, message: 'Datos inválidos para publicar storefront.' }, { status: 400 })
    }

    const result = await new CLS_PublishMarketplaceAppStorefront({
      ...parsed.data,
      actor_user_id: user.id
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo publicar storefront.' }, { status: 400 })
    }

    return data({
      success: true,
      message: 'Storefront publicado correctamente. Esto actualiza la vitrina pública, no el estado operativo de la app.',
      details: result.data
    })
  }

  return data({ error: true, message: 'Intent no soportado para esta ruta.' }, { status: 400 })
}

export default function EditAppPage(): JSX.Element {
  const { authoring } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const actionError = actionData && 'error' in actionData && actionData.error ? actionData.message : null
  const actionSuccess = actionData && 'success' in actionData && actionData.success ? actionData.message : null

  return <MarketplaceAppAuthoringShell authoring={authoring} isSubmitting={isSubmitting} actionError={actionError} actionSuccess={actionSuccess} />
}
