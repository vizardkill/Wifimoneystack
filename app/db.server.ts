import type { PrismaClient as PrismaClientType } from '@prisma/client'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { createRequire } from 'module'

dotenvExpand.expand(dotenv.config())

declare global {
  var __db: PrismaClientType | undefined
}

let _db: PrismaClientType | undefined

const DEFAULT_DEV_POOL_SIZE = 10
const DEFAULT_PROD_POOL_SIZE = 5
const DEFAULT_IDLE_TIMEOUT_MS = 30_000
const DEFAULT_CONNECTION_TIMEOUT_MS = 30_000
const DEFAULT_MAX_LIFETIME_SECONDS = 300

function getPositiveIntEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]

  if (!rawValue) {
    return fallback
  }

  const parsedValue = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback
  }

  return parsedValue
}

const initPrisma = (): PrismaClientType => {
  const require = createRequire(import.meta.url)

  const { PrismaClient } = require('@prisma/client')
  const { PrismaPg } = require('@prisma/adapter-pg')
  const { Pool } = require('pg')

  const dbUrl = (process.env.DB_URL || '').trim()

  if (!dbUrl) {
    throw new Error('DB_URL is required to initialize Prisma')
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const isCloudRun = Boolean(process.env.K_SERVICE)
  const parsedDbUrl = new URL(dbUrl)
  const socketHost = parsedDbUrl.searchParams.get('host') || ''
  const usesUnixSocket = socketHost.startsWith('/cloudsql/') || parsedDbUrl.hostname.startsWith('/cloudsql/')
  const explicitSslMode = (parsedDbUrl.searchParams.get('sslmode') || '').toLowerCase()
  const forceSslEnv = (process.env.DB_REQUIRE_SSL || '').toLowerCase()
  const requiresSSL =
    forceSslEnv === 'true' ||
    explicitSslMode === 'require' ||
    explicitSslMode === 'verify-ca' ||
    explicitSslMode === 'verify-full' ||
    (parsedDbUrl.hostname.includes('rds.amazonaws.com') && !usesUnixSocket)
  const poolSize = getPositiveIntEnv('DB_POOL_SIZE', isProduction || isCloudRun ? DEFAULT_PROD_POOL_SIZE : DEFAULT_DEV_POOL_SIZE)
  const idleTimeoutMillis = getPositiveIntEnv('DB_POOL_IDLE_TIMEOUT_MS', DEFAULT_IDLE_TIMEOUT_MS)
  const connectionTimeoutMillis = getPositiveIntEnv('DB_POOL_CONNECTION_TIMEOUT_MS', DEFAULT_CONNECTION_TIMEOUT_MS)
  const maxLifetimeSeconds = getPositiveIntEnv('DB_POOL_MAX_LIFETIME_SECONDS', DEFAULT_MAX_LIFETIME_SECONDS)

  const dbName = parsedDbUrl.pathname.slice(1).split('?')[0]

  const cleanUrl = `postgresql://${parsedDbUrl.username}:${parsedDbUrl.password}@${parsedDbUrl.hostname}:${parsedDbUrl.port || 5432}/${dbName}${parsedDbUrl.search}`

  const pool = new Pool({
    connectionString: cleanUrl,
    max: poolSize,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    maxLifetimeSeconds,
    allowExitOnIdle: !isProduction,
    application_name: process.env.DB_APPLICATION_NAME || process.env.K_SERVICE || 'wmc-marketplace',
    ssl: requiresSSL ? { rejectUnauthorized: false } : false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000
  })

  // Evita que una idle connection muerta lance UnhandledPromiseRejection
  ;(pool as { on(event: 'error', listener: (err: { message: string }) => void): void }).on('error', (err: { message: string }) => {
    process.stderr.write(`[pg-pool] idle client error: ${err.message}\n`)
  })

  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({ adapter }) as PrismaClientType

  return client
}

export function getDb(): PrismaClientType {
  if (_db) {
    return _db
  }

  if (global.__db) {
    _db = global.__db
    return _db
  }

  _db = initPrisma()

  if (process.env.NODE_ENV !== 'production') {
    global.__db = _db
  }

  return _db
}

export const db = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string]
  }
})
