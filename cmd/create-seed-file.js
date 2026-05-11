#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const SEEDS_DIR = resolve('prisma/seeds')
const SEED_PATTERN = /^(\d+)_([a-z0-9_]+)\.sql$/
const DEFAULT_STEP = 10

function printHelp() {
  console.log('Uso: npm run prisma:seed:new -- <nombre_seed>')
  console.log('Ejemplo: npm run prisma:seed:new -- add_plan_limits')
}

function normalizeSeedName(rawName) {
  return rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getNextPrefix(existingFiles) {
  const numericPrefixes = existingFiles
    .map((file) => file.match(SEED_PATTERN))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter(Number.isFinite)

  if (numericPrefixes.length === 0) {
    return 1
  }

  const maxPrefix = Math.max(...numericPrefixes)
  return maxPrefix + DEFAULT_STEP
}

function buildSeedTemplate(fileName) {
  return `-- Seed: ${fileName}
-- Reglas:
-- 1) Mantener idempotencia (INSERT ... ON CONFLICT, UPSERT, IF NOT EXISTS).
-- 2) Evitar borrar datos productivos sin condicion explicita.
-- 3) En cambios destructivos, crear script separado y revisado.

BEGIN;

-- TODO: agregar statements SQL aqui

COMMIT;
`
}

function main() {
  const arg = process.argv[2]

  if (!arg || arg === '--help' || arg === '-h') {
    printHelp()
    process.exit(arg ? 0 : 1)
  }

  const seedName = normalizeSeedName(arg)
  if (!seedName) {
    throw new Error('Nombre de seed invalido. Usa letras, numeros o guiones bajos.')
  }

  if (!existsSync(SEEDS_DIR)) {
    mkdirSync(SEEDS_DIR, { recursive: true })
  }

  const existingFiles = readdirSync(SEEDS_DIR).filter((file) => file.endsWith('.sql'))

  const alreadyExists = existingFiles.some((file) => {
    const match = file.match(SEED_PATTERN)
    return match && match[2] === seedName
  })

  if (alreadyExists) {
    throw new Error(`Ya existe un seed con ese nombre: ${seedName}`)
  }

  const prefix = String(getNextPrefix(existingFiles)).padStart(3, '0')
  const fileName = `${prefix}_${seedName}.sql`
  const filePath = join(SEEDS_DIR, fileName)

  writeFileSync(filePath, buildSeedTemplate(fileName), { encoding: 'utf8', flag: 'wx' })

  console.log(`Seed creado: ${filePath}`)
  console.log(`Siguiente paso: editar ${basename(filePath)} y luego ejecutar: npx prisma db seed`)
}

main()
