-- db_migrations/08_create_registro_diario_galpon_table.sql

CREATE TABLE public.registro_diario_galpon (
    galpon_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    producto_alimento_codigo INTEGER NOT NULL, -- Referencia a public.productos(codigo) que es INTEGER
    cantidad_alimento_bultos INTEGER NOT NULL,
    numero_aves_muertas INTEGER NOT NULL DEFAULT 0, -- Se inicializa en 0 si no hay muertes
    causa_mortalidad_codigo TEXT, -- Puede ser NULL si no hay muertes o la causa es desconocida
    PRIMARY KEY (galpon_id, fecha),
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id),
    FOREIGN KEY (producto_alimento_codigo) REFERENCES public.productos(codigo),
    FOREIGN KEY (causa_mortalidad_codigo) REFERENCES public.causas_mortalidad(codigo)
);
