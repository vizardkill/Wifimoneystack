import { createRequestHandler } from '@react-router/express'
import chalk from 'chalk'
import cluster from 'cluster'
import compression from 'compression'
import DotenvFlow from 'dotenv-flow'
import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import expressWinston from 'express-winston'
import helmet from 'helmet'
import http, { type Server as HTTPServer } from 'http'
import morgan from 'morgan'
import os from 'os'
import path from 'path'
import { type ServerBuild } from 'react-router'
import { pathToFileURL } from 'url'
import { v4 as uuidv4 } from 'uuid'
import type { ViteDevServer } from 'vite'
import winston from 'winston'

import { createGoogleCloudLoggingTransport } from '@server/functions'
import { blockBadBotsMiddleware, blockPropfindMiddleware, suspiciousIPRateLimiter } from '@server/middlewares/express'
import {
  cacheControlMiddleware,
  corsMiddleware,
  corsPreflightMiddleware,
  setImmutableAssetCacheHeaders,
  setStaticCacheHeaders
} from '@server/middlewares/http-config'
import { mediaProxyMiddleware } from '@server/middlewares/media-proxy'

import './sentry.conf'

const writeStdout = (message: string): void => {
  process.stdout.write(`${message}\n`)
}

const writeStderr = (message: string): void => {
  process.stderr.write(`${message}\n`)
}

const normalizePort = (value: string | number | undefined): string | null => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const normalized = String(value).trim().replace(/^:/, '')
  return normalized.length > 0 ? normalized : null
}

const toHostPattern = (value: string | undefined): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const raw = value.trim()
  if (raw.length === 0) {
    return null
  }

  try {
    return new URL(raw).host
  } catch {
    const withoutProtocol = raw.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
    const hostOnly = withoutProtocol.split('/')[0]?.trim() ?? ''
    return hostOnly.length > 0 ? hostOnly : null
  }
}

const getSingleHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

const normalizeForwardedHostForLocal = (req: Request): void => {
  if (process.env.BUILD === 'production') {
    return
  }

  const originHeader = getSingleHeaderValue(req.headers.origin)
  const originHost = toHostPattern(originHeader)
  if (!originHost) {
    return
  }

  const hostRaw = getSingleHeaderValue(req.headers.host)
  const hostHeader = typeof hostRaw === 'string' ? hostRaw.trim() : ''
  if (hostHeader && hostHeader !== originHost) {
    req.headers.host = originHost
  }

  const forwardedRaw = getSingleHeaderValue(req.headers['x-forwarded-host'])
  const forwardedHost = typeof forwardedRaw === 'string' ? forwardedRaw.split(',')[0]?.trim() : ''
  if (forwardedHost && forwardedHost !== originHost) {
    req.headers['x-forwarded-host'] = originHost
  }
}

const debugActionOriginHeaders = (req: Request): void => {
  if (process.env.DEBUG_ACTION_ORIGIN_CHECK !== 'true') {
    return
  }

  if (req.method !== 'POST') {
    return
  }

  const isAuthoringEditAction = /^\/dashboard\/marketplace\/apps\/[^/]+\/edit\/?$/.test(req.path)
  if (!isAuthoringEditAction) {
    return
  }

  const origin = getSingleHeaderValue(req.headers.origin) ?? '-'
  const host = getSingleHeaderValue(req.headers.host) ?? '-'
  const xForwardedHost = getSingleHeaderValue(req.headers['x-forwarded-host']) ?? '-'
  const referer = getSingleHeaderValue(req.headers.referer) ?? '-'

  writeStdout(`[ACTION-CSRF-DEBUG] method=${req.method} path=${req.path} origin=${origin} host=${host} x-forwarded-host=${xForwardedHost} referer=${referer}`)
}

const collectAllowedActionOrigins = (): string[] => {
  const allowList = new Set<string>()

  const addHostPattern = (value: string | undefined): void => {
    const hostPattern = toHostPattern(value)
    if (hostPattern) {
      allowList.add(hostPattern)
    }
  }

  addHostPattern(process.env.APP_URL)
  addHostPattern(process.env.NGROK_URL)

  const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  if (typeof corsAllowedOrigins === 'string' && corsAllowedOrigins.trim().length > 0) {
    for (const value of corsAllowedOrigins.split(',')) {
      addHostPattern(value)
    }
  }

  const hostName = process.env.HOST_NAME.trim()
  const hostPort = normalizePort(process.env.HOST_PORT)
  if (hostName) {
    allowList.add(hostName)
    if (hostPort) {
      allowList.add(`${hostName}:${hostPort}`)
    }
  }

  const localPorts = new Set<string>()
  for (const value of [process.env.PORT, process.env.FRONTEND_PORT, process.env.HOST_PORT]) {
    const normalizedPort = normalizePort(value)
    if (normalizedPort) {
      localPorts.add(normalizedPort)
    }
  }

  for (const localHost of ['localhost', '127.0.0.1', '0.0.0.0']) {
    allowList.add(localHost)
    for (const port of localPorts) {
      allowList.add(`${localHost}:${port}`)
    }
  }

  // Conveniencia en desarrollo con túneles efímeros.
  allowList.add('*.ngrok-free.app')
  allowList.add('*.ngrok.app')
  allowList.add('*.ngrok.io')

  return Array.from(allowList)
}

const withRuntimeAllowedActionOrigins = (build: ServerBuild): ServerBuild => {
  const buildAllowedOrigins = Array.isArray((build as { allowedActionOrigins?: string[] }).allowedActionOrigins)
    ? ((build as { allowedActionOrigins?: string[] }).allowedActionOrigins ?? [])
    : []

  const runtimeAllowedOrigins = collectAllowedActionOrigins()

  return {
    ...build,
    allowedActionOrigins: Array.from(new Set([...buildAllowedOrigins, ...runtimeAllowedOrigins]))
  }
}

// Cargar las variables de entorno
DotenvFlow.config({ silent: true })

/** Tipado para metadata de winston-express logger */
interface WinstonRequestMeta {
  res?: { statusCode?: number }
  req?: { method?: string; url?: string; ip?: string }
  responseTime?: number
  error?: string
}

/**
 * @class AppServer
 * @description Clase para encapsular la configuración del servidor Express y Socket.IO.
 */
class AppServer {
  private app: Express
  private server: HTTPServer
  private port: number | string
  private hostName: string
  private viteDevServer?: ViteDevServer
  private ngrokUrl?: string

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)
    const envPort = process.env.PORT
    this.port = typeof envPort === 'string' && envPort.length > 0 ? envPort : 8080
    this.hostName = '0.0.0.0'
  }

  /**
   * Configuración del servidor Vite
   * @returns {Promise<void>}
   */
  async setupVite(): Promise<void> {
    if (process.env.VITE_DEV_SERVER === 'true') {
      const { createServer } = await import('vite')
      this.viteDevServer = await createServer({
        server: { middlewareMode: true }
      })
      this.app.use(this.viteDevServer.middlewares)
    } else {
      this.viteDevServer = undefined
    }
  }

  /**
   * Configuración de Express
   * @returns {Promise<void>}
   */
  async setupExpress(): Promise<void> {
    this.app.use(compression())
    this.app.disable('x-powered-by')

    // Security middlewares
    this.app.use(blockPropfindMiddleware)
    this.app.use(suspiciousIPRateLimiter)
    this.app.use(blockBadBotsMiddleware)

    // =============================
    // → Logger simplificado
    // =============================
    if (process.env.BUILD === 'local') {
      const customMorganFormat: morgan.FormatFn = (tokens, req, res) => {
        const status = parseInt(tokens.status(req, res) ?? '0', 10)
        const method = tokens.method(req, res) ?? ''
        const url = tokens.url(req, res) ?? ''
        const time = tokens['response-time'](req, res) ?? '0'

        if (url.includes('/assets/') || url.includes('/build/') || url.includes('/.well-known/')) {
          return null
        }

        const emoji = status >= 500 ? '🔥' : status >= 400 ? '⚠️' : status >= 300 ? '🚧' : '✅'
        return `${emoji} ${chalk.blue(method)} ${chalk.cyan(url)} ${chalk.magenta(String(status))} ${chalk.gray(`${time}ms`)}`
      }
      this.app.use(morgan(customMorganFormat, { skip: (req) => req.url?.includes('/assets/') === true || req.url?.includes('/build/') === true }))
    } else {
      this.app.use((req: Request & { id?: string }, _res: Response, next: NextFunction) => {
        req.id = uuidv4()
        next()
      })

      const cloudHttpTransport = createGoogleCloudLoggingTransport('http')
      const cloudErrorTransport = createGoogleCloudLoggingTransport('error')

      this.app.use(
        expressWinston.logger({
          transports: cloudHttpTransport ? [cloudHttpTransport] : [new winston.transports.Console()],
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf((info) => {
              const meta = (info.meta ?? {}) as WinstonRequestMeta
              const status = meta.res?.statusCode ?? 0
              const method = meta.req?.method ?? ''
              const url = meta.req?.url ?? ''
              const time = meta.responseTime ?? 0

              if (url.includes('/assets/') || url.includes('/build/') || url.includes('/.well-known/')) {
                return ''
              }

              const clientIp = meta.req?.ip ?? 'unknown'

              let emoji: string
              let statusColor: string
              if (!status) {
                emoji = '⚪'
                statusColor = chalk.gray(status)
              } else if (status >= 500) {
                emoji = '❌'
                statusColor = chalk.red(status)
              } else if (status >= 400) {
                emoji = '⚠️'
                statusColor = chalk.red(status)
              } else if (status >= 300) {
                emoji = '🔄'
                statusColor = chalk.yellow(status)
              } else {
                emoji = '✅'
                statusColor = chalk.green(status)
              }

              return `${chalk.gray(`[${String(info.timestamp)}]`)} ${emoji} ${chalk.blue(method)} ${chalk.cyan(url)} ${statusColor} ${chalk.gray(`${Math.round(time)}ms`)} ${chalk.dim(`IP: ${clientIp}`)}`
            })
          ),
          meta: true,
          expressFormat: false,
          requestWhitelist: ['url', 'method', 'ip'],
          responseWhitelist: ['statusCode'],
          ignoreRoute: (req) => req.url.includes('/assets/') || req.url.includes('/build/') || req.url.includes('/.well-known/') || req.url === '/favicon.ico'
        })
      )

      // Logger de errores separado
      this.app.use(
        expressWinston.errorLogger({
          transports: cloudErrorTransport
            ? [cloudErrorTransport]
            : [
                new winston.transports.Console({
                  format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'HH:mm:ss' }),
                    winston.format.printf((info) => {
                      const meta = (info.meta ?? {}) as WinstonRequestMeta
                      const method = meta.req?.method ?? ''
                      const url = meta.req?.url ?? ''
                      const error = meta.error ?? info.message
                      return `${chalk.red(`[${String(info.timestamp)}]`)} ❌ ERROR ${chalk.blue(method)} ${chalk.cyan(url)} - ${chalk.red(error)}`
                    })
                  )
                })
              ],
          format: winston.format.json(),
          meta: true,
          requestWhitelist: ['url', 'method', 'ip'],
          msg: '{{err.message}}'
        })
      )
    }

    // Middleware global CORS
    this.app.use(corsMiddleware)

    // Manejo de preflight para todas las rutas
    this.app.options('{*path}', corsPreflightMiddleware)

    // Configuracion del Helmet
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            frameAncestors: ["'self'", 'https://admin.shopify.com/', 'https://lottie.host/', 'https://unpkg.com/'],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              'https://admin.shopify.com/',
              'https://cdn.shopify.com/',
              'https://lottie.host/',
              'https://cdn.jsdelivr.net/',
              'https://unpkg.com/',
              'https://connect.facebook.net/',
              'https://www.facebook.com/',
              'https://www.googletagmanager.com/',
              'https://www.google-analytics.com/',
              'https://analytics.tiktok.com/',
              'https://www.youtube.com/',
              'https://www.youtube-nocookie.com/',
              'https://player.vimeo.com/',
              'https://storage.googleapis.com/'
            ],
            connectSrc: ["'self'", '*'],
            workerSrc: ["'self'", 'blob:'],
            styleSrc: ["'self'", "'unsafe-inline'", '*'],
            imgSrc: ["'self'", 'data:', 'blob:', '*'],
            mediaSrc: [
              "'self'",
              'blob:',
              'https://storage.googleapis.com',
              'https://www.youtube.com/',
              'https://www.youtube-nocookie.com/',
              'https://player.vimeo.com/'
            ],
            frameSrc: ["'self'", 'https://www.youtube.com/', 'https://www.youtube-nocookie.com/', 'https://player.vimeo.com/'],
            fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com/'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
            blockAllMixedContent: []
          }
        }
      })
    )

    // Middleware para control de caché
    this.app.use(cacheControlMiddleware)

    // Requerido para habilitar JS browser profiling en Chromium (Sentry)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const acceptsHtml = req.accepts('html') !== false
      if (req.method === 'GET' && acceptsHtml) {
        res.setHeader('Document-Policy', 'js-profiling')
      }

      next()
    })

    // Docs with Docsify
    this.app.use(
      '/docs',
      express.static(path.resolve(process.cwd(), 'docs'), {
        index: false,
        extensions: ['html'],
        setHeaders: (res, filePath) => {
          setStaticCacheHeaders(res, filePath)
        }
      })
    )

    this.app.use('/.well-known/appspecific/com.chrome.devtools.json', (_req: Request, res: Response) => {
      res.json({
        resources: [],
        workspace: {
          root: path.resolve(process.cwd()),
          uuid: 'somaup-app-project-uuid'
        }
      })
    })

    // Proxy de media en dominio propio para no exponer URLs directas de infraestructura.
    this.app.use('/api/v1/storage/media', mediaProxyMiddleware)

    const mutationLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 1000, // Limita cada IP a 1000 operaciones de escritura por ventana (15 min)
      standardHeaders: true, // Devuelve la información del límite en los headers `RateLimit-*`
      legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
      skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
      message: 'Demasiadas operaciones desde esta IP, por favor intente de nuevo después de 15 minutos'
    })

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 40,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.'
    })

    const publicCoachFormLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en 15 minutos.'
    })

    if (process.env.BUILD === 'production') {
      this.app.set('trust proxy', 1)
      this.app.use(mutationLimiter)
      this.app.use('/api/v1/auth', authLimiter)
      this.app.use('/coach', publicCoachFormLimiter)
    }

    if (!this.viteDevServer) {
      this.app.use(
        '/assets',
        express.static('build/client/assets', {
          immutable: true,
          maxAge: '365d',
          setHeaders: (res, filePath) => {
            setImmutableAssetCacheHeaders(res, filePath)
          }
        })
      )

      this.app.use(
        express.static('build/client', {
          maxAge: '1h',
          setHeaders: (res, filePath) => {
            setStaticCacheHeaders(res, filePath)
          }
        })
      )
    }

    const serverBuildUrl = pathToFileURL(path.resolve(process.cwd(), 'build/server/index.js')).href

    const remixHandler = this.viteDevServer
      ? createRequestHandler({
          build: async () => {
            const devBuild = (await this.viteDevServer?.ssrLoadModule('virtual:react-router/server-build')) as ServerBuild
            return withRuntimeAllowedActionOrigins(devBuild)
          }
        })
      : createRequestHandler({
          build: withRuntimeAllowedActionOrigins((await import(serverBuildUrl)) as ServerBuild)
        })

    this.app.get(['/docs', '/docs/{*splat}'], (_req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'docs', 'index.html'))
    })

    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        normalizeForwardedHostForLocal(req)
        debugActionOriginHeaders(req)
      }
      next()
    })

    this.app.all('{*path}', remixHandler)
  }

  /**
   * Inicia el servidor Express y Socket.IO.
   */
  startServer(): void {
    const port = Number(this.port)
    this.server.listen(port, this.hostName, () => {
      writeStdout(`🛜  [EXPRESS]: Servidor escuchando en http://${this.hostName}:${port} en el entorno: ${process.env.BUILD}`)
    })
  }

  /**
   * Inicia Ngrok si está configurado.
   * @returns {Promise<void>}
   *
   */
  async startNgrok(): Promise<void> {
    if (process.env.NGROK_ENABLED === 'true' && process.env.NGROK_TOKEN) {
      try {
        const ngrok = (await import('@ngrok/ngrok')).default
        const listener = await ngrok.connect({
          addr: this.port,
          authtoken: process.env.NGROK_TOKEN,
          region: 'eu'
        })
        const url = listener.url()
        if (url) {
          this.ngrokUrl = url
          writeStdout(`🌐 [EXPRESS]: Ngrok está corriendo en: ${this.ngrokUrl}`)
          process.env.NGROK_URL = this.ngrokUrl
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        writeStderr(`❌ [EXPRESS]: Error al conectar Ngrok: ${errorMessage}`)
      }
    }
  }

  /**
   * Configura y arranca el servidor.
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    await this.setupVite()

    // Iniciar ngrok ANTES de configurar Express para que la URL esté disponible
    await this.startNgrok()

    await this.setupExpress()
    this.startServer()
  }
}

// Inicializa y arranca el servidor en modo cluster si es producción
const isCloudRun = Boolean(process.env.K_SERVICE)
const shouldUseCluster = process.env.CLUSTER === 'true' && !isCloudRun

if (cluster.isPrimary) {
  const numCPUs = shouldUseCluster ? os.cpus().length : 1
  writeStdout(`🚀 [SERVER]: Iniciando ${numCPUs} worker(s) en modo ${process.env.BUILD}...`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    writeStdout(`🛠️ [EXPRESS-CLUSTER] Worker Process: ${String(worker.process.pid)} ha finalizado`)
  })

  // Inicia el cron de recordatorios solo en el proceso primario si CRON_ENABLED=true
  if (process.env.CRON_ENABLED === 'true') {
    const { reminderCron, watchRenewalCron } = await import('@server/cron')
    void reminderCron.start()
    void watchRenewalCron.start()
    writeStdout('⏰ [CRON] Job de recordatorios iniciado.')
    writeStdout('⏰ [CRON] Job de renovación de watch channels iniciado.')

    process.on('SIGTERM', () => {
      writeStdout(chalk.yellow('\n[SERVER] Recibida señal SIGTERM, deteniendo jobs...'))
      void reminderCron.stop()
      void watchRenewalCron.stop()
    })

    process.on('SIGINT', () => {
      writeStdout(chalk.yellow('\n[SERVER] Recibida señal SIGINT, deteniendo jobs...'))
      void reminderCron.stop()
      void watchRenewalCron.stop()
    })
  } else {
    writeStdout('⏰ [CRON] Job de recordatorios desactivado (CRON_ENABLED != true).')
  }
} else {
  const appServer = new AppServer()
  void appServer.init()
}

/**
 * @module AppServer
 * @description Clase que encapsula la configuración del servidor Express y la integración de Socket.IO.
 *
 * - Configura Vite en modo desarrollo o carga la build de producción.
 * - Integra Remix para el manejo de SSR.
 * - Proporciona middlewares de compresión, logging y manejo de archivos estáticos.
 * - Configura y escucha eventos en tiempo real a través de Socket.IO.
 *
 * @requires express
 * @requires socket.io
 * @requires http
 * @requires compression
 * @requires morgan
 * @requires dotenv-flow
 * @requires vite
 * @requires cluster
 * @requires os
 * @requires helmet
 * @requires cors
 * @requires http
 * @requires @remix-run/express
 * @requires @remix-run/node
 * @requires @functions/redis
 */
