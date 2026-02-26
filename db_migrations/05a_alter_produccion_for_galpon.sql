-- db_migrations/05_alter_produccion_for_galpon.sql

-- Eliminar la tabla produccion existente (si existe) para recrearla con el nuevo esquema
DROP TABLE IF EXISTS public.produccion;

-- SQL para crear la tabla 'produccion' con el nuevo esquema y galpon_id
CREATE TABLE public.produccion (
    galpon_id INTEGER NOT NULL, -- Cambiado de corte_id a galpon_id
    fecha DATE NOT NULL,
    numero_secuencia INTEGER NOT NULL,
    producto_codigo INTEGER NOT NULL REFERENCES public.productos(codigo),
    cantidad INTEGER NOT NULL,
    PRIMARY KEY (galpon_id, fecha, numero_secuencia), -- Nueva clave primaria
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id) -- Nueva clave foránea
);