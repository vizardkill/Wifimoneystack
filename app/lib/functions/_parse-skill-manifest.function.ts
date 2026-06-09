import { unzipSync } from 'fflate'
import { parse as parseYaml } from 'yaml'

/**
 * Metadata normalizada extraída del frontmatter de un SKILL.md.
 * `raw` conserva el frontmatter completo por si hay campos extra.
 */
export interface SkillManifest {
  name: string
  description: string
  license: string | null
  allowed_tools: string[]
  version: string | null
  source_path: string
  raw: Record<string, unknown>
}

export interface ParseSkillManifestSuccess {
  ok: true
  manifest: SkillManifest
}

export interface ParseSkillManifestFailure {
  ok: false
  message: string
}

export type ParseSkillManifestResult = ParseSkillManifestSuccess | ParseSkillManifestFailure

const SKILL_FILE_NAME = 'SKILL.md'
const MAX_FRONTMATTER_BYTES = 64 * 1024

/**
 * Encuentra la entrada SKILL.md dentro del ZIP. Acepta tanto en raíz como
 * dentro de una única carpeta contenedora (`mi-skill/SKILL.md`).
 */
const findSkillEntry = (entries: Record<string, Uint8Array>): { path: string; bytes: Uint8Array } | null => {
  const paths = Object.keys(entries)

  const directMatch = paths.find((path) => {
    const segments = path.split('/').filter(Boolean)
    return segments.length > 0 && segments[segments.length - 1] === SKILL_FILE_NAME
  })

  if (!directMatch) {
    return null
  }

  return { path: directMatch, bytes: entries[directMatch] }
}

/**
 * Extrae el bloque de frontmatter YAML delimitado por `---` al inicio del archivo.
 */
const extractFrontmatter = (content: string): string | null => {
  const normalized = content.replace(/^﻿/, '').replace(/\r\n/g, '\n')

  if (!normalized.startsWith('---\n')) {
    return null
  }

  const closingIndex = normalized.indexOf('\n---', 4)
  if (closingIndex === -1) {
    return null
  }

  return normalized.slice(4, closingIndex)
}

const normalizeAllowedTools = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return []
}

const asTrimmedString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

/**
 * Parsea el SKILL.md contenido en el buffer de un paquete .zip de skill de Claude.
 */
export function parseSkillManifest(zipBuffer: Uint8Array): ParseSkillManifestResult {
  let entries: Record<string, Uint8Array>

  try {
    entries = unzipSync(zipBuffer)
  } catch {
    return { ok: false, message: 'El archivo no es un .zip válido.' }
  }

  const skillEntry = findSkillEntry(entries)
  if (!skillEntry) {
    return { ok: false, message: 'El paquete no contiene un archivo SKILL.md.' }
  }

  const content = new TextDecoder('utf-8').decode(skillEntry.bytes.slice(0, MAX_FRONTMATTER_BYTES + 1024))
  const frontmatter = extractFrontmatter(content)
  if (frontmatter === null) {
    return { ok: false, message: 'El SKILL.md no tiene un frontmatter YAML válido (delimitado por ---).' }
  }

  let parsed: unknown
  try {
    parsed = parseYaml(frontmatter)
  } catch {
    return { ok: false, message: 'No se pudo parsear el frontmatter YAML del SKILL.md.' }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, message: 'El frontmatter del SKILL.md debe ser un objeto de campos.' }
  }

  const raw = parsed as Record<string, unknown>
  const name = asTrimmedString(raw.name)
  const description = asTrimmedString(raw.description)

  if (!name) {
    return { ok: false, message: 'El SKILL.md debe declarar un campo "name".' }
  }

  if (!description) {
    return { ok: false, message: 'El SKILL.md debe declarar un campo "description".' }
  }

  return {
    ok: true,
    manifest: {
      name,
      description,
      license: asTrimmedString(raw.license) || null,
      allowed_tools: normalizeAllowedTools(raw['allowed-tools'] ?? raw.allowed_tools),
      version: asTrimmedString(raw.version) || null,
      source_path: skillEntry.path,
      raw
    }
  }
}
