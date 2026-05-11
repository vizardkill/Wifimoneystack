## Design System: Marketplace de Aplicaciones Ecommerce

> **Overrides de página** — Estas reglas anulan `MASTER.md` para todas las páginas del marketplace. Scope: `app/routes/marketplace/**`,
> `app/routes/dashboard/**`, `app/modules/marketplace/**`

---

### Paleta de Colores (CSS Variables)

```css
:root {
  --color-mp-charcoal: #050505; /* Fondo principal, texto oscuro, sidebar */
  --color-mp-ivory: #f8fafc; /* Fondo de páginas de usuario, fondos claros */
  --color-mp-neon: #39ff14; /* CTA primario, elementos activos, badges */
  --color-mp-gold: #ffd700; /* CTA descarga, acción secundaria especial */
}
```

| Token                 | Hex       | Uso principal                                |
| --------------------- | --------- | -------------------------------------------- |
| `--color-mp-charcoal` | `#050505` | Sidebar admin, texto bold, botones dark      |
| `--color-mp-ivory`    | `#F8FAFC` | Background de páginas usuario y admin layout |
| `--color-mp-neon`     | `#39FF14` | Botón "Abrir app", nav activo, badges ACTIVE |
| `--color-mp-gold`     | `#FFD700` | Botón "Descargar", acción de descarga        |

---

### Tipografía

| Rol     | Familia   | Variantes               |
| ------- | --------- | ----------------------- |
| Heading | Fira Code | 400, 500, 600, 700      |
| Body    | Fira Sans | 300, 400, 500, 600, 700 |

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

.font-heading {
  font-family: 'Fira Code', monospace;
}
.font-body {
  font-family: 'Fira Sans', sans-serif;
}
```

---

### Layout del Marketplace (Usuario)

```
┌────────────────────────────────────────────────────────────────┐
│  NAVBAR: logo | nav links | user badge           bg: charcoal  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CONTENIDO PRINCIPAL                     bg: ivory             │
│  - Grid de apps (3 cols desktop, 1 mobile)                     │
│  - Cards: icono + nombre + summary + CTA                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Layout del Dashboard (Admin)

```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR (w-60, charcoal)  │  MAIN CONTENT (flex-1, ivory)  │
│  - Logo + subtítulo        │  - Encabezado de sección        │
│  - Nav: Dashboard /        │  - Tablas / formularios         │
│         Solicitudes /      │  - Cards de métricas            │
│         Aplicaciones       │                                 │
└──────────────────────────────────────────────────────────────┘
```

---

### Componentes de UI

#### App Card (vitrina)

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
  <img className="h-14 w-14 rounded-xl object-cover" />
  <h3 className="font-heading font-semibold text-[var(--color-mp-charcoal)]" />
  <p className="text-sm text-muted-foreground line-clamp-2" />
  {/* CTA: neon para web, gold para descarga */}
  <Link className="... bg-[var(--color-mp-neon)] text-[var(--color-mp-charcoal)]" />
</div>
```

#### Badge de estado de acceso

| Estado     | Clase Tailwind                                           |
| ---------- | -------------------------------------------------------- |
| `PENDING`  | `bg-yellow-100 text-yellow-800 border border-yellow-200` |
| `APPROVED` | `bg-green-100 text-green-800 border border-green-200`    |
| `REJECTED` | `bg-red-100 text-red-800 border border-red-200`          |
| `REVOKED`  | `bg-gray-100 text-gray-600 border border-gray-200`       |

#### Badge de estado de app

| Estado     | Clase Tailwind                  |
| ---------- | ------------------------------- |
| `DRAFT`    | `bg-gray-100 text-gray-600`     |
| `ACTIVE`   | `bg-green-100 text-green-700`   |
| `INACTIVE` | `bg-yellow-100 text-yellow-700` |

---

### Patrones de Interacción

| Patrón             | Implementación                                             |
| ------------------ | ---------------------------------------------------------- |
| Hover en cards     | `hover:shadow-md transition-shadow` (150ms ease)           |
| Botones CTA        | `hover:opacity-90 transition-opacity`                      |
| Nav activo (admin) | `bg-[var(--color-mp-neon)]/10 text-[var(--color-mp-neon)]` |
| Nav hover (admin)  | `hover:text-white hover:bg-white/5`                        |
| Focus states       | `focus:ring-2 focus:ring-[var(--color-mp-neon)]/30`        |

---

### Pantallas Clave

#### Vitrina (`/marketplace`)

- Grid responsive: 1 col mobile, 2 cols tablet, 3 cols desktop
- Empty state si no hay apps activas
- Sin paginación en MVP (scroll infinito futuro)

#### Detalle de App (`/marketplace/apps/:id`)

- Hero: icono grande (80x80) + nombre + summary + CTA principal
- Tabs o secciones: Descripción → Screenshots → Video → Instrucciones
- CTA fijo o flotante en mobile

#### Estado de acceso (`/auth/access-status`)

- Pantalla centrada, minimal
- Badge grande con estado actual
- Texto explicativo según estado
- Sin navbar completo (layout simplificado)

#### Panel de Solicitudes (`/dashboard/marketplace/users`)

- Tabla con columnas: Usuario, Empresa, Fecha, Estado, Acciones
- Filtro por estado en la URL
- Botones de acción inline: Aprobar / Rechazar / Revocar

#### Catálogo Admin (`/dashboard/marketplace/apps`)

- Tabla: Nombre, Slug, Modo, Estado, Fecha, Acciones
- Botón "Nueva app" prominente
- Toggle de publicación inline

---

### Anti-patterns (Evitar)

- Fondos blancos en secciones críticas del admin (usar ivory o charcoal)
- Colores de estado hardcodeados en hex (usar clases Tailwind semánticas)
- Botones sin `hover:` state
- Textos sin contraste 4.5:1 mínimo
- `onClick` en elementos que no son `<button>` o `<a>`
- Gradientes no especificados en MASTER.md
