-- db_migrations/06_create_recoleccion_huevos_table.sql

DROP TABLE IF EXISTS public.recoleccion_huevos;

CREATE TABLE public.recoleccion_huevos (
    galpon_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    numero_secuencia INTEGER NOT NULL, -- Representa el momento del día (ej. 1ra, 2da, 3ra recolección)
    cantidad_huevos INTEGER NOT NULL,
    PRIMARY KEY (galpon_id, fecha, numero_secuencia),
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id)
);
