## Design System: Marketplace Ecommerce

### Pattern

- **Name:** Marketplace / Directory
- **Conversion Focus:** map hover pins, card carousel, Search bar is the CTA. Reduce friction to search. Popular searches suggestions.
- **CTA Placement:** Hero Search Bar + Navbar 'List your item'
- **Color Strategy:** Search: High contrast. Categories: Visual icons. Trust: Blue/Green.
- **Sections:** 1. Hero (Search focused), 2. Categories, 3. Featured Listings, 4. Trust/Safety, 5. CTA (Become a host/seller)

### Style

- **Name:** Dark Mode (OLED)
- **Keywords:** Dark theme, low light, high contrast, deep black, midnight blue, eye-friendly, OLED, night mode, power efficient
- **Best For:** Night-mode apps, coding platforms, entertainment, eye-strain prevention, OLED devices, low-light
- **Performance:** ⚡ Excellent | **Accessibility:** ✓ WCAG AAA

### Colors

| Role       | Hex     |
| ---------- | ------- |
| Primary    | #0F172A |
| Secondary  | #1E293B |
| CTA        | #22C55E |
| Background | #020617 |
| Text       | #F8FAFC |

_Notes: Dark bg + green positive indicators_

### Typography

- **Heading:** Fira Code
- **Body:** Fira Sans
- **Mood:** dashboard, data, analytics, code, technical, precise
- **Best For:** Dashboards, analytics, data visualization, admin panels
- **Google Fonts:** https://fonts.google.com/share?selection.family=Fira+Code:wght@400;500;600;700|Fira+Sans:wght@300;400;500;600;700
- **CSS Import:**

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

### Key Effects

Minimal glow (text-shadow: 0 0 10px), dark-to-light transitions, low white emission, high readability, visible focus

### Avoid (Anti-patterns)

- Light mode default
- Slow rendering

### Pre-Delivery Checklist

- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

============================================================ ✅ Design system persisted to design-system/marketplace-ecommerce/ 📄
design-system/marketplace-ecommerce/MASTER.md (Global Source of Truth)

📖 Usage: When building a page, check design-system/marketplace-ecommerce/pages/[page].md first. If exists, its rules override MASTER.md. Otherwise, use
MASTER.md. ============================================================
