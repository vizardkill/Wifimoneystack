import { existsSync, readdirSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const SEED_HISTORY_TABLE = '_prisma_seed_history'

function toPsqlUrl(dbUrl: string) {
  const parsed = new URL(dbUrl)
  parsed.searchParams.delete('schema')
  return parsed.toString()
}

function runSqlFile(dbUrl: string, sqlPath: string) {
  const psqlUrl = toPsqlUrl(dbUrl)
  const result = spawnSync('psql', [psqlUrl, '-v', 'ON_ERROR_STOP=1', '-f', sqlPath], {
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`Error ejecutando seed SQL: ${sqlPath}`)
  }
}

function runSql(dbUrl: string, sql: string) {
  const psqlUrl = toPsqlUrl(dbUrl)
  const result = spawnSync('psql', [psqlUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error('Error ejecutando SQL inline durante el seed')
  }
}

function runSqlCapture(dbUrl: string, sql: string) {
  const psqlUrl = toPsqlUrl(dbUrl)
  const result = spawnSync('psql', [psqlUrl, '-v', 'ON_ERROR_STOP=1', '-At', '-c', sql], {
    encoding: 'utf8',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error('Error consultando metadatos de seed')
  }

  return (result.stdout ?? '').toString().trim()
}

function toSqlLiteral(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

function checksumFile(filePath: string) {
  const buffer = readFileSync(filePath)
  return createHash('sha256').update(buffer).digest('hex')
}

function ensureSeedHistoryTable(dbUrl: string) {
  runSql(
    dbUrl,
    `
    CREATE TABLE IF NOT EXISTS "${SEED_HISTORY_TABLE}" (
      id BIGSERIAL PRIMARY KEY,
      file_name TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `
  )
}

function getStoredChecksum(dbUrl: string, fileName: string) {
  const output = runSqlCapture(
    dbUrl,
    `SELECT checksum FROM "${SEED_HISTORY_TABLE}" WHERE file_name = ${toSqlLiteral(fileName)} LIMIT 1;`
  )

  return output || null
}

function markSeedAsApplied(dbUrl: string, fileName: string, checksum: string) {
  runSql(
    dbUrl,
    `
    INSERT INTO "${SEED_HISTORY_TABLE}" (file_name, checksum)
    VALUES (${toSqlLiteral(fileName)}, ${toSqlLiteral(checksum)})
    ON CONFLICT (file_name)
    DO UPDATE SET checksum = EXCLUDED.checksum, executed_at = NOW();
    `
  )
}

function listSqlSeeds(seedsDir: string) {
  if (!existsSync(seedsDir)) {
    throw new Error(`No se encontró la carpeta de seeds: ${seedsDir}`)
  }

  const files = readdirSync(seedsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map((entry) => resolve(seedsDir, entry.name))
    .sort((a, b) => a.localeCompare(b))

  if (files.length === 0) {
    throw new Error(`No se encontraron archivos .sql en: ${seedsDir}`)
  }

  return files
}

function main() {
  const dbUrl = (process.env.DB_URL ?? process.env.DATABASE_URL ?? '').trim()
  if (!dbUrl) {
    throw new Error('DB_URL (o DATABASE_URL) no está configurada para prisma db seed')
  }

  const forceReseed = process.env.PRISMA_SEED_FORCE_RERUN === 'true'
  ensureSeedHistoryTable(dbUrl)

  const seedsDir = resolve('prisma/seeds')
  const seedFiles = listSqlSeeds(seedsDir)

  const pendingSeeds = seedFiles.filter((seedFile) => {
    if (forceReseed) {
      return true
    }

    const fileName = basename(seedFile)
    const checksum = checksumFile(seedFile)
    const storedChecksum = getStoredChecksum(dbUrl, fileName)
    return storedChecksum !== checksum
  })

  if (pendingSeeds.length === 0) {
    console.log('🌱 No hay seeds pendientes por ejecutar.')
    return
  }

  for (const seedFile of pendingSeeds) {
    runSqlFile(dbUrl, seedFile)
    markSeedAsApplied(dbUrl, basename(seedFile), checksumFile(seedFile))
  }
}

main()
