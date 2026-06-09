/**
 * Genera íconos + hero (SVG) para cada skill CLAUDE_SKILL, los sube al storage
 * bajo el prefijo público marketplace/storefronts, registra la media y publica
 * un storefront completo (developer, idioma, galería) para que el detalle se vea
 * completo y la grilla muestre miniaturas.
 *
 * Ejecutar: npx tsx scripts/seed-skill-assets.mts
 * Idempotente: no re-sube media si ya existe; hace upsert del storefront.
 */
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())

const DEVELOPER_NAME = 'WiFiMoneyStack'
const DEVELOPER_WEBSITE = 'https://wifimoneystack.com'

type CategoryKey = 'dropshipping' | 'ecommerce' | 'meta-ads'

const CATEGORY_THEME: Record<CategoryKey, { from: string; to: string; accent: string; label: string }> = {
  dropshipping: { from: '#1e3a8a', to: '#4f46e5', accent: '#93c5fd', label: 'Dropshipping' },
  ecommerce: { from: '#064e3b', to: '#059669', accent: '#6ee7b7', label: 'Ecommerce' },
  'meta-ads': { from: '#581c87', to: '#a21caf', accent: '#f0abfc', label: 'Meta Ads' }
}

const EMOJI: Record<string, string> = {
  'dropshipping-investigacion-productos': '🔍',
  'dropshipping-sourcing-proveedores': '🤝',
  'dropshipping-auditoria-tienda-shopify': '🛍️',
  'dropshipping-fulfillment-postventa': '🚚',
  'ecommerce-copy-producto': '✍️',
  'ecommerce-seo-shopify': '📈',
  'ecommerce-email-flows-klaviyo': '✉️',
  'ecommerce-cro-landing': '🎯',
  'meta-ads-estructura-campanas': '📊',
  'meta-ads-copy-creativos': '✨',
  'meta-ads-auditoria-escalado': '📉',
  'meta-ads-pixel-capi': '🎛️'
}

const categoryOf = (slug: string): CategoryKey => {
  if (slug.startsWith('dropshipping')) return 'dropshipping'
  if (slug.startsWith('ecommerce')) return 'ecommerce'
  return 'meta-ads'
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Word-wrap simple en tspans
const wrap = (text: string, maxChars: number, maxLines: number): string[] => {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) lines.push(current)
      current = w
    } else {
      current = (current + ' ' + w).trim()
    }
    if (lines.length === maxLines) break
  }
  if (current && lines.length < maxLines) lines.push(current)
  if (lines.length === maxLines && current && lines[maxLines - 1] !== current) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1}$/, '…')
  }
  return lines
}

const iconSvg = (slug: string, theme: { from: string; to: string; accent: string }): string => {
  const emoji = EMOJI[slug] ?? '⭐'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.from}"/>
      <stop offset="1" stop-color="${theme.to}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <circle cx="256" cy="220" r="150" fill="${theme.accent}" opacity="0.16"/>
  <text x="256" y="300" font-size="220" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
</svg>`
}

const heroSvg = (title: string, summary: string, theme: { from: string; to: string; accent: string; label: string }, emoji: string): string => {
  const titleLines = wrap(title, 26, 2)
  const titleTspans = titleLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 64}">${esc(l)}</tspan>`).join('')
  const summaryLines = wrap(summary, 54, 3)
  const summaryTspans = summaryLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 38}">${esc(l)}</tspan>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.from}"/>
      <stop offset="1" stop-color="${theme.to}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1080" cy="180" r="320" fill="${theme.accent}" opacity="0.12"/>
  <circle cx="1180" cy="620" r="220" fill="#ffffff" opacity="0.06"/>
  <text x="1040" y="430" font-size="260" text-anchor="middle" opacity="0.9" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
  <rect x="80" y="96" rx="22" width="${theme.label.length * 16 + 64}" height="44" fill="#ffffff" opacity="0.16"/>
  <text x="${80 + 32}" y="125" font-size="22" font-weight="700" fill="#ffffff" font-family="Inter, system-ui, sans-serif" letter-spacing="2">${esc(theme.label.toUpperCase())}</text>
  <text x="80" y="280" font-size="58" font-weight="800" fill="#ffffff" font-family="Inter, system-ui, sans-serif">${titleTspans}</text>
  <text x="80" y="430" font-size="28" fill="#ffffff" opacity="0.92" font-family="Inter, system-ui, sans-serif">${summaryTspans}</text>
  <text x="80" y="640" font-size="24" font-weight="700" fill="#ffffff" opacity="0.85" font-family="Inter, system-ui, sans-serif">Skill para Claude · ${esc(DEVELOPER_NAME)}</text>
</svg>`
}

async function main(): Promise<void> {
  const { db } = await import('../app/db.server')
  const { uploadBufferToStorage } = await import('../app/lib/services/_storage.service')

  const admin = await db.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    select: { id: true }
  })
  const actorId = admin?.id ?? (await db.user.findFirst({ select: { id: true } }))?.id
  if (!actorId) throw new Error('No hay usuarios en la DB.')

  const apps = await db.marketplaceApp.findMany({
    where: { category: 'CLAUDE_SKILL' },
    select: { id: true, slug: true, name: true, summary: true, description: true, instructions: true }
  })
  console.log(`Skills a procesar: ${apps.length}`)

  for (const app of apps) {
    const cat = categoryOf(app.slug)
    const theme = CATEGORY_THEME[cat]
    const emoji = EMOJI[app.slug] ?? '⭐'

    // --- Media: ICON ---
    let iconMedia = await db.marketplaceAppMedia.findFirst({ where: { app_id: app.id, type: 'ICON' } })
    if (!iconMedia) {
      const up = await uploadBufferToStorage(Buffer.from(iconSvg(app.slug, theme), 'utf8'), 'marketplace/storefronts', `${app.slug}/icon.svg`, 'image/svg+xml')
      iconMedia = await db.marketplaceAppMedia.create({
        data: { app_id: app.id, type: 'ICON', storage_key: up.objectPath, public_url: up.publicUrl, alt_text: `Ícono de ${app.name}`, sort_order: 0 }
      })
      console.log(`  ↑ icono → ${up.objectPath}`)
    }

    // --- Media: SCREENSHOT (hero) ---
    let heroMedia = await db.marketplaceAppMedia.findFirst({ where: { app_id: app.id, type: 'SCREENSHOT' } })
    if (!heroMedia) {
      const up = await uploadBufferToStorage(Buffer.from(heroSvg(app.name, app.summary, theme, emoji), 'utf8'), 'marketplace/storefronts', `${app.slug}/hero.svg`, 'image/svg+xml')
      heroMedia = await db.marketplaceAppMedia.create({
        data: { app_id: app.id, type: 'SCREENSHOT', storage_key: up.objectPath, public_url: up.publicUrl, alt_text: `Vista de ${app.name}`, sort_order: 0 }
      })
      console.log(`  ↑ hero → ${up.objectPath}`)
    }

    // --- Storefront PUBLISHED (upsert) ---
    const storefront = await db.marketplaceAppStorefrontVersion.upsert({
      where: { app_id_kind: { app_id: app.id, kind: 'PUBLISHED' } },
      update: {
        readiness_status: 'READY',
        summary: app.summary,
        description: app.description,
        instructions: app.instructions,
        developer_name: DEVELOPER_NAME,
        developer_website: DEVELOPER_WEBSITE,
        published_at: new Date(),
        updated_by_user_id: actorId
      },
      create: {
        app_id: app.id,
        kind: 'PUBLISHED',
        readiness_status: 'READY',
        summary: app.summary,
        description: app.description,
        instructions: app.instructions,
        developer_name: DEVELOPER_NAME,
        developer_website: DEVELOPER_WEBSITE,
        published_at: new Date(),
        created_by_user_id: actorId
      }
    })

    // --- Idioma ---
    await db.marketplaceAppStorefrontVersionLanguage.upsert({
      where: { storefront_version_id_language_code: { storefront_version_id: storefront.id, language_code: 'es' } },
      update: {},
      create: { storefront_version_id: storefront.id, language_code: 'es', sort_order: 0 }
    })

    // --- Galería: icono + hero ---
    await db.marketplaceAppStorefrontVersionMedia.upsert({
      where: { storefront_version_id_media_id: { storefront_version_id: storefront.id, media_id: iconMedia.id } },
      update: {},
      create: { storefront_version_id: storefront.id, media_id: iconMedia.id, sort_order: 0 }
    })
    await db.marketplaceAppStorefrontVersionMedia.upsert({
      where: { storefront_version_id_media_id: { storefront_version_id: storefront.id, media_id: heroMedia.id } },
      update: {},
      create: { storefront_version_id: storefront.id, media_id: heroMedia.id, sort_order: 1 }
    })

    console.log(`✓ ${app.name} — storefront publicado (icono + hero + es)`)
  }

  console.log('\nListo. Íconos + storefronts publicados.')
  await db.$disconnect()
}

main().catch((err) => {
  console.error('Seed assets falló:', err)
  process.exit(1)
})
