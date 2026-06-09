---
name: meta-ads-estructura-campanas
description:
  Diseña la estructura de campañas de Meta Ads (Facebook e Instagram) para ecommerce y dropshipping. Úsalo cuando el usuario quiera armar campañas desde cero,
  decidir entre CBO/ABO (Advantage+), definir presupuestos, número de conjuntos y anuncios, públicos, fase de testeo vs escalado, o estructurar una cuenta
  publicitaria nueva.
license: MIT
version: 1.0.0
metadata:
  category: meta-ads
  language: es
---

# Estructura de campañas en Meta Ads

Diseñas estructuras de cuenta simples y escalables para vender productos físicos. Menos complejidad, más señal para el algoritmo.

## Cuándo usar este skill

- Armar campañas desde cero.
- Elegir CBO vs ABO / Advantage+ Shopping (ASC).
- Definir presupuesto, número de ad sets y anuncios.
- Separar fase de testeo y escalado.

## Antes de estructurar, pide

- Producto, margen y CPA máximo (del unit economics).
- Presupuesto diario disponible.
- País/idioma objetivo.
- ¿Pixel/CAPI configurado y con eventos? (si no → ver skill de pixel).

## Objetivo de campaña

Para venta de producto físico: **Ventas (conversiones)**, evento `Purchase` (o `Add to Cart` solo si el pixel aún no tiene datos de compra).

## Estructuras recomendadas

### Testeo (cuenta nueva / producto nuevo)

- **ABO** para controlar gasto por público y leer señal limpia.
- 1 campaña → 3-5 ad sets (1 público cada uno) → 3 anuncios por ad set (mismos creativos).
- Presupuesto por ad set = 1-2× tu CPA objetivo (mínimo para salir de aprendizaje).
- Públicos a testear: 1-2 intereses amplios, 1 broad (sin segmentación), 1 Advantage+.

### Escalado (ya hay ganadores)

- **CBO** o **Advantage+ Shopping (ASC)** con los creativos ganadores.
- Sube presupuesto 20-30% cada 2-3 días (evita reiniciar aprendizaje), o duplica a presupuesto mayor.
- Consolida: pocos ad sets, muchos datos > muchos ad sets fragmentados.

## Públicos

- **Broad / Advantage+** funciona mejor que micro-segmentar (el algoritmo ya optimiza).
- Intereses: amplios y relacionados al producto, no nichos diminutos.
- **Retargeting** (cuando haya tráfico): visitantes, add-to-cart, video viewers, lista de clientes.
- Lookalikes 1-3% sobre compradores cuando tengas ≥100-1000 eventos.

## Reglas de oro

- No toques los ad sets en fase de aprendizaje (50 eventos/semana para salir).
- No reinicies aprendizaje con ediciones frecuentes.
- Da 2-3 días antes de juzgar (no mates un ad set en horas).
- Una cuenta ordenada: nombra campañas/ad sets de forma consistente.

## Formato de salida

```
OBJETIVO: Ventas — evento <Purchase/ATC>
FASE: Testeo / Escalado
ESTRUCTURA:
Campaña [ABO/CBO/ASC] — Presupuesto $__/día
 ├─ Ad set 1: público «…» — $__/día
 ├─ Ad set 2: …
 └─ 3 anuncios por ad set
CPA objetivo: $__  | Presupuesto total: $__/día
Criterio de éxito a 3 días: <métrica>
Siguiente paso: <escalar / iterar creativos / matar>
```
