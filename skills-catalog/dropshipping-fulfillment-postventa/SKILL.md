---
name: dropshipping-fulfillment-postventa
description:
  Gestiona fulfillment, seguimiento de envíos, devoluciones, disputas y soporte postventa en dropshipping. Úsalo cuando el usuario tenga problemas de envíos
  retrasados, clientes molestos, chargebacks/disputas de PayPal o Stripe, alta tasa de devoluciones, o quiera plantillas de atención al cliente y SOPs de
  operación.
license: MIT
version: 1.0.0
metadata:
  category: dropshipping
  language: es
---

# Fulfillment y postventa (Dropshipping)

Ayudas a operar envíos y soporte para reducir disputas, devoluciones y reseñas negativas, y a mantener sanas las cuentas de pago.

## Cuándo usar este skill

- Envíos retrasados y clientes preguntando "¿dónde está mi pedido?".
- Disputas/chargebacks en PayPal, Stripe o pasarela local.
- Alta tasa de devoluciones o reembolsos.
- Necesidad de plantillas de soporte y procesos (SOP).

## Principios

- **Comunicación proactiva** evita el 80% de las disputas: avisa tiempos reales ANTES de comprar.
- **Tracking siempre**: sube número de guía y notifica cada cambio de estado.
- **Responde < 24h**: silencio = disputa.
- **Reembolso parcial > chargeback**: a veces es más barato resolver que perder la disputa y dañar la cuenta.

## Procesos clave (SOP resumidos)

### A. Confirmación de pedido

1. Email/WhatsApp inmediato: "Pedido recibido, llega en X-Y días hábiles".
2. Setea expectativa de envío REAL, no optimista.

### B. Seguimiento

1. Sube guía a la orden; activa notificaciones automáticas.
2. Día 7 sin movimiento → revisa con proveedor.
3. Día X (tu SLA) → mensaje proactivo al cliente.

### C. Cliente dice "no llegó"

1. Verifica tracking. 2. Si en tránsito: tranquiliza con fecha. 3. Si perdido: reenvío o reembolso.

### D. Devolución / no satisfecho

1. Entiende motivo. 2. Ofrece solución escalonada: instrucción de uso → reembolso parcial → reembolso total/reenvío.
2. Rara vez pidas devolver el producto físico (costo de envío internacional no compensa).

### E. Disputa / chargeback

1. Reúne evidencia: tracking, conversaciones, política aceptada.
2. Responde en plazo con toda la prueba.
3. Para prevenir: descripción clara, tiempos visibles, soporte rápido.

## Plantillas de mensajes

**Retraso:**

> "Hola [nombre], tu pedido [#] está en camino 🚚. Por alta demanda el transporte tomará unos días más. Acá tu seguimiento: [link]. Cualquier cosa estoy para
> ayudarte."

**Producto con problema:**

> "Lamento el inconveniente con [#]. Quiero resolverlo ya. Te propongo [solución]. ¿Te parece bien?"

**Pre-disputa (cliente molesto):**

> "Veo tu molestia y la entiendo. No necesitas abrir disputa, lo soluciono ahora mismo con [reembolso/reenvío]. Dame 1 minuto."

## Métricas a vigilar

- Tiempo de respuesta de soporte (< 24h).
- Tasa de disputa (< 1% del volumen; >1% riesgo de cuenta).
- Tasa de reembolso/devolución.
- % pedidos con tracking activo.

## Formato de salida

```
SITUACIÓN: <resumen>
ACCIÓN INMEDIATA: <qué hacer ya>
MENSAJE LISTO: <texto para el cliente>
PREVENCIÓN: <cómo evitar que se repita>
```
