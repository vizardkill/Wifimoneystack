# Catálogo de Skills para Claude — Dropshipping · Ecommerce · Meta Ads

Skills listos para subir al marketplace (botón **"Nuevo skill"** en el admin → subir el `.zip`). Cada `.zip` contiene una carpeta `<slug>/SKILL.md` con
frontmatter (`name`, `description`, `license`, `version`). El parser del marketplace lee ese frontmatter automáticamente.

## Cómo subir

1. Admin → Catálogo de aplicaciones → **Nuevo skill**.
2. En el paso "Datos base", subir el `.zip` correspondiente desde `skills-catalog/dist/`.
3. Completar vitrina (resumen, icono, descripción) y **publicar**.

## Skills incluidos (12)

### Dropshipping

| Zip                                              | Para qué                                                  |
| ------------------------------------------------ | --------------------------------------------------------- |
| `dist/dropshipping-investigacion-productos.zip`  | Investigar y puntuar productos ganadores                  |
| `dist/dropshipping-sourcing-proveedores.zip`     | Elegir y negociar con proveedores (AliExpress/CJ/agentes) |
| `dist/dropshipping-auditoria-tienda-shopify.zip` | Auditar tienda Shopify para conversión                    |
| `dist/dropshipping-fulfillment-postventa.zip`    | Envíos, devoluciones, disputas y soporte                  |

### Ecommerce

| Zip                                      | Para qué                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| `dist/ecommerce-copy-producto.zip`       | Descripciones de producto que venden + SEO           |
| `dist/ecommerce-seo-shopify.zip`         | SEO on-page para tráfico orgánico                    |
| `dist/ecommerce-email-flows-klaviyo.zip` | Flujos de email/SMS (carrito, bienvenida, postventa) |
| `dist/ecommerce-cro-landing.zip`         | CRO de landing pages y PDP                           |

### Meta Ads

| Zip                                     | Para qué                             |
| --------------------------------------- | ------------------------------------ |
| `dist/meta-ads-estructura-campanas.zip` | Estructura de campañas (CBO/ABO/ASC) |
| `dist/meta-ads-copy-creativos.zip`      | Copy, ganchos, ángulos y guiones UGC |
| `dist/meta-ads-auditoria-escalado.zip`  | Auditoría de métricas y escalado     |
| `dist/meta-ads-pixel-capi.zip`          | Pixel + Conversions API (tracking)   |

## Re-empaquetar

Si editas algún `SKILL.md`, regenera los zips:

```bash
cd skills-catalog
mkdir -p dist
for d in */; do slug="${d%/}"; [ "$slug" = dist ] && continue; \
  rm -f "dist/${slug}.zip"; zip -rq "dist/${slug}.zip" "$slug"; done
```
