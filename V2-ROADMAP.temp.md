# Hoja de ruta v2 — Frontpage

> Archivo temporal de referencia. Borrar o mover a docs/ cuando ya no lo necesites.

Basado en el estado del proyecto tras v1 (Core + deploy). La v1 cubre las **12 features Core** con calidad de deploy; v2 consiste en completar lo que ya está **a medias**, luego Stretch, y por último lo que exige **decisiones de producto propias**.

**Última revisión:** 24 jun 2026 — **2C Onboarding ~95 %** + landing marketing mejorada

---

## Dónde estás ahora

| Área | Estado |
|------|--------|
| Auth, landing, guest, RSS, listas, read state, reader | ✅ Hecho |
| Performance (skeletons, lazy images, virtualización) | ✅ Hecho |
| Deploy Vercel | ✅ Hecho |
| **Editar/eliminar/refresh feeds** | ✅ UI en `feed-list-header.tsx` |
| **Gestión de categorías** | ✅ UI completa (dialogs + reorder) |
| **Búsqueda (#14)** | ✅ `/search`, highlight, nav |
| **Bookmarks / Saved (#13)** | ✅ lista, reader, `isBookmarked` en queries |
| **Onboarding (2C)** | 🟡 `/onboarding`, import por categorías, cookie skip — **falta smoke test prod** |
| **Landing marketing** | ✅ Features, How it works, footer, `section-fade`, scroll reveal |
| **Empty state usuario nuevo** | ✅ + CTA “Browse starter feeds” → onboarding |
| **Sidebar colapsable** | ✅ Framer Motion + `localStorage` |
| **Animación filas de feed** | ✅ `AnimatePresence` (listas &lt; 50 items) |
| **OPML** | Datos en `src/data/`, **sin import/export** |
| **Refresh automático** | Campos en DB, **sin cron** |
| **Prod auth** | ✅ Env vars Vercel + smoke test incógnito |

**Idea clave:** **2B cerrada en código** (bookmarks + búsqueda). **2C onboarding casi listo.** Siguiente: smoke tests prod → README → OPML o polish.

---

## Avances recientes (landing marketing)

| Archivo | Qué hace |
|---------|----------|
| `src/components/marketing/marketing-features.tsx` | 6 cards con iconos, scroll reveal |
| `src/components/marketing/marketing-how-it-works.tsx` | 3 pasos numerados |
| `src/components/marketing/marketing-cta.tsx` | CTA banner + “Try as guest” |
| `src/components/marketing/marketing-footer.tsx` | Footer multi-columna con anchors |
| `src/components/marketing/scroll-reveal.tsx` | Intersection Observer + Framer Motion |
| `src/app/styles/globals.css` | `.section-fade` / `.section-fade-bottom` (mismo patrón que hero) |
| `src/app/(marketing)/page.tsx` | Composición Hero → Features → How it works → CTA → Footer |

**Patrones:** `useScrollReveal` con IO (`once`, stagger por `delay`); transiciones entre secciones sin bordes duros (`mask-image`).

---

## Avances recientes (onboarding 2C)

| Archivo | Qué hace |
|---------|----------|
| `src/actions/onboarding.ts` | `getStarterCategories`, `importStarterFeeds` (`mapWithConcurrency` + `addFeed`), `skipOnboarding`, `shouldShowOnboarding`, cookie skip |
| `src/app/(onboarding)/onboarding/page.tsx` | Guard: si ya hay feeds → dashboard |
| `src/app/(onboarding)/layout.tsx` | Layout sin sidebar (route group) |
| `src/components/onboarding/onboarding-form.tsx` | Checkboxes por categoría, select all, loading |
| `src/app/(app)/dashboard/page.tsx` | Redirect a `/onboarding` si 0 feeds y sin cookie skip |
| `src/components/items/feed-list-empty-state.tsx` | “Browse starter feeds” + Add feed |
| `src/lib/guest/concurrency.ts` | `mapWithConcurrency` documentado (T/R + ejemplos guest/onboarding) |

**Criterios 2C (código):**

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Usuario sin feeds ve onboarding claro | ✅ redirect + página dedicada |
| 2 | Elegir categorías de starter packs | ✅ checkboxes desde `sample-feeds.json` |
| 3 | Tras import: feeds + categorías + artículos en dashboard | ✅ `importStarterFeeds` |
| 4 | Puede saltar y añadir manual | ✅ skip + `AddFeedDialog` |
| 5 | No vuelve a onboarding si tiene feeds | ✅ `feedCount > 0` + cookie skip |

**Pendiente:** smoke test prod (signup → onboarding → import → dashboard); opcional README.

---

## Avances (bookmarks + animaciones)

| Archivo | Qué hace |
|---------|----------|
| `src/actions/bookmarks.ts` | `toggleBookmarkItem`, `getBookmarkedItems` |
| `src/app/(app)/saved/page.tsx` | Lista + empty state |
| `src/components/reader/bookmark-button.tsx` | Bookmark en reader |
| `src/components/items/feed-item-row.tsx` | Bookmark en fila |
| `src/components/items/virtualized-item-list.tsx` | `motion.li` + `AnimatePresence` |

**Pendiente menor:** smoke test bookmarks en prod.

---

## Avances anteriores (búsqueda + shell)

| Archivo | Qué hace |
|---------|----------|
| `searchFeedItems`, `/search`, `search-feeds.tsx`, `highlight-text.tsx` | Búsqueda por URL |
| `app-shell-client.tsx`, `app-sidebar.tsx` | Sidebar colapsable + nav Search/Saved |

**Opcional:** atajo teclado, paginación &gt;30 resultados, tooltips sidebar colapsado.

---

## Fase 2A — Core “de verdad”

**Progreso 2A:** ✅ **100 % — cerrada**

---

## Fase 2B — Stretch features

| Item | Estado |
|------|--------|
| 2B.5 Bookmarks | ✅ Hecho en código |
| 2B.6 Búsqueda | ✅ Hecho |
| 2B.7 OPML | ⬜ |
| 2B.8 Cron refresh | ⬜ |

**Progreso 2B:** **50 %** (2/4 stretch features)

---

## Fase 2C — Design Challenge: Onboarding

**Elegido:** Onboarding / content discovery (página `/onboarding`, categorías de `sample-feeds.json`).

**Estado:** 🟡 **~95 %** — implementado; falta validar en prod.

Digest y layout customization: no empezados (no requeridos para v2 acotada).

---

## Fase 2D — Polish (opcional)

| Item | Estado |
|------|--------|
| Landing marketing (features, how it works, footer) | ✅ |
| Sidebar colapsable | ✅ |
| Animación filas | ✅ |
| Guest a11y &gt; 90 | ⬜ |
| Atajos teclado | ⬜ |
| Diferenciador (PWA, dark mode, etc.) | ⬜ |

---

## Orden recomendado (resumen)

```
2A    Core gestión + prod                         ✅
2B.5  Bookmarks                                   ✅
2B.6  Búsqueda                                    ✅
2C    Onboarding                                   🟡 ~95 %  ← smoke test prod
2B.7  OPML                                        ⬜
2B.8  Cron                                        ⬜
2D    Polish restante                              parcial (landing ✅)
```

---

## Siguiente paso sugerido

1. **Smoke test prod onboarding** — signup → `/onboarding` → import 1 categoría → dashboard con items.
2. **Smoke test bookmarks** — guardar → `/saved` → quitar (rápido).
3. **README** — documentar cierre 2B + 2C.
4. **2B.7 OPML** o más polish (a11y guest, atajos) según prioridad portfolio.

---

## Cómo hacerlo con poca IA

1. **Una feature por sesión**
2. **Define “done” antes de codear** — 3–5 criterios
3. **Prueba en incógnito** tras cada feature en prod
4. **README** al cerrar cada fase

---

## Archivos clave por feature

| Feature | Dónde empezar |
|---------|---------------|
| Onboarding | `onboarding.ts`, `onboarding-form.tsx`, `dashboard/page.tsx` |
| Bookmarks | `bookmarks.ts`, `bookmark-button.tsx`, `saved/page.tsx` |
| Búsqueda | `search/page.tsx`, `items.ts` → `searchFeedItems` |
| Landing | `(marketing)/page.tsx`, `marketing-*.tsx`, `scroll-reveal.tsx` |
| OPML | `sample-feeds.opml`, `feeds.ts` |
| Cron | `api/feeds/.../refresh`, `vercel.json` |

---

## Ruta mínima (portfolio)

1. ✅ 2A
2. ✅ Bookmarks (+ smoke test)
3. ✅ Búsqueda
4. 🟡 Onboarding (+ smoke test) ← casi
5. ✅ Landing pulida (extra)

Sin OPML/cron.

---

## Checklist de progreso

- [x] 2A.1 — Env vars Vercel + smoke test auth
- [x] 2A.2 — UI edit/delete/refresh feeds
- [x] 2A.3 — UI categorías
- [x] 2A.4 — Empty state usuario nuevo
- [x] 2B.5 — Bookmarks (/saved)
- [x] 2B.6 — Búsqueda
- [ ] 2B.7 — OPML import/export
- [ ] 2B.8 — Cron refresh automático
- [ ] 2C — Onboarding (~95 %: smoke test prod + README)
- [ ] 2D.9 — Mejoras rendimiento guest (opcional)
- [ ] 2D.10 — Atajos de teclado (opcional)
- [ ] 2D.11 — Diferenciador elegido (opcional)
- [x] Extra — Sidebar colapsable
- [x] Extra — Animación filas feed
- [x] Extra — Landing marketing (features, how it works, footer, section-fade)

---

## Progreso global

| Fase | Estado |
|------|--------|
| **2A Core** | ✅ **100 %** |
| **2B Stretch** | **50 %** (bookmarks + búsqueda ✅; OPML + cron ⬜) |
| **2C Design Challenge** | **~95 %** (onboarding en código) |
| **2D Polish** | **~30 %** (landing + sidebar + filas ✅) |

| Item | Estado |
|------|--------|
| 2A.1–2A.4 | ✅ |
| 2B.5 Bookmarks | ✅ |
| 2B.6 Búsqueda | ✅ |
| 2B.7 OPML | ⬜ |
| 2B.8 Cron | ⬜ |
| 2C Onboarding | 🟡 ~95 % |
| Landing marketing | ✅ |
