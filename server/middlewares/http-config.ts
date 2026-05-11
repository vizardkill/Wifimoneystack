import cors, { type CorsOptions } from 'cors'
import type { NextFunction, Request, Response } from 'express'
import path from 'path'

const STATIC_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.json',
  '.xml',
  '.txt',
  '.pdf',
  '.mp4',
  '.webm'
])

const STATIC_PATH_PREFIXES = ['/assets/', '/build/', '/docs/', '/.well-known/', '/public/']
const STATIC_PATHS = ['/favicon.ico', '/robots.txt', '/manifest.json', '/browserconfig.xml']

const parseAllowedOrigins = (): Set<string> => {
  const raw = process.env.CORS_ALLOWED_ORIGINS
  if (!raw) {
    return new Set<string>()
  }

  return new Set(
    raw
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
  )
}

const allowedOrigins = parseAllowedOrigins()

const isStaticLikeRequest = (req: Request): boolean => {
  const requestPath = req.path
  return STATIC_PATH_PREFIXES.some((prefix) => requestPath.startsWith(prefix)) || STATIC_PATHS.includes(requestPath)
}

const buildCorsOptions = (): CorsOptions => ({
  origin: (origin, cb) => {
    // Same-origin requests and server-to-server requests may not include Origin header.
    if (!origin) {
      cb(null, true)
      return
    }

    // Backward-compatible mode: if no explicit allowlist is configured, preserve current permissive behavior.
    if (allowedOrigins.size === 0) {
      cb(null, origin)
      return
    }

    cb(null, allowedOrigins.has(origin) ? origin : false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true
})

const corsOptions = buildCorsOptions()

const corsMiddleware = cors(corsOptions)
const corsPreflightMiddleware = cors(corsOptions)

const cacheControlMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!isStaticLikeRequest(req)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  }
  next()
}

const setStaticCacheHeaders = (res: Response, filePath: string): void => {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    return
  }

  if (STATIC_EXTENSIONS.has(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate')
  }
}

const setImmutableAssetCacheHeaders = (res: Response, filePath: string): void => {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    return
  }

  if (STATIC_EXTENSIONS.has(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
}

export { cacheControlMiddleware, corsMiddleware, corsPreflightMiddleware, isStaticLikeRequest, setImmutableAssetCacheHeaders, setStaticCacheHeaders }
