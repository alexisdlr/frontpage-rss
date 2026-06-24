# Hoja de ruta v2 — Frontpage

> Archivo temporal de referencia. Borrar o mover a docs/ cuando ya no lo necesites.

Basado en el estado del proyecto tras v1 (Core + deploy). La v1 cubre las **12 features Core** con calidad de deploy; v2 consiste en completar lo que ya está **a medias**, luego Stretch, y por último lo que exige **decisiones de producto propias**.

**Última revisión:** 23 jun 2026

---

## Dónde estás ahora

| Área | Estado |
|------|--------|
| Auth, landing, guest, RSS, listas, read state, reader | ✅ Hecho |
| Performance (skeletons, lazy images, virtualización) | ✅ Hecho |
| Deploy Vercel | ✅ Hecho |
| **Editar/eliminar feeds** | ✅ UI en `feed-list-header.tsx` → `edit-feed-dialog.tsx`, `delete-feed-dialog.tsx` (solo en vista `/feed/[id]`) |
| **Refresh manual por feed** | Server action `refreshFeed` en `feeds.ts`, **sin UI** |
| **Gestión de categorías** | ✅ UI completa: `edit-categories-dialog.tsx` (reorder drag-and-drop), `rename-category-dialog.tsx`, `delete-category-dialog.tsx`, `add-category-dialog.tsx` |
| **Búsqueda** | Input en `header-nav.tsx`, **sin backend** |
| **Bookmarks / Saved** | Tabla `bookmarks` en migración, link a `/saved`, **ruta placeholder** (`<div>SavedPage</div>`) |
| **OPML** | Datos de ejemplo en `src/data/`, **sin import/export** |
| **Refresh automático** | Campos `refresh_interval` en DB, **sin cron** |
| **Empty state usuario nuevo** | Mensaje genérico en `feed-item-list.tsx` (“No items yet”), **sin CTA dedicado** en dashboard |
| **Design Challenges** (onboarding, digest, layouts) | ❌ No empezados |
| **Prod auth** | Faltan env vars de Supabase en Vercel (confirmar en tu proyecto) |

**Idea clave:** mucho de v2 no es empezar de cero — es **conectar UI a lógica que ya existe**. En categorías ya está hecho; en feeds falta sobre todo **refresh manual**.

---

## Avances recientes (categorías)

Archivos nuevos / conectados en esta fase:

| Archivo | Qué hace |
|---------|----------|
| `edit-categories-dialog.tsx` | Lista sortable (`@dnd-kit/react`), abre rename/delete |
| `rename-category-dialog.tsx` | Renombrar → `renameCategory` |
| `delete-category-dialog.tsx` | Eliminar → `deleteCategory` + reasignar feeds o uncategorized |
| `(app)/layout.tsx` | Calcula `feedCountByCategory` y lo pasa al header |
| `header-nav.tsx` | Menú “Edit categories” abre el dialog |

**Patrón usado:** modales controlados hermanos (no anidados), estado local optimista + `router.refresh()`, drag solo en el grip (`handle` de dnd-kit).

---

## Fase 2A — Cerrar el Core “de verdad” (1–2 semanas)

**Objetivo:** que un usuario autenticado pueda gestionar sus feeds sin tocar la base de datos.

### 1. Configurar producción

- Añadir en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Probar en incógnito: signup → dashboard → add feed → read/unread
- **Criterio de done:** flujo completo sin errores 500
- **Estado:** ⬜ Pendiente de confirmar en tu deploy

### 2. UI de gestión de feeds

- **Leer primero:** `src/actions/feeds.ts`, `add-feed-dialog.tsx`, `feed-list-header.tsx`
- Añadir: editar título/categoría, eliminar con confirmación, refresh manual por feed
- Las actions `updateFeed`, `deleteFeed`, `refreshFeed` ya existen
- **Hecho:** editar y eliminar desde Actions en vista de feed individual
- **Falta:** botón “Refresh feed” que llame a `refreshFeed`
- **Criterio de done:** CRUD completo desde la UI, sin llamar actions desde consola
- **Estado:** 🟡 Parcial (~66 %)

### 3. UI de gestión de categorías

- **Leer primero:** `src/actions/categories.ts`, `add-category-dialog.tsx`
- Añadir: renombrar, eliminar (con reasignación de feeds), reordenar
- `reorderCategories` conectado vía drag-and-drop en `edit-categories-dialog.tsx`
- **Criterio de done:** sidebar refleja orden y cambios tras `revalidatePath`
- **Estado:** ✅ Hecho

### 4. Empty states para usuario nuevo

- Dashboard sin feeds → CTA claro para añadir el primero
- Preparación para Design Challenge #1, pero aquí basta un estado útil
- Hoy: `feed-item-list.tsx` muestra “No items yet” + texto, sin botón Add feed
- **Criterio de done:** usuario recién registrado no ve pantalla vacía sin guía
- **Estado:** 🟡 Parcial

**IA mínima:** lee los server actions y copia patrones del `add-feed-dialog`. Usa IA solo para detalles de UI si te atascas.

---

## Fase 2B — Stretch features (2–3 semanas)

Orden sugerido por dependencias y valor:

### 5. Bookmarks / Saved (#13)

- **DB:** tabla `bookmarks` ya existe en la migración
- Crear: `src/actions/bookmarks.ts`, ruta `src/app/(app)/saved/page.tsx`
- Botón bookmark en `feed-item-row.tsx` y `reader-article.tsx`
- Hoy: `saved/page.tsx` es placeholder
- **Criterio de done:** guardar, listar, quitar bookmark; sidebar “Saved” funcional
- **Estado:** ⬜ No empezado

### 6. Búsqueda (#14)

- **Leer primero:** input en `header-nav.tsx`, `src/actions/items.ts`
- Opción simple: `ilike` en título/descripción (suficiente al inicio)
- Opción avanzada: columna `tsvector` + índice GIN en Supabase
- **Criterio de done:** búsqueda < 500 ms con 100+ items; resultados navegables
- **Estado:** ⬜ Solo UI del input

### 7. OPML import/export (#15)

- **Datos de prueba:** `src/data/sample-feeds.opml` y `sample-feeds.json`
- Parser OPML (librería o XML manual)
- UI: importar archivo → crear feeds/categorías; exportar suscripción actual
- **Criterio de done:** importar el OPML de ejemplo sin errores; export reimportable
- **Estado:** ⬜ No empezado

### 8. Refresh automático (#16)

- **Leer primero:** `src/app/api/feeds/[id]/refresh/route.ts`, `src/lib/rss/feedHealth.ts`
- Vercel Cron → route handler que refresca feeds por usuario o globalmente
- Respetar `profiles.refresh_interval` y backoff en feeds con error
- **Criterio de done:** items nuevos aparecen sin refresh manual del usuario
- **Estado:** ⬜ No empezado

---

## Fase 2C — Un Design Challenge (1–2 semanas)

El spec pide **elegir 1 de 3** para un portfolio completo. Hazlo **después** de 2A/2B.

| Challenge | Qué implica | Complejidad |
|-----------|-------------|-------------|
| **Onboarding / content discovery** | Flujo primer uso, feeds sugeridos, empty states ricos | Media — encaja con usuario nuevo |
| **Digest / “what did I miss?”** | Vista resumen por tiempo/categoría | Media-alta — nueva ruta + lógica de agrupación |
| **Layout customization** | `profiles.layout` ya en DB; grid vs lista vs compacto | Alta — mucho CSS y estado |

**Recomendación si quieres poco scope:** onboarding. Ya tienes guest con 19 feeds como referencia de “contenido precargado”. Encaja bien con cerrar 2A.4 (empty states).

**Criterio de done:** documentar en README la decisión de producto (problema, enfoque, trade-offs).

**Estado:** ⬜ No empezado

---

## Fase 2D — Polish y diferenciador (opcional)

### 9. Mejoras de rendimiento guest

- Accessibility 79 en `/guest` por SSR lento al agregar 19 feeds
- Opciones: cache más agresivo, ISR, o precarga en build
- **Criterio de done:** guest accessibility > 90 sin perder contenido real

### 10. Atajos de teclado (#17–18)

- `j/k` navegar, `o` abrir, `m` mark read, `g` ir a categoría
- **Criterio de done:** usable sin ratón en la lista

### 11. Un diferenciador

Elegir **uno** de `spec/differentiators.md`:

- PWA / offline
- Accessibility-first (skip links, live regions, shortcuts)
- Tema oscuro usando `user_preferences.theme`
- Command palette para búsqueda + navegación

---

## Orden recomendado (resumen)

```
2A.1  Env vars Vercel + smoke test auth          ⬜
2A.2  UI edit/delete/refresh feeds             🟡 falta refresh
2A.3  UI categorías (rename, delete, reorder)   ✅
2A.4  Empty state usuario nuevo                🟡
        ↓
2B.5  Bookmarks (/saved)                       ⬜
2B.6  Búsqueda                                 ⬜
2B.7  OPML                                     ⬜
2B.8  Cron refresh                             ⬜
        ↓
2C    1 Design Challenge (onboarding recomendado)
        ↓
2D    Polish + 1 diferenciador
```

---

## Siguiente paso sugerido

Cierra **2A.2** con lo mínimo:

1. Añadir “Refresh feed” en el menú Actions de `feed-list-header.tsx` (mismo sitio que Edit/Delete).
2. Llamar `refreshFeed(feed.id)` + loading + `router.refresh()`.

Luego **2A.4**: empty state en dashboard con botón que abra `AddFeedDialog` (ya existe en el header).

---

## Cómo hacerlo con poca IA

1. **Una feature por sesión** — no mezclar bookmarks con OPML
2. **Empieza leyendo** el server action + un componente similar ya hecho
3. **Define “done” antes de codear** — 3–5 acceptance criteria por feature
4. **Prueba en incógnito** tras cada feature en producción
5. **Documenta en README** solo al cerrar cada fase, no en cada commit
6. **Usa la IA solo para:** errores de tipos, edge cases de RSS, o revisión final — no para arquitectura

---

## Archivos clave por feature

| Feature | Dónde empezar |
|---------|---------------|
| Feed CRUD UI | `feed-list-header.tsx`, `edit-feed-dialog.tsx`, `delete-feed-dialog.tsx` |
| Feed refresh UI | `src/actions/feeds.ts` → `refreshFeed`, copiar patrón de delete dialog |
| Categorías | `edit-categories-dialog.tsx`, `rename-category-dialog.tsx`, `delete-category-dialog.tsx` |
| Bookmarks | migración `bookmarks`, `feed-item-row.tsx`, `saved/page.tsx` |
| Búsqueda | `header-nav.tsx`, `src/actions/items.ts` |
| OPML | `src/data/sample-feeds.opml`, `src/actions/feeds.ts` |
| Cron | `api/feeds/[id]/refresh`, `vercel.json` con cron |
| Layouts | `profiles.layout`, `feed-browse-view.tsx` |
| Empty state | `dashboard/page.tsx` o `feed-item-list.tsx` |

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

1. **2A completo** (prod auth + CRUD feeds/categorías + empty states) — **~75 % hecho**
2. **Bookmarks**
3. **Búsqueda**
4. **1 Design Challenge** (onboarding recomendado)

Sin cron ni OPML.

---

## Checklist de progreso

- [ ] 2A.1 — Env vars Vercel + smoke test auth
- [x] 2A.2 — UI edit/delete feeds *(falta refresh manual)*
- [x] 2A.3 — UI categorías (rename, delete, reorder)
- [ ] 2A.4 — Empty state usuario nuevo *(mensaje básico, sin CTA)*
- [ ] 2B.5 — Bookmarks (/saved)
- [ ] 2B.6 — Búsqueda
- [ ] 2B.7 — OPML import/export
- [ ] 2B.8 — Cron refresh automático
- [ ] 2C — Design Challenge elegido
- [ ] 2D.9 — Mejoras rendimiento guest (opcional)
- [ ] 2D.10 — Atajos de teclado (opcional)
- [ ] 2D.11 — Diferenciador elegido (opcional)

---

## Progreso global 2A

| Item | Estado |
|------|--------|
| 2A.1 Prod | ⬜ |
| 2A.2 Feeds UI | 🟡 |
| 2A.3 Categorías UI | ✅ |
| 2A.4 Empty states | 🟡 |
| **Fase 2A** | **~75 %** |
