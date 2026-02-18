# UI Cleanup — Alimentos PR (Nice-to-Have)

From code review of PR #9 (feat/operario-frontend).

## React Patterns

- [ ] Remove `key={totalCantidadHuevos}` on Typography in `ClasificacionForm.tsx:339` — forces unnecessary DOM remount on every total change, just remove the `key` prop
- [ ] Move `setMessage` call outside `setEntries` state updater in `ClasificacionForm.tsx:138-154` — side effect inside state updater couples unrelated state transitions
- [ ] Use `.flatMap()` instead of `.map()` returning nested arrays in `AlimentacionForm.tsx:141-150` for ListSubheader rendering — semantically correct, avoids implicit array flattening

## Spanish Text Consistency

- [ ] Fix inconsistent accent handling across forms — some strings use `\u00f3` escapes for accents while others strip accents entirely. Pick one approach and apply consistently across all four form components

## Sources

- TypeScript Reviewer (findings #8, #9, #10)
- Code Simplicity Reviewer (finding #10)
