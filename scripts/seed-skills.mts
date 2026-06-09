/**
 * Seed de skills de Claude al marketplace.
 * Lee los .zip de skills-catalog/dist, parsea su SKILL.md, sube el paquete al
 * storage y crea (o actualiza) el MarketplaceApp como CLAUDE_SKILL publicado.
 *
 * Ejecutar: npx tsx scripts/seed-skills.mts
 * Idempotente: re-ejecutar no duplica (upsert por slug; artefacto solo si falta).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'skills-catalog', 'dist')

// title + summary corto por slug (summary <= 120 car)
const CATALOG: Array<{ slug: string; title: string; summary: string }> = [
  {
    slug: 'dropshipping-investigacion-productos',
    title: 'Investigación de Productos Ganadores',
    summary: 'Encuentra y puntúa productos ganadores para dropshipping con criterios de validación y unit economics.'
  },
  {
    slug: 'dropshipping-sourcing-proveedores',
    title: 'Sourcing y Proveedores',
    summary: 'Elige, vetea y negocia con proveedores confiables (AliExpress, CJ, agentes) por costo y tiempos.'
  },
  {
    slug: 'dropshipping-auditoria-tienda-shopify',
    title: 'Auditoría de Tienda Shopify',
    summary: 'Audita tu tienda Shopify para subir conversión: página de producto, confianza, móvil y checkout.'
  },
  {
    slug: 'dropshipping-fulfillment-postventa',
    title: 'Fulfillment y Postventa',
    summary: 'Gestiona envíos, tracking, devoluciones, disputas y soporte para reducir chargebacks.'
  },
  {
    slug: 'ecommerce-copy-producto',
    title: 'Copy de Producto que Vende',
    summary: 'Redacta fichas de producto persuasivas y con SEO: títulos, beneficios y manejo de objeciones.'
  },
  {
    slug: 'ecommerce-seo-shopify',
    title: 'SEO para Shopify',
    summary: 'Optimiza SEO on-page para traer tráfico orgánico: títulos, meta, colecciones y datos estructurados.'
  },
  {
    slug: 'ecommerce-email-flows-klaviyo',
    title: 'Flujos de Email & SMS',
    summary: 'Diseña automatizaciones (carrito, bienvenida, postventa, winback) para recuperar ventas y recompra.'
  },
  {
    slug: 'ecommerce-cro-landing',
    title: 'CRO de Landing Pages',
    summary: 'Sube la conversión de landings y PDP: estructura, copy, prueba social y pruebas A/B priorizadas.'
  },
  {
    slug: 'meta-ads-estructura-campanas',
    title: 'Estructura de Campañas Meta Ads',
    summary: 'Arma campañas en Meta Ads: CBO/ABO/Advantage+, presupuestos, públicos y fase testeo vs escalado.'
  },
  {
    slug: 'meta-ads-copy-creativos',
    title: 'Copy y Creativos Meta Ads',
    summary: 'Genera ganchos, ángulos, copy de anuncios y guiones UGC que detienen el scroll y venden.'
  },
  {
    slug: 'meta-ads-auditoria-escalado',
    title: 'Auditoría y Escalado Meta Ads',
    summary: 'Lee métricas (ROAS, CPA, CTR) y decide escalar, iterar o apagar. Diagnostica el embudo.'
  },
  {
    slug: 'meta-ads-pixel-capi',
    title: 'Pixel + Conversions API',
    summary: 'Configura y diagnostica el Meta Pixel y la API de Conversiones para un tracking limpio.'
  }
]

const INSTALL_INSTRUCTIONS = [
  'Cómo instalar este skill en Claude:',
  '',
  '1. Descarga el archivo .zip.',
  '2. Descomprímelo dentro de la carpeta de skills de Claude:',
  '   ~/.claude/skills/   (crea la carpeta si no existe)',
  '3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md',
  '4. Reinicia Claude Code.',
  '',
  'Claude activará el skill automáticamente cuando tu pregunta sea relevante.'
].join('\n')

async function main(): Promise<void> {
  const { db } = await import('../app/db.server')
  const { uploadBufferToStorage } = await import('../app/lib/services/_storage.service')
  const { parseSkillManifest } = await import('../app/lib/functions/_parse-skill-manifest.function')

  // Actor: primer admin/superadmin disponible
  const admin = await db.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    select: { id: true, email: true }
  })
  const actorId = admin?.id ?? (await db.user.findFirst({ select: { id: true } }))?.id
  if (!actorId) {
    throw new Error('No hay usuarios en la DB para asignar como creador. Crea un usuario admin primero.')
  }
  console.log(`Actor (created_by): ${admin?.email ?? actorId}`)

  let created = 0
  let updated = 0
  let skippedArtifact = 0

  for (const entry of CATALOG) {
    const zipPath = path.join(DIST, `${entry.slug}.zip`)
    const buffer = new Uint8Array(readFileSync(zipPath))
    const parsed = parseSkillManifest(buffer)
    if (!parsed.ok) {
      console.log(`❌ ${entry.slug}: ${parsed.message} — omitido`)
      continue
    }
    const manifest = parsed.manifest

    // Upsert app por slug
    const existing = await db.marketplaceApp.findUnique({ where: { slug: entry.slug } })

    let appId: string
    if (existing) {
      const app = await db.marketplaceApp.update({
        where: { id: existing.id },
        data: {
          name: entry.title,
          summary: entry.summary,
          description: manifest.description,
          instructions: INSTALL_INSTRUCTIONS,
          access_mode: 'PACKAGE_DOWNLOAD',
          category: 'CLAUDE_SKILL',
          status: 'ACTIVE',
          published_at: existing.published_at ?? new Date(),
          updated_by_user_id: actorId
        }
      })
      appId = app.id
      updated++
      console.log(`↻ actualizado: ${entry.title} (${entry.slug})`)
    } else {
      const app = await db.marketplaceApp.create({
        data: {
          slug: entry.slug,
          name: entry.title,
          summary: entry.summary,
          description: manifest.description,
          instructions: INSTALL_INSTRUCTIONS,
          access_mode: 'PACKAGE_DOWNLOAD',
          category: 'CLAUDE_SKILL',
          status: 'ACTIVE',
          published_at: new Date(),
          created_by_user_id: actorId
        }
      })
      appId = app.id
      created++
      console.log(`✚ creado: ${entry.title} (${entry.slug})`)
    }

    // Artefacto: solo si no hay activo (evita re-subir en re-ejecuciones)
    const activeArtifact = await db.marketplaceAppArtifact.findFirst({
      where: { app_id: appId, is_active: true }
    })
    if (activeArtifact) {
      skippedArtifact++
      console.log(`  · ya tiene artefacto activo, no se re-sube`)
      continue
    }

    const objectFileName = `${entry.slug}/skill.zip`
    const uploaded = await uploadBufferToStorage(Buffer.from(buffer), 'marketplace/artifacts', objectFileName, 'application/zip')

    await db.marketplaceAppArtifact.create({
      data: {
        app_id: appId,
        storage_key: uploaded.objectPath,
        file_name: `${entry.slug}.zip`,
        mime_type: 'application/zip',
        size_bytes: BigInt(buffer.byteLength),
        version_label: manifest.version ?? undefined,
        skill_metadata: {
          name: manifest.name,
          description: manifest.description,
          license: manifest.license,
          allowed_tools: manifest.allowed_tools,
          version: manifest.version,
          source_path: manifest.source_path,
          raw: manifest.raw
        },
        created_by_user_id: actorId
      }
    })
    console.log(`  ↑ artefacto subido → ${uploaded.objectPath}`)
  }

  console.log(`\nRESUMEN: ${created} creados, ${updated} actualizados, ${skippedArtifact} sin re-subir artefacto.`)
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error('Seed falló:', err)
  process.exit(1)
})
