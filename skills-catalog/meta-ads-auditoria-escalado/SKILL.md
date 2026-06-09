---
name: meta-ads-auditoria-escalado
description:
  Audita el rendimiento de campañas de Meta Ads y decide cuándo escalar, iterar o apagar anuncios. Úsalo cuando el usuario comparta métricas (ROAS, CPA, CPM,
  CTR, frecuencia) y quiera saber qué está fallando, qué ad set escalar, cuándo matar un anuncio, cómo bajar el costo por compra o cómo escalar sin romper el
  rendimiento.
license: MIT
version: 1.0.0
metadata:
  category: meta-ads
  language: es
---

# Auditoría y escalado de Meta Ads

Lees métricas y das decisiones: escalar, iterar o apagar. Diagnosticas el embudo para saber DÓNDE está el problema antes de tocar nada.

## Cuándo usar este skill

- Interpretar métricas de campañas (ROAS, CPA, CPM, CTR, frecuencia).
- Decidir qué ad set escalar y cuál matar.
- Bajar el costo por compra (CPA).
- Escalar sin reiniciar aprendizaje ni disparar el CPA.

## Métricas y qué significan

- **ROAS** = ingresos / gasto. Punto de equilibrio = 1 / margen. (Margen 40% → breakeven ROAS 2.5).
- **CPA** = gasto / compras. Debe ser ≤ tu CPA máximo (margen × ~0.5).
- **CTR (link)** — interés del creativo. < 1% suele ser creativo/segmentación débil.
- **CPM** — costo por mil impresiones (competencia/calidad/público).
- **Frecuencia** — > 2-3 en público frío = fatiga de creativo.
- **Hook rate / hold rate** (video) — % que ve 3s / que retiene. Diagnostica el creativo.

## Diagnóstico del embudo (encuentra el cuello de botella)

Recorre en orden:

1. **CPM alto** → público muy chico, mala calidad de cuenta, o subasta cara. Amplía público / mejora creativo.
2. **CTR bajo** → creativo/gancho débil o público equivocado. Itera hooks/ángulos.
3. **Muchos clics, pocos ATC** → desfase anuncio↔landing o landing débil (ver skill CRO).
4. **ATC, pocas compras** → fricción en checkout, precio, confianza o pixel mal configurado. Cada síntoma tiene una palanca distinta. No subas presupuesto para
   arreglar un creativo malo.

## Reglas de decisión (testeo)

Con gasto ≥ 1-1.5× CPA objetivo por ad set:

- **0 compras** y gasto = 1.5× CPA → apagar.
- **CPA ≤ objetivo** → ganador, candidato a escalar.
- **CPA cerca del objetivo + buen CTR** → iterar (nuevos hooks) antes de matar.
- No juzgues en < 2-3 días ni con < ~50 eventos.

## Escalado sin romper

- **Vertical**: sube presupuesto 20-30% cada 2-3 días en el ganador.
- **Horizontal**: duplica el ganador en CBO/ASC, nuevos públicos o lookalikes.
- Refresca creativos antes de que suba la frecuencia (fatiga).
- Consolida presupuesto; evita fragmentar señal.
- No edites en aprendizaje; cambios grandes lo reinician.

## Formato de salida

```
LECTURA: ROAS __ | CPA $__ (obj $__) | CTR __% | CPM $__ | Frec __
CUELLO DE BOTELLA: <etapa del embudo>
DECISIÓN POR AD SET:
- Ad set A: ESCALAR (cómo)
- Ad set B: ITERAR (qué)
- Ad set C: APAGAR (por qué)
ACCIÓN PRINCIPAL: <la palanca de mayor impacto>
```

## Errores a evitar

- Subir presupuesto para tapar un creativo malo.
- Matar ad sets en horas o con poco gasto.
- Tocar todo a la vez (no sabrás qué movió la aguja).
