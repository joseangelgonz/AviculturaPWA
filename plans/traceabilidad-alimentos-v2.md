# Traceabilidad - Catalogo de Alimentos V2

Fecha: 2026-02-13
Rama: `feat/operario-frontend`

## Objetivo
Separar alimentacion de `productos`, introducir catalogo propio de alimentos por fabricante y dejar trazabilidad de ejecucion en BD + frontend.

## Cambios de base de datos
1. Migracion nueva: `db_migrations/17_create_alimentos_catalog.sql`
2. Crea tablas:
   - `public.fabricantes_alimento`
   - `public.alimentos`
3. Agrega soporte de categoria en `alimentos`:
   - columna `categoria`
   - `CHECK` de categorias validas
4. Agrega RLS y politicas:
   - lectura para usuarios autenticados
   - gestion solo admin
5. Backfill legado:
   - inserta fabricante `LEGADO`
   - migra codigos historicos desde `registro_diario_galpon` y/o `registro_alimentacion_galpon`
6. Reapunta FK de `producto_alimento_codigo` hacia `public.alimentos(codigo)`.
7. Sincroniza la secuencia de `alimentos.codigo` para evitar error `duplicate key`.

## Cambios de frontend
1. Nuevo modelo: `src/models/Alimento.ts`
2. Nuevo servicio: `src/services/AlimentoService.ts`
3. Formulario actualizado: `src/components/AlimentacionForm.tsx`
   - deja de consultar `productos`
   - consulta `alimentos` + `fabricantes_alimento`
   - muestra opciones agrupadas por fabricante
4. Tipos Supabase actualizados: `src/types/database.ts`
   - agrega `fabricantes_alimento` y `alimentos`
   - FK de `registro_diario_galpon.producto_alimento_codigo` referencia `alimentos`

## Seed recomendado (V2)
Ejecutar despues de la migracion 17:
1. Insert de fabricantes: Solla, Contegral, Italcol, Purina, Finca Propia.
2. Insert de alimentos por fabricante con categorias:
   - `levante`, `prepostura`, `postura`, `pico`, `mantenimiento`, `retiro`, `concentrado`, `aditivo`, `materia_prima`.

## Orden de ejecucion recomendado
1. Ejecutar `db_migrations/17_create_alimentos_catalog.sql`.
2. Ejecutar seed V2 de fabricantes/alimentos.
3. Validar consulta:
   - fabricante + alimento + categoria + activo.
4. Probar formulario de alimentacion en la app.

## Nota operativa
Si en algun momento aparece `duplicate key value violates unique constraint "alimentos_pkey"`, re-ejecutar solo el bloque de sincronizacion de sequence incluido en la migracion 17.
