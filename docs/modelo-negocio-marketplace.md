# Modelo de Negocio: Marketplace de Aplicaciones Ecommerce

## ¿Qué es este producto?

Es una plataforma de distribución interna controlada, estilo Shopify App Store, diseñada para que equipos de ecommerce accedan a herramientas y aplicaciones
open-source desarrolladas por nuestro equipo. El acceso es exclusivo: los usuarios deben registrarse y esperar aprobación manual de un administrador antes de
poder ver la vitrina.

---

## ¿Quiénes participan?

### Usuario (Comerciante / Equipo Ecommerce)

- Se registra en la plataforma
- Queda en estado **PENDIENTE** hasta que un admin revise su solicitud
- Puede consultar su estado de aprobación en cualquier momento
- Una vez **APROBADO**, accede a la vitrina completa de aplicaciones
- Puede abrir aplicaciones web o descargar paquetes (ZIP)
- Si es **RECHAZADO** o **REVOCADO**, pierde el acceso y ve un mensaje explicativo

### Administrador

- Gestiona las solicitudes de acceso (aprobar, rechazar, revocar)
- Alimenta la vitrina con fichas de aplicaciones (nombre, descripción, media, artefactos)
- Activa o desactiva apps en la vitrina sin borrar historial
- Consulta dashboards de usuarios y uso de aplicaciones

---

## Flujo de Negocio Principal

```
Usuario                          Plataforma                        Admin
  │                                  │                               │
  ├─ Se registra (signup) ──────────>│                               │
  │                                  ├── Crea solicitud PENDING ─────>│
  │                                  │                               │
  ├─ Consulta estado ───────────────>│                               │
  │<─ "En revisión" ─────────────────┤                               │
  │                                  │                               ├─ Ve solicitud pendiente
  │                                  │                               ├─ Decide: APPROVED / REJECTED
  │                                  │<── Estado actualizado ─────────┤
  │                                  │                               │
  ├─ Ingresa al marketplace ────────>│                               │
  │  (solo si APPROVED)              │                               │
  │<─ Vitrina de aplicaciones ───────┤                               │
  │                                  │                               │
  ├─ Abre app o descarga ───────────>│                               │
  │                                  ├── Registra evento de uso ─────>│
  │<─ URL de uso / archivo ──────────┤                               │
```

---

## Estados de Acceso

| Estado     | Descripción                                              | Siguiente estado posible   |
| ---------- | -------------------------------------------------------- | -------------------------- |
| `PENDING`  | Solicitud recibida, pendiente de revisión administrativa | APPROVED, REJECTED         |
| `APPROVED` | Acceso habilitado al marketplace                         | REVOKED                    |
| `REJECTED` | Solicitud denegada                                       | APPROVED (re-aprobación)   |
| `REVOKED`  | Acceso activo retirado manualmente                       | APPROVED (re-habilitación) |

---

## Tipos de Aplicaciones

### Web Link (`WEB_LINK`)

- La app vive en un URL externo
- El usuario hace clic en "Abrir aplicación" y es redirigido
- El evento `WEB_OPEN` se registra para analytics

### Package Download (`PACKAGE_DOWNLOAD`)

- La app es distribuida como archivo ZIP o binario
- El usuario hace clic en "Descargar" y recibe el artefacto más reciente
- El evento `DOWNLOAD` se registra con versión e ID de artefacto

---

## Propuesta de Valor

| Para el usuario                             | Para el equipo interno                          |
| ------------------------------------------- | ----------------------------------------------- |
| Acceso centralizado a herramientas probadas | Control total sobre quién accede al catálogo    |
| Instrucciones de uso en la misma pantalla   | Trazabilidad de uso por aplicación y usuario    |
| Descarga directa o acceso web sin fricción  | Dashboard de adopción y solicitudes pendientes  |
| Sin costo de suscripción en el MVP          | Capacidad de activar/desactivar apps sin borrar |

---

## Fuera de Alcance (MVP)

- Pagos o comisiones
- Reviews o valoraciones públicas
- Ranking pagado
- Integración con pasarela de pagos
- Onboarding guiado con tooltips
- Perfiles de usuario públicos
- API pública del marketplace

---

## KPIs de Éxito (MVP)

| Métrica                           | Meta inicial       |
| --------------------------------- | ------------------ |
| Tiempo de aprobación promedio     | < 48 horas         |
| Tasa de aprobación de solicitudes | > 80%              |
| Apps activas en vitrina           | ≥ 5 al lanzamiento |
| Eventos de uso por semana         | > 50 en primer mes |
| Tiempo de carga del marketplace   | < 1 segundo p95    |

## Dashboard Operativo (Admin Console)

El panel administrativo del marketplace expone dos bloques de métricas:

### 1) KPIs actuales (foto del estado)

- Solicitudes: `pending_requests`, `approved_users`, `rejected_requests`, `revoked_users`.
- Catálogo: `active_apps`, `draft_apps`, `inactive_apps`.
- Totales de control: `total_requests`, `total_apps`.

### 2) Variación de 7 días (dinámica reciente)

- `new_users_7d`: cantidad de usuarios nuevos creados en 7 días.
- `access_decisions_7d`: decisiones administrativas de acceso (approve/reject/revoke) en 7 días.
- `apps_activated_7d`: publicaciones de apps en 7 días (`APP_PUBLISHED`).
- `apps_deactivated_7d`: despublicaciones de apps en 7 días (`APP_UNPUBLISHED`).

Estas métricas permiten diferenciar entre estado acumulado y movimiento reciente para tomar decisiones operativas sin perder contexto.

---

## Operación en Desarrollo Local

Para acelerar pruebas funcionales del flujo de negocio, el proyecto incluye un seed con usuarios demo, estados de acceso y apps de ejemplo.

- Ver detalle en [Datos de Prueba y Seed Local](datos-de-prueba.md)
- Ver flujo técnico completo en [Cómo Funciona el Sistema](como-funciona-el-sistema.md)
