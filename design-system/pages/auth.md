## Design System: Páginas de Autenticación

> **Overrides de página** — Estas reglas anulan `MASTER.md` para las rutas de autenticación. Scope: `app/routes/auth/**`, `app/modules/auth/**`

---

### Paleta de Colores

Hereda la paleta global del marketplace (ver `MASTER.md`). Las auth pages son **100% dark OLED**.

| Token                | Hex       | Uso en auth                                        |
| -------------------- | --------- | -------------------------------------------------- |
| `--color-mp-black`   | `#020617` | Fondo global del shell, panel de marca             |
| `--color-mp-surface` | `#0f172a` | Fondo del form panel (panel derecho)               |
| `--color-mp-border`  | `#1e293b` | Borders de inputs, divisores                       |
| `--color-mp-ivory`   | `#f8fafc` | Texto principal sobre fondo oscuro                 |
| `--color-mp-muted`   | `#94a3b8` | Subtítulos, placeholders, footer del panel         |
| `--color-mp-green`   | `#22c55e` | CTA principal, badges de estado ACTIVO, ring focus |
| `--color-mp-danger`  | `#ff3b3b` | Errores de validación, estado REVOCADO             |

> **No usar**: `--color-mp-gold` (eliminado), estilos claros, fondos blancos.

---

### Tipografía

- **Heading / Monospace UI**: `Fira Code` — wordmark WMC, títulos de formulario, badges de estado, metadatos terminalstyle
- **Body / Labels / Inputs**: `Fira Sans` — copy, labels, mensajes de error, links

---

### Layout: Split Screen

```
┌──────────────────────────┬──────────────────────────┐
│   BRAND PANEL (desktop)  │      FORM PANEL           │
│   bg: #020617            │   bg: --background        │
│   w-[45%]                │   flex-1                  │
│                          │                           │
│  WMC · MARKETPLACE       │  [titulo Fira Code]       │
│  V04.26 · COL · MEX…     │  [subtitulo Fira Sans]    │
│                          │                           │
│  "21 APPS.               │  [form fields]            │
│   CORRIENDO."            │                           │
│                          │  [CTA button green]       │
│  APPS ACTIVAS    21      │                           │
│  ÓRDENES / MES 15.000    │  [OAuth button]           │
│  OPERADORES     800+     │                           │
│                          │  [links secundarios]      │
│  ● SISTEMA · ACTIVO      │                           │
└──────────────────────────┴──────────────────────────┘

Mobile: header bar con wordmark + badge, luego form a full width
```

---

### Pantallas

#### Login (`/auth/login`)

- Title: `"Iniciar sesión"` (Fira Code, font-bold)
- Subtitle: `"Accedé al marketplace de apps ecommerce"`
- Campos: Email, Password (con toggle show/hide)
- CTA: `"Iniciar sesión"` (bg: `--primary` #22c55e, text: white, h-12, w-full)
- Link olvidé contraseña: alineado a la derecha, estilo muted
- Divisor: `o continúa con`
- OAuth: `"Continuar con Google"` (outline, border-border)
- Link: `"¿No tienes una cuenta? Regístrate aquí"`

#### Registro (`/auth/signup`)

- Title: `"Crear cuenta"`
- Subtitle: `"Solicitá acceso al stack WMC"`
- Campos: Nombre, Apellido, Email, Password, Confirmar Password
- Nota info: alert informando que el acceso queda pendiente de revisión
- CTA: `"Crear cuenta"` (bg: #22c55e)
- OAuth: Botón Google

#### Estado de Acceso (`/auth/access-status`)

- Sin formulario. Solo información del estado.
- Badge terminal con estado actual:
  - `PENDING` → `● EN REVISIÓN` (muted/amber)
  - `APPROVED` → `● APROBADO` (green)
  - `REJECTED` → `● RECHAZADO` (red)
  - `REVOKED` → `● REVOCADO` (red)
- Texto explicativo por estado
- CTA según estado (ir al marketplace / contactar soporte)

#### Verificación de Email (`/auth/verification-status`)

- Pantalla de confirmación con badge `● VERIFICACIÓN · PENDIENTE`
- Texto: "Revisá tu correo y hacé clic en el enlace de verificación"
- Link: "Reenviar correo"

#### Reset de Contraseña (`/auth/forgot-password`, `/auth/reset-password`)

- Un campo por pantalla (minimal)
- Feedback de éxito inline (no modal)

---

### Estilos de Inputs (Dark OLED)

```css
/* Input dark — provisto por shadcn con tokens dark */
.auth-input {
  border: 1px solid var(--color-mp-border); /* #1e293b */
  border-radius: 0.375rem;
  background: var(--color-mp-surface); /* #0f172a */
  color: var(--color-mp-ivory); /* #f8fafc */
  padding: 0.625rem 0.875rem;
  font-family: 'Fira Sans', sans-serif;
  font-size: 0.9375rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.auth-input:focus {
  outline: none;
  border-color: var(--color-mp-green); /* #22c55e */
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.auth-input[aria-invalid='true'] {
  border-color: var(--color-mp-danger); /* #ff3b3b */
}
```

---

### Anti-patterns (Evitar)

- Cualquier fondo claro/blanco en el auth shell
- Usar colores legacy (indigo `#6366F1`, emerald `#10B981`, dorado `#D4AF37`)
- Copy de fitness/coaching ("atletas", "rutinas", "coach") — esto es un marketplace ecommerce
- Branding legacy del producto anterior (nombre, logo, lottie animations de fitness)
- Mostrar errores de validación antes de que el usuario interactúe con el campo
- Múltiples CTAs de igual jerarquía visual en la misma pantalla
- Redirigir al marketplace sin verificar `accessStatus === 'APPROVED'`

---

### Pre-Delivery Checklist

- [ ] Contraste mínimo 4.5:1 en texto ivory sobre fondos dark
- [ ] `cursor-pointer` en todos los elementos clicables
- [ ] Hover states con transición de 150ms
- [ ] Focus ring verde visible en todos los inputs y botones
- [ ] Mensajes de error accesibles con `role="alert"` o `aria-live`
- [ ] Responsive: 375px, 768px, 1024px
- [ ] `prefers-reduced-motion` respetado en transiciones
- [ ] Ninguna referencia al branding legacy en copy, meta tags o componentes
