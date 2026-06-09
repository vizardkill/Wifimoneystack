/**
 * Genera prisma/seeds/005_seed_claude_skills.sql a partir de los skills
 * CLAUDE_SKILL existentes en la DB local. El SQL es idempotente (ON CONFLICT)
 * y referencia objetos del bucket compartido (ya subidos), por lo que sembrar
 * en prod no requiere re-subir assets.
 *
 * Ejecutar: npx tsx scripts/gen-skills-seed-sql.mts
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())

const q = (v: string | null | undefined): string => (v === null || v === undefined ? 'NULL' : `'${v.replace(/'/g, "''")}'`)
const qjson = (v: unknown): string => (v === null || v === undefined ? 'NULL' : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`)

async function main(): Promise<void> {
  const { db } = await import('../app/db.server')

  const apps = await db.marketplaceApp.findMany({
    where: { category: 'CLAUDE_SKILL' },
    orderBy: { slug: 'asc' },
    include: {
      media: { orderBy: { type: 'asc' } },
      artifacts: { where: { is_active: true } },
      storefront_versions: {
        where: { kind: 'PUBLISHED' },
        include: { languages: true, media: true }
      }
    }
  })

  const lines: string[] = []
  lines.push('-- Seed: skills de Claude (dropshipping, ecommerce, Meta Ads)')
  lines.push('-- Generado desde la DB local. Idempotente. Assets en bucket compartido.')
  lines.push('BEGIN;')
  lines.push('')

  for (const app of apps) {
    lines.push(`-- ${app.name}`)
    lines.push(
      `INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")\n` +
        `VALUES (${q(app.id)}, ${q(app.slug)}, ${q(app.name)}, ${q(app.summary)}, ${q(app.description)}, ${q(app.instructions)}, 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), ${q(app.created_by_user_id)}, NOW())\n` +
        `ON CONFLICT ("slug") DO NOTHING;`
    )

    for (const m of app.media) {
      lines.push(
        `INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")\n` +
          `VALUES (${q(m.id)}, ${q(app.id)}, '${m.type}', ${q(m.storage_key)}, ${q(m.public_url)}, ${q(m.alt_text)}, ${m.sort_order}, NOW())\n` +
          `ON CONFLICT ("id") DO NOTHING;`
      )
    }

    for (const a of app.artifacts) {
      lines.push(
        `INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")\n` +
          `VALUES (${q(a.id)}, ${q(app.id)}, ${q(a.storage_key)}, ${q(a.file_name)}, ${q(a.mime_type)}, ${a.size_bytes.toString()}, ${q(a.version_label)}, ${qjson(a.skill_metadata)}, TRUE, ${q(a.created_by_user_id)}, NOW())\n` +
          `ON CONFLICT ("id") DO NOTHING;`
      )
    }

    for (const sv of app.storefront_versions) {
      lines.push(
        `INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")\n` +
          `VALUES (${q(sv.id)}, ${q(app.id)}, 'PUBLISHED', '${sv.readiness_status}', ${q(sv.summary)}, ${q(sv.description)}, ${q(sv.instructions)}, ${q(sv.developer_name)}, ${q(sv.developer_website)}, ${q(sv.support_email)}, ${q(sv.support_url)}, NOW(), ${q(sv.created_by_user_id)}, NOW())\n` +
          `ON CONFLICT ("app_id","kind") DO NOTHING;`
      )
      for (const lang of sv.languages) {
        lines.push(
          `INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")\n` +
            `VALUES (${q(lang.id)}, ${q(sv.id)}, ${q(lang.language_code)}, ${lang.sort_order}, NOW())\n` +
            `ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;`
        )
      }
      for (const svm of sv.media) {
        lines.push(
          `INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")\n` +
            `VALUES (${q(svm.id)}, ${q(sv.id)}, ${q(svm.media_id)}, ${svm.sort_order}, NOW())\n` +
            `ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;`
        )
      }
    }
    lines.push('')
  }

  lines.push('COMMIT;')
  lines.push('')

  const out = path.join(process.cwd(), 'prisma', 'seeds', '005_seed_claude_skills.sql')
  writeFileSync(out, lines.join('\n'), 'utf8')
  console.log(`Generado: ${out}`)
  console.log(`Apps: ${apps.length}`)
  await db.$disconnect()
}

main().catch((err) => {
  console.error('Generación falló:', err)
  process.exit(1)
})
