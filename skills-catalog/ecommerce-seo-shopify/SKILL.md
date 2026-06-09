---
name: ecommerce-seo-shopify
description:
  Optimiza el SEO on-page de una tienda Shopify o ecommerce para traer tráfico orgánico gratis. Úsalo cuando el usuario quiera posicionar productos y
  colecciones en Google, mejorar títulos y meta descripciones, estructurar colecciones, agregar datos estructurados (schema), o hacer keyword research para
  ecommerce.
license: MIT
version: 1.0.0
metadata:
  category: ecommerce
  language: es
---

# SEO on-page para Shopify / Ecommerce

Optimizas tiendas para que Google envíe tráfico gratis y recurrente. Foco en intención de compra, no solo volumen de búsqueda.

## Cuándo usar este skill

- Posicionar productos o colecciones en Google.
- Mejorar títulos SEO y meta descripciones.
- Estructurar colecciones y arquitectura del sitio.
- Keyword research orientado a ecommerce.

## Keyword research para ecommerce

Prioriza **intención transaccional** (comprar, precio, "X para Y") sobre informativa.

- Producto: "[producto] [atributo]" → "audífonos inalámbricos deportivos".
- Colección: términos categoría → "lámparas decorativas".
- Long tail: menos volumen, más conversión y menos competencia. Herramientas: autocompletar de Google, "búsquedas relacionadas", Keyword Planner,
  AnswerThePublic.

## Optimización por tipo de página

### Producto (PDP)

- **Title tag** (≤60 car): "[Producto] [beneficio/atributo] | [Marca]".
- **Meta description** (≤155 car): beneficio + CTA + envío/garantía.
- **H1** = nombre de producto con keyword.
- URL corta y limpia: `/products/lampara-luna-3d`.
- Texto único (no copiado del proveedor) ≥ 150 palabras.
- Alt text descriptivo en imágenes.

### Colección

- H1 + 100-300 palabras de texto introductorio con keyword de categoría.
- Enlaces internos a productos destacados.

### Arquitectura

- Máx 3 clics desde home a cualquier producto.
- Colecciones lógicas; menú claro.
- Enlazado interno entre productos relacionados.

## Datos estructurados (schema)

- `Product` con precio, disponibilidad y `AggregateRating` (reseñas) → estrellas en Google.
- `BreadcrumbList` para navegación.
- `FAQPage` si tienes FAQ → ocupa más espacio en resultados. Shopify: muchos temas/apps lo agregan; verifica con Rich Results Test.

## Técnico básico

- Sitemap enviado a Google Search Console.
- Sin páginas duplicadas (cuida variantes y filtros).
- Imágenes comprimidas (afecta Core Web Vitals).
- Móvil primero.

## Método

1. Define keyword objetivo por página (1 principal).
2. Optimiza title/meta/H1/URL/contenido/alt.
3. Agrega schema relevante.
4. Mide en Search Console (impresiones, CTR, posición) a 4-8 semanas.

## Formato de salida

```
PÁGINA: <producto/colección>
Keyword principal: <…>
Title tag: <…> (X car)
Meta description: <…> (X car)
H1: <…>
URL sugerida: <…>
Schema a agregar: <…>
Acciones técnicas: <…>
```
