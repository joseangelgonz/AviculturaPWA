# UI Cleanup — Alimentos PR (Nice-to-Have)

From code review of PR #9 (feat/operario-frontend).

## React Patterns

- [x] Remove `key={totalCantidadHuevos}` on Typography in `ClasificacionForm.tsx` — forces unnecessary DOM remount on every total change, just remove the `key` prop
- [x] Move `setMessage` call outside `setEntries` state updater in `ClasificacionForm.tsx` — side effect inside state updater couples unrelated state transitions
- [x] Use `.flatMap()` instead of `.map()` returning nested arrays in `AlimentacionForm.tsx` for ListSubheader rendering — semantically correct, avoids implicit array flattening

## Spanish Text Consistency

- [x] Fix inconsistent accent handling across forms — standardized to literal UTF-8 accented characters across all four form components

## Sources

- TypeScript Reviewer (findings #8, #9, #10)
- Code Simplicity Reviewer (finding #10)
