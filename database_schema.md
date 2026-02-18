# Esquema de Base de Datos — AviculturaPWA (Supabase PostgreSQL)

> Actualizado: 2026-02-18. Refleja el estado real de produccion.

## Jerarquia de datos

```
Finca → Galpon → Corte (via corte_galpones) → Produccion / Recoleccion / Alimentacion / Mortalidad
```

Un **corte** agrupa uno o mas galpones mediante la tabla intermedia `corte_galpones`.

---

## Funcion auxiliar

```sql
-- Usada por las politicas RLS en lugar de subconsultas repetidas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrador'
  );
$$;
```

---

## Tablas

### 1. fincas

| Columna    | Tipo        | Nullable | Default | Notas |
|------------|-------------|----------|---------|-------|
| id         | BIGINT      | NO       | IDENTITY | PK |
| nombre     | TEXT        | NO       |         |       |
| ubicacion  | TEXT        | SI       |         |       |
| created_at | TIMESTAMPTZ | SI       | now()   |       |

**RLS**: Habilitado. Admins: ALL. Operarios: sin acceso directo (ven galpones asignados).

---

### 2. galpones

| Columna    | Tipo        | Nullable | Default | Notas |
|------------|-------------|----------|---------|-------|
| id         | BIGINT      | NO       | IDENTITY | PK |
| finca_id   | BIGINT      | NO       |         | FK → fincas(id) |
| nombre     | TEXT        | NO       |         |       |
| capacidad  | INTEGER     | SI       |         |       |
| saldo_aves | INTEGER     | NO       | 0       |       |
| created_at | TIMESTAMPTZ | SI       | now()   |       |

**RLS**: Habilitado. Admins: ALL. Operarios: SELECT sobre galpones asignados via `operario_galpones`.

---

### 3. cortes

| Columna           | Tipo        | Nullable | Default    | Notas |
|-------------------|-------------|----------|------------|-------|
| id                | BIGINT      | NO       | IDENTITY   | PK |
| fecha_inicio      | TIMESTAMPTZ | NO       |            |       |
| fecha_final       | TIMESTAMPTZ | SI       |            |       |
| tipo_ave          | TEXT        | SI       |            | Codigo de razas_ave |
| notas             | TEXT        | SI       |            |       |
| estado            | TEXT        | NO       | 'activo'   | 'activo' o 'finalizado' |
| numero_aves_total | INTEGER     | NO       |            | CHECK > 0 |
| saldo_aves_total  | INTEGER     | NO       |            | CHECK >= 0 |
| created_at        | TIMESTAMPTZ | SI       | now()      |       |

**RLS**: Habilitado. Admins: ALL. Operarios: SELECT via join `corte_galpones` → `operario_galpones`.

---

### 4. corte_galpones

Tabla intermedia: distribucion de aves por galpon dentro de un corte.

| Columna        | Tipo        | Nullable | Default | Notas |
|----------------|-------------|----------|---------|-------|
| corte_id       | INTEGER     | NO       |         | PK, FK → cortes(id) ON DELETE CASCADE |
| galpon_id      | INTEGER     | NO       |         | PK, FK → galpones(id) |
| aves_iniciales | INTEGER     | NO       |         | CHECK > 0 |
| saldo_aves     | INTEGER     | NO       |         | CHECK >= 0 |
| created_at     | TIMESTAMPTZ | NO       | now()   |       |

**PK**: (corte_id, galpon_id) — compuesta.

**RLS**: Habilitado. Admins: ALL. Operarios: SELECT sobre galpones asignados.

---

### 5. produccion

Registro de produccion diaria por galpon, producto y secuencia.

| Columna          | Tipo    | Nullable | Default | Notas |
|------------------|---------|----------|---------|-------|
| galpon_id        | INTEGER | NO       |         | PK, FK → galpones(id) |
| fecha            | DATE    | NO       |         | PK |
| numero_secuencia | INTEGER | NO       |         | PK |
| producto_codigo  | INTEGER | NO       |         | FK → productos(codigo) |
| cantidad         | INTEGER | NO       |         |       |

**PK**: (galpon_id, fecha, numero_secuencia) — compuesta.

**RLS**: **DESHABILITADO** (tiene politicas definidas pero RLS no esta habilitado en la tabla).

---

### 6. recoleccion_huevos

| Columna          | Tipo    | Nullable | Default | Notas |
|------------------|---------|----------|---------|-------|
| galpon_id        | INTEGER | NO       |         | PK, FK → galpones(id) |
| fecha            | DATE    | NO       |         | PK |
| numero_secuencia | INTEGER | NO       |         | PK |
| cantidad_huevos  | INTEGER | NO       |         |       |

**PK**: (galpon_id, fecha, numero_secuencia) — compuesta.

**RLS**: Habilitado. Admins: ALL. Operarios: ALL sobre galpones asignados.

---

### 7. registro_alimentacion_galpon

| Columna                  | Tipo    | Nullable | Default | Notas |
|--------------------------|---------|----------|---------|-------|
| galpon_id                | INTEGER | NO       |         | PK, FK → galpones(id) |
| fecha                    | DATE    | NO       |         | PK |
| producto_alimento_codigo | INTEGER | NO       |         | FK → alimentos(codigo), FK → productos(codigo) |
| cantidad_alimento_bultos | INTEGER | NO       |         |       |

**PK**: (galpon_id, fecha) — compuesta.

**RLS**: Habilitado. Admins: ALL. Operarios: ALL sobre galpones asignados.

---

### 8. registro_mortalidad

| Columna                 | Tipo        | Nullable | Default | Notas |
|-------------------------|-------------|----------|---------|-------|
| id                      | BIGINT      | NO       | IDENTITY | PK |
| galpon_id               | BIGINT      | NO       |         | FK → galpones(id) |
| fecha                   | DATE        | NO       |         |       |
| numero_secuencia        | INTEGER     | NO       |         |       |
| causa_mortalidad_codigo | TEXT        | NO       |         | FK → causas_mortalidad(codigo) |
| cantidad_aves_muertas   | INTEGER     | NO       |         |       |
| created_at              | TIMESTAMPTZ | SI       | now()   |       |

**UNIQUE**: (galpon_id, fecha, numero_secuencia).
**FK compuesta**: (galpon_id, fecha) → registro_alimentacion_galpon(galpon_id, fecha).

**RLS**: Habilitado. Admins: ALL. Operarios: ALL sobre galpones asignados.

---

### 9. profiles

Extiende `auth.users` con rol de la aplicacion.

| Columna    | Tipo        | Nullable | Default | Notas |
|------------|-------------|----------|---------|-------|
| id         | UUID        | NO       |         | PK, FK → auth.users(id) |
| email      | TEXT        | SI       |         |       |
| role       | TEXT        | NO       |         | CHECK IN ('administrador', 'operario') |
| updated_at | TIMESTAMPTZ | SI       | now()   |       |

**RLS**: Habilitado. Usuarios ven/actualizan su propio perfil. Admins ven todos.

---

### 10. operario_galpones

Asignacion muchos-a-muchos de operarios a galpones.

| Columna     | Tipo    | Nullable | Default | Notas |
|-------------|---------|----------|---------|-------|
| operario_id | UUID    | NO       |         | PK, FK → profiles(id) |
| galpon_id   | INTEGER | NO       |         | PK, FK → galpones(id) |

**PK**: (operario_id, galpon_id) — compuesta.

**RLS**: **DESHABILITADO** (tiene politicas definidas pero RLS no esta habilitado en la tabla).

---

### 11. razas_ave

Catalogo de razas de aves de postura.

| Columna     | Tipo        | Nullable | Default | Notas |
|-------------|-------------|----------|---------|-------|
| id          | INTEGER     | NO       | SERIAL  | PK |
| codigo      | VARCHAR(50) | NO       |         | UNIQUE |
| descripcion | TEXT        | SI       |         |       |

**RLS**: Habilitado. SELECT para usuarios autenticados.

---

### 12. productos

| Columna             | Tipo    | Nullable | Default          | Notas |
|---------------------|---------|----------|------------------|-------|
| id                  | UUID    | NO       | gen_random_uuid() | PK |
| codigo              | INTEGER | NO       | IDENTITY         | UNIQUE |
| descripcion         | TEXT    | SI       |                  |       |
| unidad_medida_codigo| TEXT    | NO       |                  | FK → unidades_medida(codigo) |

**RLS**: Habilitado. Admins: ALL. Autenticados: SELECT.

---

### 13. unidades_medida

| Columna              | Tipo  | Nullable | Default          | Notas |
|----------------------|-------|----------|------------------|-------|
| id                   | UUID  | NO       | gen_random_uuid() | PK |
| codigo               | TEXT  | NO       |                  | UNIQUE |
| nombre               | TEXT  | NO       |                  |       |
| valor_en_unidad_base | REAL  | NO       |                  |       |

**RLS**: Habilitado. Admins: ALL. Autenticados: SELECT.

---

### 14. fabricantes_alimento

| Columna    | Tipo        | Nullable | Default  | Notas |
|------------|-------------|----------|----------|-------|
| id         | BIGINT      | NO       | IDENTITY | PK |
| nombre     | TEXT        | NO       |          | UNIQUE |
| created_at | TIMESTAMPTZ | NO       | now()    |       |

**RLS**: Habilitado. Admins: ALL. Autenticados: SELECT.

---

### 15. alimentos

| Columna                | Tipo        | Nullable | Default    | Notas |
|------------------------|-------------|----------|------------|-------|
| codigo                 | INTEGER     | NO       | IDENTITY   | PK |
| fabricante_alimento_id | BIGINT      | NO       |            | FK → fabricantes_alimento(id) |
| descripcion            | TEXT        | NO       |            |       |
| activo                 | BOOLEAN     | NO       | true       |       |
| categoria              | TEXT        | NO       | 'postura'  | CHECK IN (levante, prepostura, postura, pico, mantenimiento, retiro, concentrado, aditivo, materia_prima) |
| created_at             | TIMESTAMPTZ | NO       | now()      |       |

**UNIQUE**: (fabricante_alimento_id, descripcion).

**RLS**: Habilitado. Admins: ALL. Autenticados: SELECT.

---

### 16. causas_mortalidad

| Columna     | Tipo | Nullable | Default | Notas |
|-------------|------|----------|---------|-------|
| codigo      | TEXT | NO       |         | PK |
| descripcion | TEXT | NO       |         |       |

**RLS**: Habilitado. Autenticados: SELECT.

---

## Funciones RPC

### crear_corte_con_galpones

Crea un corte con su distribucion de galpones atomicamente.

```sql
CREATE OR REPLACE FUNCTION public.crear_corte_con_galpones(
  p_fecha_inicio      DATE,
  p_tipo_ave          TEXT,
  p_notas             TEXT,
  p_numero_aves_total INTEGER,
  p_galpones          JSONB  -- [{galpon_id, aves_iniciales}, ...]
) RETURNS JSONB  -- {corte_id: <id>}
```

---

## Notas de seguridad

- `produccion` y `operario_galpones` tienen **RLS deshabilitado** a pesar de tener politicas definidas. Considerar habilitarlo.
- Las politicas de admin usan la funcion `is_admin()` para evitar subconsultas repetidas.
- La RPC `crear_corte_con_galpones` usa `SECURITY DEFINER` — se ejecuta con permisos del creador.
