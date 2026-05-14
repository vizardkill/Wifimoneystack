import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { LRUCache } from 'lru-cache'

import { getUserDataToken } from '@/core/auth/cookie.server'
import { buildStoragePublicUrl, getSignedReadUrl, isAllowedStorageContainer, verifyMediaProxyToken } from '@/lib/services/_storage.service'

type MediaProxyRequest = Request & {
  mediaProxyTarget?: string
  mediaProxyPath?: string
}

const signedReadUrlCache = new LRUCache<string, string>({
  max: 5000,
  ttl: 50 * 60 * 1000
})

const inflightSignedReadRequests = new Map<string, Promise<string>>()

const DEFAULT_MEDIA_PROXY_TARGET = (() => {
  try {
    const sample = new URL(buildStoragePublicUrl('media-proxy-probe'))
    return `${sample.protocol}//${sample.host}`
  } catch {
    return 'https://storage.googleapis.com'
  }
})()

const jsonError = (res: Response, status: number, message: string): void => {
  res.status(status).setHeader('Cache-Control', 'no-store').json({ error: true, message })
}

const PUBLIC_PDF_MEDIA_PREFIX = 'exercises/videos/'

const getSignedReadCacheKey = (containerName: string, objectPath: string): string => `${containerName}:${objectPath}`

const getOrCreateSignedReadUrl = async (containerName: string, objectPath: string): Promise<string> => {
  const cacheKey = getSignedReadCacheKey(containerName, objectPath)

  const cached = signedReadUrlCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const inflight = inflightSignedReadRequests.get(cacheKey)
  if (inflight) {
    return inflight
  }

  const promise = (async (): Promise<string> => {
    const signedReadUrl = await getSignedReadUrl(objectPath, containerName)
    signedReadUrlCache.set(cacheKey, signedReadUrl)
    return signedReadUrl
  })()

  inflightSignedReadRequests.set(cacheKey, promise)

  try {
    return await promise
  } finally {
    inflightSignedReadRequests.delete(cacheKey)
  }
}

const mediaProxyAuthMiddleware = async (req: MediaProxyRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    jsonError(res, 405, 'Método no permitido.')
    return
  }

  const tokenParam = req.query['token']
  const token = typeof tokenParam === 'string' ? tokenParam : ''

  if (token.length === 0) {
    jsonError(res, 422, 'El parámetro "token" es requerido.')
    return
  }

  const payload = verifyMediaProxyToken(token)
  if (payload === null || !isAllowedStorageContainer(payload.containerName)) {
    jsonError(res, 403, 'Token inválido o expirado.')
    return
  }

  if (payload.scope === 'private') {
    let userId: string
    try {
      const user = await getUserDataToken(req.headers.cookie ?? null)
      userId = user.id
    } catch {
      jsonError(res, 401, 'No autorizado.')
      return
    }

    if (!payload.userId || payload.userId !== userId) {
      jsonError(res, 403, 'Token inválido o expirado.')
      return
    }
  }

  if (payload.scope === 'public_pdf' && !payload.objectPath.startsWith(PUBLIC_PDF_MEDIA_PREFIX)) {
    jsonError(res, 403, 'Token inválido o expirado.')
    return
  }

  if (payload.scope === 'public_prefixed') {
    const allowedPrefix = typeof payload.allowedPrefix === 'string' ? payload.allowedPrefix : ''
    const hasAllowedPrefix = allowedPrefix.length > 0
    if (!hasAllowedPrefix || !payload.objectPath.startsWith(allowedPrefix)) {
      jsonError(res, 403, 'Token inválido o expirado.')
      return
    }
  }

  try {
    const signedReadUrl = await getOrCreateSignedReadUrl(payload.containerName, payload.objectPath)
    const parsedSignedReadUrl = new URL(signedReadUrl)

    req.mediaProxyTarget = `${parsedSignedReadUrl.protocol}//${parsedSignedReadUrl.host}`
    req.mediaProxyPath = `${parsedSignedReadUrl.pathname}${parsedSignedReadUrl.search}`
    next()
  } catch {
    jsonError(res, 500, 'Error al obtener archivo de media.')
  }
}

const mediaProxyForwardMiddleware = createProxyMiddleware<MediaProxyRequest, Response>({
  changeOrigin: true,
  secure: true,
  router: (req) => req.mediaProxyTarget ?? DEFAULT_MEDIA_PROXY_TARGET,
  pathRewrite: (_path, req) => req.mediaProxyPath ?? _path,
  on: {
    proxyReq: (proxyReq, req) => {
      const range = req.headers['range']
      const ifNoneMatch = req.headers['if-none-match']
      const ifModifiedSince = req.headers['if-modified-since']

      if (typeof range === 'string' && range.length > 0) {
        proxyReq.setHeader('range', range)
      }
      if (typeof ifNoneMatch === 'string' && ifNoneMatch.length > 0) {
        proxyReq.setHeader('if-none-match', ifNoneMatch)
      }
      if (typeof ifModifiedSince === 'string' && ifModifiedSince.length > 0) {
        proxyReq.setHeader('if-modified-since', ifModifiedSince)
      }
    },
    proxyRes: (proxyRes) => {
      proxyRes.headers['cache-control'] = 'private, max-age=300, must-revalidate'
    }
  }
})

const mediaProxyMiddleware: RequestHandler[] = [mediaProxyAuthMiddleware, mediaProxyForwardMiddleware]

export { mediaProxyMiddleware }
