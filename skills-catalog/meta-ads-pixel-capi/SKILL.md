---
name: meta-ads-pixel-capi
description:
  Configura y diagnostica el Meta Pixel y la API de Conversiones (CAPI) para ecommerce y dropshipping. Úsalo cuando el usuario necesite instalar el pixel,
  configurar eventos (ViewContent, AddToCart, Purchase), montar la Conversions API, mejorar la calidad de coincidencia de eventos, arreglar eventos duplicados o
  solucionar por qué Meta no registra las compras correctamente.
license: MIT
version: 1.0.0
metadata:
  category: meta-ads
  language: es
---

# Meta Pixel + API de Conversiones (CAPI)

Configuras el rastreo que alimenta al algoritmo. Sin datos limpios de conversión, Meta no puede optimizar y el CPA se dispara. El tracking es la base, no un
extra.

## Cuándo usar este skill

- Instalar el Pixel en Shopify u otra plataforma.
- Configurar eventos estándar y la Conversions API.
- Mejorar el Event Match Quality.
- Arreglar eventos duplicados o compras no registradas.

## Por qué importa

- iOS y la pérdida de cookies degradaron el rastreo solo-navegador.
- **CAPI (server-side)** recupera señal: envía eventos desde el servidor.
- Pixel (browser) + CAPI (server) + **deduplicación** = máxima señal.

## Eventos estándar (embudo)

Configura, en orden de importancia para venta:

- `Purchase` (crítico, con `value` y `currency`)
- `InitiateCheckout`
- `AddToCart`
- `ViewContent`
- `PageView` (base) Incluye parámetros: `value`, `currency`, `content_ids`, `content_type: product`.

## Instalación (Shopify)

1. Conecta Shopify ↔ Meta vía el canal "Facebook & Instagram" o app oficial.
2. Activa el Pixel y la **Conversions API** (Shopify la soporta nativamente).
3. Verifica que pase `value` y `currency` en `Purchase`.
4. Confirma el dominio y completa la **verificación de dominio** en Business Manager.
5. Configura **Aggregated Event Measurement** (8 eventos priorizados; `Purchase` primero).

## Deduplicación (evita doble conteo)

- Pixel y CAPI deben enviar el **mismo `event_id`** por evento.
- Sin dedupe verás compras infladas y mala optimización.
- Shopify nativo lo maneja; en setups manuales asegúrate de pasar `event_id`.

## Event Match Quality (mejor coincidencia = mejor optimización)

Envía datos de cliente (hasheados) en CAPI: email, teléfono, nombre, ciudad, IP, user-agent, `fbp`/`fbc`. Más parámetros de coincidencia → mejor atribución y
rendimiento.

## Diagnóstico (Test Events / Events Manager)

- **Compras no aparecen** → CAPI/pixel sin `Purchase` o sin verificación de dominio.
- **Compras infladas** → falta deduplicación (event_id distinto).
- **Match quality bajo** → faltan parámetros de cliente en CAPI.
- Usa la pestaña **Test Events** para ver eventos en vivo y el **Diagnóstico** del Events Manager.

## Checklist de salida

```
[ ] Pixel instalado y disparando PageView
[ ] Eventos: ViewContent, AddToCart, InitiateCheckout, Purchase
[ ] Purchase envía value + currency + content_ids
[ ] Conversions API activa
[ ] Deduplicación por event_id verificada
[ ] Dominio verificado en Business Manager
[ ] Aggregated Event Measurement configurado (Purchase prioritario)
[ ] Event Match Quality "Bueno/Excelente"
```

## Formato de salida

```
ESTADO ACTUAL: <qué está y qué falta>
PROBLEMA RAÍZ: <causa>
PASOS A SEGUIR (orden): 1)… 2)… 3)…
CÓMO VERIFICAR: <Test Events / Events Manager>
```
