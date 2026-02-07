-- SQL para crear la tabla 'unidades_medida'
CREATE TABLE IF NOT EXISTS public.unidades_medida (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    valor_en_unidad_base REAL NOT NULL
);

-- Insertar el primer registro: 'Unidad'
INSERT INTO public.unidades_medida (codigo, nombre, valor_en_unidad_base)
VALUES ('UD', 'Unidad', 1)
ON CONFLICT (codigo) DO NOTHING;

-- SQL para crear la tabla 'productos'
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    unidad_medida TEXT NOT NULL
);
