# Test Plan — PR #5: Operario Dashboard

## Prerequisites

- [x] Run migrations 05–10 against a test Supabase instance
- [x] Seed test data: at least 1 finca, 2 galpones, several productos, several causas_mortalidad
- [x] Create two users: one with `role = 'administrador'`, one with `role = 'operario'` in `profiles`
- [x] Assign at least 1 galpon to the operario via `operario_galpones`

---

## 1. Profile Creation on Signup

| # | Step | Expected |
|---|------|----------|
| 1.1 | Register a new user via `/signup` | Row created in `profiles` with `role = 'operario'` and matching email |
| 1.2 | Log in with the new user | Sees operario dashboard, no errors |
| 1.3 | Check `profiles` table in Supabase | Row exists with correct `id`, `email`, `role = 'operario'` |

---

## 2. Role-Based Routing

| # | Step | Expected |
|---|------|----------|
| 2.1 | Log in as **administrador** | Redirected to `/`, sees admin `DashboardScreen` with charts |
| 2.2 | Check sidebar as admin | Shows: Panel, Producción, Galpones, Cortes, Fincas, Reportes, Alertas. No operario items visible. |
| 2.3 | Navigate to `/operario/recoleccion` directly as admin | Redirected to `/` by `RoleGuard` |
| 2.4 | Log out, log in as **operario** | Redirected to `/`, sees `OperarioDashboardScreen` |
| 2.5 | Check sidebar as operario | Shows: Panel, Recolección, Alimentación, Mortalidad, Clasificación. No admin items (Fincas, Reportes, Alertas). |
| 2.6 | Navigate to `/fincas` directly as operario | Redirected to `/` by `RoleGuard` |

---

## 3. Galpon Selection Context

| # | Step | Expected |
|---|------|----------|
| 3.1 | Log in as operario with **1 assigned galpon** | Galpon auto-selected, name shown in form headers |
| 3.2 | Log in as operario with **multiple galpones** | First galpon auto-selected |
| 3.3 | Log in as operario with **0 assigned galpones** | Forms show "Selecciona un galpón" info alert |

---

## 4. Recolección Form (`/operario/recoleccion`)

| # | Step | Expected |
|---|------|----------|
| 4.1 | Select "1ra Recolección", enter quantity 150, submit | Success message, fields reset, row inserted in `recoleccion_huevos` |
| 4.2 | Submit same galpón + date + sequence again | Error (PK violation: galpon_id, fecha, numero_secuencia) |
| 4.3 | Submit with empty fields | Validation error: "completa todos los campos" |
| 4.4 | Submit with quantity 0 | Should succeed (0 is a valid count) |

---

## 5. Alimentación Form (`/operario/alimentacion`)

| # | Step | Expected |
|---|------|----------|
| 5.1 | Select a product, enter bultos = 5, submit | Success message, row upserted in `registro_diario_galpon` |
| 5.2 | Submit again same day, different product/quantity | Existing record updated (upsert), not duplicated |
| 5.3 | Verify productos dropdown loads | All products from `productos` table shown |
| 5.4 | Submit with empty fields | Validation error |

---

## 6. Mortalidad Form (`/operario/mortalidad`)

| # | Step | Expected |
|---|------|----------|
| 6.1 | Select a causa, enter count = 3, submit | Success message, `registro_diario_galpon` updated with mortality data |
| 6.2 | Verify causas dropdown loads | All rows from `causas_mortalidad` shown |
| 6.3 | Submit with empty fields | Validation error |
| 6.4 | Submit after alimentación same day | Same row updated (upsert merges both fields) |

---

## 7. Clasificación Form (`/operario/clasificacion`)

| # | Step | Expected |
|---|------|----------|
| 7.1 | Add 1 row: select product, quantity = 100, submit | Success, 1 row inserted in `produccion` with `numero_secuencia = 1` |
| 7.2 | Add 3 rows with different products, submit | 3 rows inserted with sequential `numero_secuencia` |
| 7.3 | Verify total count updates live | "Total de Huevos" reflects sum of all row quantities |
| 7.4 | Click "Añadir Línea" | New empty row appears |
| 7.5 | Delete a row (trash icon) | Row removed, at least 1 row always remains |
| 7.6 | Submit with all rows empty | Validation error: "al menos una entrada válida" |

---

## 8. Edge Cases

| # | Step | Expected |
|---|------|----------|
| 8.1 | Lose network mid-submit on any form | Error message shown, form data preserved |
| 8.2 | Open forms without being authenticated | Redirected to `/login` |
| 8.3 | Refresh page while on `/operario/recoleccion` | Page reloads correctly, galpón context re-initialized |
| 8.4 | Alimentación + Mortalidad same day: check DB | Single row in `registro_diario_galpon` with both feeding and mortality fields populated |

---

## 9. Migration Safety (Manual DB Check)

| # | Check | Risk |
|---|-------|------|
| 9.1 | Migration 05 uses `DROP TABLE produccion` | **Destroys existing data** — verify no production data exists, or change to `ALTER TABLE` |
| 9.2 | Migration 09 uses `DROP TABLE operario_galpones` | Table already exists in schema — will drop and recreate, losing existing assignments |
| 9.3 | Migration 09 drops RLS policies on `galpones` and `cortes` | Verify policies are re-created or no longer needed |
| 9.4 | `registro_diario_galpon.producto_alimento_codigo` is `NOT NULL` | Submitting only mortality (without alimentación) will fail at DB level |
| 9.5 | Migration 10 trigger uses `SECURITY DEFINER` | Correct — needed to bypass RLS when inserting into `profiles` from a trigger |
