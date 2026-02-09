-- db_migrations/07_create_causas_mortalidad_table.sql

CREATE TABLE public.causas_mortalidad (
    codigo TEXT PRIMARY KEY,
    descripcion TEXT NOT NULL
);
