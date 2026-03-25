# CXUM — Cuadernos X Un Mañana

Sitio web oficial de **CXUM**, una iniciativa sin fines de lucro enfocada en generar impacto social a través de la educación y recursos accesibles.

---

## Stack

| Tecnología | Uso |
|---|---|
| React 19 + TypeScript | UI y lógica de componentes |
| Vite 7 | Bundler y dev server |
| Tailwind CSS 4 | Estilos utilitarios |
| Framer Motion 12 | Animaciones de UI (navbar, dropdowns, transiciones) |
| GSAP 3 | Animaciones de scroll y efectos de entrada |
| React Router DOM 7 | Enrutamiento entre páginas |
| Iconify | Sistema de íconos (Solar, Duo Icons, Iconamoon) |

---

## Estructura principal

```
src/
├── assets/               # Logos e imágenes estáticas
├── components/
│   ├── ModularUI/
│   │   ├── NavBar.tsx          # Navbar animada con fases de entrada
│   │   ├── NavBarDropDown.tsx  # Dropdown con resize animado y cards
│   │   ├── GeneralButton.tsx   # Botón reutilizable
│   │   └── IconsMock.tsx       # Wrapper de Iconify
│   └── ...
├── hooks/
│   ├── context/
│   │   ├── SettingsContext.tsx  # Tema (dark/light)
│   │   └── AnimationContext.tsx # Estado de animaciones globales
│   └── ...
├── types/
│   └── NavBarLinks.tsx         # Links de navegación, enum de secciones e InfoCards
└── ...
```

---

## Navbar

La navbar tiene un sistema de animación por fases:

- **Fase 0 → 1** — El logo entra deslizándose desde el centro con rotación
- **Fase 1 → 2** — La barra se expande desde el logo hacia los extremos
- **Fase 2** — Aparecen los links, el toggle de tema y el botón de donación

### Dropdown

Cada link del nav tiene un dropdown asociado definido en `InfoCards`. Al hacer hover:

1. El dropdown aparece con fade + slide
2. El contenido del card activo hace crossfade con `AnimatePresence mode="wait"`
3. El contenedor **anima su ancho** usando `ResizeObserver` + `animate={{ width }}` — sin `layout` para evitar flickeo

### Variantes de card

| Variante | Descripción |
|---|---|
| `CardVariant1` | Ícono + título + subtítulo. Click hace scroll suave a la sección |
| `CardVariant2` | Solo título + flecha. Para links de acción rápida |

### Links de sección

Los anchors están centralizados en el enum `SectionLinks`:

```ts
export enum SectionLinks {
    Inicio     = "#inicio",
    Plataforma = "#plataforma",
    Recursos   = "#recursos",
    Precios    = "#precios",
}
```

Cada sección de la página debe tener el `id` correspondiente:

```html
<section id="inicio">...</section>
<section id="plataforma">...</section>
<section id="recursos">...</section>
<section id="precios">...</section>
```

---

## Comandos

```bash
# Instalar dependencias
npm install

# Dev server
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

---

## Temas

El tema se controla desde `SettingsContext`. Los componentes leen `theme === "dark"` y aplican clases de Tailwind condicionalmente. El toggle está en la navbar.
