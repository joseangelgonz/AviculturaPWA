-- db_migrations/12_alter_registro_diario_galpon_for_mortality.sql

-- Eliminar la restricción de clave externa antes de eliminar la columna
ALTER TABLE public.registro_diario_galpon
DROP CONSTRAINT IF EXISTS registro_diario_galpon_causa_mortalidad_codigo_fkey;

-- Eliminar las columnas existentes de mortalidad
ALTER TABLE public.registro_diario_galpon
DROP COLUMN IF EXISTS numero_aves_muertas,
DROP COLUMN IF EXISTS causa_mortalidad_codigo;
