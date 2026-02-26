-- db_migrations/12_rename_registro_diario_galpon.sql

-- Renombrar la tabla registro_diario_galpon a registro_alimentacion_galpon
ALTER TABLE public.registro_diario_galpon
RENAME TO registro_alimentacion_galpon;
