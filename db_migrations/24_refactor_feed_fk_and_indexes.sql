-- 24_refactor_feed_fk_and_indexes.sql
-- Objetivo:
-- 1) Asegurar que alimentacion referencie solo alimentos.
-- 2) Normalizar nombres legacy de constraints.
-- 3) Agregar indices faltantes para FKs criticas.

BEGIN;

-- Normalizar nombres legacy si siguen presentes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registro_diario_galpon_pkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registro_alimentacion_galpon_pkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) THEN
    ALTER TABLE public.registro_alimentacion_galpon
      RENAME CONSTRAINT registro_diario_galpon_pkey TO registro_alimentacion_galpon_pkey;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registro_diario_galpon_galpon_id_fkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registro_alimentacion_galpon_galpon_id_fkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) THEN
    ALTER TABLE public.registro_alimentacion_galpon
      RENAME CONSTRAINT registro_diario_galpon_galpon_id_fkey TO registro_alimentacion_galpon_galpon_id_fkey;
  END IF;
END
$$;

-- Eliminar FK duplicada/contradictoria hacia productos.
ALTER TABLE public.registro_alimentacion_galpon
  DROP CONSTRAINT IF EXISTS registro_diario_galpon_producto_alimento_codigo_fkey;

-- Garantizar FK canónica hacia alimentos.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registro_alimentacion_galpon_producto_alimento_codigo_fkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) THEN
    ALTER TABLE public.registro_alimentacion_galpon
      ADD CONSTRAINT registro_alimentacion_galpon_producto_alimento_codigo_fkey
      FOREIGN KEY (producto_alimento_codigo)
      REFERENCES public.alimentos(codigo)
      ON DELETE RESTRICT;
  END IF;
END
$$;

-- Indices de soporte para FKs y filtros frecuentes.
CREATE INDEX IF NOT EXISTS idx_corte_galpones_galpon_id
  ON public.corte_galpones (galpon_id);

CREATE INDEX IF NOT EXISTS idx_galpones_finca_id
  ON public.galpones (finca_id);

CREATE INDEX IF NOT EXISTS idx_operario_galpones_galpon_id
  ON public.operario_galpones (galpon_id);

CREATE INDEX IF NOT EXISTS idx_produccion_producto_codigo
  ON public.produccion (producto_codigo);

CREATE INDEX IF NOT EXISTS idx_productos_unidad_medida_codigo
  ON public.productos (unidad_medida_codigo);

CREATE INDEX IF NOT EXISTS idx_registro_alimentacion_producto_alimento_codigo
  ON public.registro_alimentacion_galpon (producto_alimento_codigo);

CREATE INDEX IF NOT EXISTS idx_registro_mortalidad_causa
  ON public.registro_mortalidad (causa_mortalidad_codigo);

CREATE INDEX IF NOT EXISTS idx_registro_mortalidad_fecha_galpon
  ON public.registro_mortalidad (fecha, galpon_id);

COMMIT;
