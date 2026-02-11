-- db_migrations/15_alter_produccion_table_remove_muertes.sql

-- Eliminar la columna 'muertes' de la tabla 'produccion'
ALTER TABLE public.produccion
DROP COLUMN IF EXISTS muertes;
