# Service Layer Gaps — Alimentos PR (Nice-to-Have)

From code review of PR #9 (feat/operario-frontend).

## Missing CRUD for Catalog Tables

- [ ] Add `createAlimento()`, `updateAlimento()` methods to `AlimentoService` — RLS admin policies exist in the DB but no service code exercises them
- [ ] Add `getAllFabricantes()`, `createFabricante()` methods to `AlimentoService` — needed for future admin UI or agent access
- [ ] Add `getAllAlimentosIncludingInactive()` method — admin agents need to see/reactivate inactive alimentos

## Missing Read/Query Methods

- [ ] Add `getRegistroDiario(galpon_id, fecha)` to `RegistroDiarioGalponService` — no way to read historical feeding/mortality records
- [ ] Add `getClasificacionesPorFecha(galpon_id, fecha)` to `ProduccionService` — no way to query historical clasificacion entries
- [ ] Add `getRecoleccionesPorFecha(galpon_id, fecha)` to `RecoleccionService` — no way to query historical egg collection data

## Error Message Sanitization

- [ ] Map Supabase error codes to user-friendly messages instead of exposing raw PostgreSQL errors (e.g., `23505` unique violation → "Ya existe un registro para esta fecha")
- [ ] Reduce `console.error` output in production — full Supabase error objects reveal table/column names in DevTools

## DashboardService Stale References

- [ ] Audit `DashboardService.ts` placeholder codes `MORTALIDAD_PRODUCT_CODE = 999` and `ALIMENTO_PRODUCT_CODE = 998` — may be incorrect after decoupling feed from `productos` table

## Sources

- Agent-Native Reviewer (findings #1, #6, #7)
- Security Sentinel (findings #9, #10)
- Data Migration Expert (issue #9)
