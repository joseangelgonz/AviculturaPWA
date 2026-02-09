-- Eliminar la tabla produccion existente (si existe) para recrearla con el nuevo esquema
DROP TABLE IF EXISTS public.produccion;

-- SQL para crear la tabla 'produccion' con el nuevo esquema
CREATE TABLE public.produccion (
    corte_id UUID NOT NULL,
    fecha DATE NOT NULL,
    numero_secuencia INTEGER NOT NULL,
    producto_codigo INTEGER NOT NULL REFERENCES public.productos(codigo),
    cantidad INTEGER NOT NULL, -- Actualizado a INTEGER según lo solicitado
    PRIMARY KEY (corte_id, fecha, numero_secuencia)
);
