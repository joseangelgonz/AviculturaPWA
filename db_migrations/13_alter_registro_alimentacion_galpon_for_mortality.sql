-- db_migrations/13_alter_registro_alimentacion_galpon_for_mortality.sql

-- Eliminar la columna 'causa_mortalidad_codigo' y su restricción de clave externa asociada
-- CASCADE asegura que la FK se elimine junto con la columna.
ALTER TABLE public.registro_alimentacion_galpon
DROP COLUMN IF EXISTS causa_mortalidad_codigo CASCADE;

-- Eliminar la columna 'numero_aves_muertas'
ALTER TABLE public.registro_alimentacion_galpon
DROP COLUMN IF EXISTS numero_aves_muertas;