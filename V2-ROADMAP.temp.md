# Hoja de ruta v2 — Frontpage

> Archivo temporal de referencia. Borrar o mover a docs/ cuando ya no lo necesites.

Basado en el estado del proyecto tras v1 (Core + deploy). La v1 cubre las **12 features Core** con calidad de deploy; v2 consiste en completar lo que ya está **a medias**, luego Stretch, y por último lo que exige **decisiones de producto propias**.

**Última revisión:** 24 jun 2026 — **2B.5 Bookmarks ✅** (pendiente smoke test prod)

---

## Dónde estás ahora

| Área | Estado |
|------|--------|
| Auth, landing, guest, RSS, listas, read state, reader | ✅ Hecho |
| Performance (skeletons, lazy images, virtualización) | ✅ Hecho |
| Deploy Vercel | ✅ Hecho |
| **Editar/eliminar/refresh feeds** | ✅ UI en `feed-list-header.tsx` → edit, delete, refresh manual |
| **Gestión de categorías** | ✅ UI completa: `edit-categories-dialog.tsx` (reorder drag-and-drop), `rename-category-dialog.tsx`, `delete-category-dialog.tsx`, `add-category-dialog.tsx` |
| **Búsqueda (#14)** | ✅ `searchFeedItems` en `items.ts`, `/search`, `search-feeds.tsx`, highlight, empty states, nav Search en sidebar |
| **Bookmarks / Saved (#13)** | ✅ `bookmarks.ts`, `/saved`, botón en `feed-item-row` + `bookmark-button.tsx` en reader, `isBookmarked` en queries |
| **Empty state usuario nuevo** | ✅ `feed-list-empty-state.tsx` con CTA `AddFeedDialog` en dashboard |
| **Sidebar colapsable** | ✅ `app-shell-client.tsx` + `app-sidebar.tsx` (Framer Motion, `localStorage`, altura fija) |
| **Animación filas de feed** | ✅ `virtualized-item-list.tsx` + `AnimatePresence` (listas &lt; 50 items) |
| **OPML** | Datos de ejemplo en `src/data/`, **sin import/export** |
| **Refresh automático** | Campos `refresh_interval` en DB, **sin cron** |
| **Design Challenges** (onboarding, digest, layouts) | ❌ No empezados |
| **Prod auth** | ✅ Env vars Supabase en Vercel + smoke test en incógnito |

**Idea clave:** **2B.5 Bookmarks cerrado.** Siguiente: **2C onboarding** (Design Challenge) → OPML/cron después.

---

## Avances recientes (bookmarks + animaciones)

| Archivo | Qué hace |
|---------|----------|
| `src/actions/bookmarks.ts` | `toggleBookmarkItem` (estado deseado, como `setItemReadState`), `getBookmarkedItems` (query desde `bookmarks` → `feed_items`) |
| `src/actions/utils.ts` | `FEED_ITEM_SELECT` incluye join `bookmarks`; `mapFeedItemRow` expone `isBookmarked`; tipo `DbFeedItemQueryRow` |
| `src/app/(app)/saved/page.tsx` | Lista con `FeedBrowseView`, empty state, enlace a dashboard |
| `src/components/reader/bookmark-button.tsx` | Client component: toggle + `router.refresh()`, labels “Save article” / “Remove from saved” |
| `src/components/reader/reader-article.tsx` | `BookmarkButton` junto a “View original” |
| `src/components/items/feed-item-row.tsx` | Botón bookmark en fila de lista |
| `src/components/items/virtualized-item-list.tsx` | `motion.li` + `AnimatePresence mode="popLayout"` en listas no virtualizadas |
| `src/types/actions.ts` | `isBookmarked` en `FeedItemWithMeta` |

**Patrones usados:** bookmark como read state (server action + `revalidatePath`), join `bookmarks` en select de items, página `/saved` reutiliza `FeedBrowseView`, `AnimatePresence` requiere `motion.*` como hijo directo con `key`.

**Pendiente menor en bookmarks:** smoke test incógnito en prod (guardar → `/saved` → quitar).

---

## Avances anteriores (búsqueda + shell + empty state)

| Archivo | Qué hace |
|---------|----------|
| `src/actions/items.ts` → `searchFeedItems` | `ilike` en título/descripción, scope del usuario, `FEED_ITEM_SELECT` |
| `src/app/(app)/search/page.tsx` | Lee `?q=`, estados vacío / sin resultados / lista con `FeedBrowseView` |
| `src/components/shared/search-feeds.tsx` | Input con navegación a `/search?q=`, `Suspense`, sync con URL |
| `src/components/shared/highlight-text.tsx` | Resalta término en título y excerpt (patterns.md) |
| `src/components/shared/header-nav.tsx` | Buscador en header desktop; `/search` en rutas dashboard |
| `src/components/dashboard/app-shell/app-sidebar.tsx` | Nav “Search” + “Saved”, input móvil, sidebar colapsable |
| `src/components/dashboard/app-shell/app-shell-client.tsx` | Ancho animado (spring), drawer móvil (`AnimatePresence`), layout `h-dvh` |
| `src/components/items/feed-list-empty-state.tsx` | CTA “Add feed” cuando dashboard sin items |

**Pendiente menor en búsqueda (opcional):** atajo de teclado (`/` o `Cmd+K`), paginación si hay >30 resultados, tooltips en sidebar colapsado.

---

## Fase 2A — Cerrar el Core “de verdad” (1–2 semanas)

**Objetivo:** que un usuario autenticado pueda gestionar sus feeds sin tocar la base de datos.

### 1. Configurar producción

- Añadir en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Probar en incógnito: signup → dashboard → add feed → read/unread → búsqueda
- **Criterio de done:** flujo completo sin errores 500
- **Estado:** ✅ Hecho (env vars en Vercel + smoke test incógnito)

### 2. UI de gestión de feeds

- **Leer primero:** `src/actions/feeds.ts`, `add-feed-dialog.tsx`, `feed-list-header.tsx`
- Editar título/categoría, eliminar con confirmación, refresh manual por feed
- **Hecho:** editar, eliminar y “Refresh feed data” en menú Actions de vista `/feed/[id]`
- **Criterio de done:** CRUD completo desde la UI, sin llamar actions desde consola
- **Estado:** ✅ Hecho

### 3. UI de gestión de categorías

- **Criterio de done:** sidebar refleja orden y cambios tras `revalidatePath`
- **Estado:** ✅ Hecho

### 4. Empty states para usuario nuevo

- Dashboard sin feeds → CTA claro para añadir el primero
- **Hecho:** `FeedListEmptyState` con `AddFeedDialog` cuando `scope === "all"` y lista vacía
- **Criterio de done:** usuario recién registrado no ve pantalla vacía sin guía
- **Estado:** ✅ Hecho

**Progreso 2A:** ✅ **100 % — fase cerrada**

---

## Fase 2B — Stretch features (2–3 semanas)

Orden sugerido por dependencias y valor:

### 5. Bookmarks / Saved (#13)

- **DB:** tabla `bookmarks` ya existe en la migración
- **Hecho:**
  - `src/actions/bookmarks.ts` — `toggleBookmarkItem`, `getBookmarkedItems`
  - `src/app/(app)/saved/page.tsx` — lista + empty state
  - Botón bookmark en `feed-item-row.tsx` y `bookmark-button.tsx` (reader)
  - `isBookmarked` en queries de items (`FEED_ITEM_SELECT` + `mapFeedItemRow`)
  - Sidebar “Saved” enlaza a página funcional
- **Pendiente:** smoke test prod (guardar → `/saved` → quitar)
- **Criterio de done:** guardar, listar, quitar bookmark; sidebar “Saved” funcional
- **Estado:** ✅ **Hecho en código**

### 6. Búsqueda (#14)

- **Hecho:** `searchFeedItems` (`ilike` título + descripción), `/search`, input header + sidebar móvil, highlight, empty states alineados con `patterns.md`, límite `DEFAULT_PAGE_SIZE` (30)
- **Opcional después:** `tsvector` + GIN si crece mucho el catálogo; atajo de teclado
- **Criterio de done:** búsqueda < 500 ms con 100+ items; resultados navegables
- **Estado:** ✅ Hecho (validar en prod con dataset real)

### 7. OPML import/export (#15)

- **Estado:** ⬜ No empezado

### 8. Refresh automático (#16)

- **Estado:** ⬜ No empezado

---

## Fase 2C — Un Design Challenge (1–2 semanas)

| Challenge | Qué implica | Complejidad |
|-----------|-------------|-------------|
| **Onboarding / content discovery** | Flujo primer uso, feeds sugeridos, empty states ricos | Media — encaja con 2A.4 ya cerrado |
| **Digest / “what did I miss?”** | Vista resumen por tiempo/categoría | Media-alta |
| **Layout customization** | `profiles.layout` ya en DB; grid vs lista vs compacto | Alta |

**Recomendación:** onboarding (guest con 19 feeds como referencia).

**Estado:** ⬜ No empezado

---

## Fase 2D — Polish y diferenciador (opcional)

### 9. Mejoras de rendimiento guest

- Accessibility 79 en `/guest` — objetivo > 90

### 10. Atajos de teclado (#17–18)

- `j/k` navegar, `o` abrir, `m` mark read, `g` ir a categoría

### 11. Un diferenciador

- PWA, accessibility-first, tema oscuro, command palette, etc.

### Extra (hecho fuera del checklist original)

- **Sidebar colapsable** con Framer Motion — cumple `patterns.md` “Collapsible sidebar”
- **Animación enter/exit en filas** — `virtualized-item-list.tsx` (solo listas &lt; 50 items)

---

## Orden recomendado (resumen)

```
2A.1  Env vars Vercel + smoke test auth          ✅
2A.2  UI edit/delete/refresh feeds               ✅
2A.3  UI categorías (rename, delete, reorder)    ✅
2A.4  Empty state usuario nuevo                  ✅
        ↓  ← 2A completa
2B.5  Bookmarks (/saved)                         ✅  ← smoke test prod
2B.6  Búsqueda                                   ✅
2B.7  OPML                                       ⬜  ← después de 2C
2B.8  Cron refresh                               ⬜
        ↓
2C    Onboarding / content discovery             ⬜  ← **siguiente (elegido)**
        ↓
2D    Polish + 1 diferenciador
```

---

## Siguiente paso sugerido

1. **Smoke test prod** — guardar desde reader y lista → `/saved` → quitar.
2. **2B.7 OPML** o **2C onboarding** (ruta mínima portfolio: saltar OPML/cron).
3. Documentar en README al validar bookmarks en prod.

---

## Cómo hacerlo con poca IA

1. **Una feature por sesión** — no mezclar bookmarks con OPML
2. **Empieza leyendo** el server action + un componente similar ya hecho
3. **Define “done” antes de codear** — 3–5 acceptance criteria por feature
4. **Prueba en incógnito** tras cada feature en producción
5. **Documenta en README** solo al cerrar cada fase, no en cada commit

---

## Archivos clave por feature

| Feature | Dónde empezar |
|---------|---------------|
| Feed CRUD UI | `feed-list-header.tsx`, `edit-feed-dialog.tsx`, `delete-feed-dialog.tsx` |
| Categorías | `edit-categories-dialog.tsx`, `rename-category-dialog.tsx`, `delete-category-dialog.tsx` |
| Búsqueda | `search/page.tsx`, `search-feeds.tsx`, `items.ts` → `searchFeedItems` |
| Bookmarks | `bookmarks.ts`, `feed-item-row.tsx`, `bookmark-button.tsx`, `saved/page.tsx` |
| OPML | `src/data/sample-feeds.opml`, `src/actions/feeds.ts` |
| Cron | `api/feeds/[id]/refresh`, `vercel.json` con cron |
| Empty state | `feed-list-empty-state.tsx`, `feed-item-list.tsx` |
| Sidebar colapsable | `app-shell-client.tsx`, `app-sidebar.tsx` |
| Animación filas | `virtualized-item-list.tsx`, `feed-item-row.tsx` |

---

## Qué NO priorizar en v2

- Reescribir el parser RSS (ya funciona)
- Cambiar de stack (Next + Supabase encaja bien)
- Implementar los 3 Design Challenges
- Los 6 diferenciadores
- Perfeccionar Lighthouse del guest antes de tener features de usuario

---

## Ruta mínima (v2 acotada)

Si quieres menos scope, esto ya es una v2 sólida para portfolio:

1. **2A completo** — ✅
2. **Bookmarks** — ✅ hecho (smoke test prod pendiente)
3. **Búsqueda** — ✅ hecho
4. **1 Design Challenge** (onboarding recomendado)

Sin cron ni OPML.

---

## Checklist de progreso

- [x] 2A.1 — Env vars Vercel + smoke test auth
- [x] 2A.2 — UI edit/delete/refresh feeds
- [x] 2A.3 — UI categorías (rename, delete, reorder)
- [x] 2A.4 — Empty state usuario nuevo con CTA Add feed
- [x] 2B.5 — Bookmarks (/saved)
- [x] 2B.6 — Búsqueda
- [ ] 2B.7 — OPML import/export
- [ ] 2B.8 — Cron refresh automático
- [ ] 2C — Design Challenge elegido
- [ ] 2D.9 — Mejoras rendimiento guest (opcional)
- [ ] 2D.10 — Atajos de teclado (opcional)
- [ ] 2D.11 — Diferenciador elegido (opcional)
- [x] Extra — Sidebar colapsable (patterns.md)
- [x] Extra — Animación filas feed (`AnimatePresence`)

---

## Progreso global

| Fase | Estado |
|------|--------|
| **2A Core** | ✅ **100 % — cerrada** |
| **2B Stretch** | **~50 %** (búsqueda ✅, bookmarks ✅; OPML/cron ⬜) |
| **2C Design Challenge** | 0 % |
| **2D Polish** | Sidebar + animación filas ✅; resto opcional |

| Item | Estado |
|------|--------|
| 2A.1 Prod | ✅ |
| 2A.2 Feeds UI | ✅ |
| 2A.3 Categorías UI | ✅ |
| 2A.4 Empty states | ✅ |
| 2B.5 Bookmarks | ✅ |
| 2B.6 Búsqueda | ✅ |
| 2B.7 OPML | ⬜ |
| 2B.8 Cron | ⬜ |
