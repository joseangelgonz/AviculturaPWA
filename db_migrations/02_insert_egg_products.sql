-- Insertar tipos de huevo en la tabla 'productos'
-- Nota: 'codigo' se genera automáticamente, y 'unidad_medida_codigo' hace referencia a 'unidades_medida.codigo'
INSERT INTO public.productos (descripcion, unidad_medida_codigo)
VALUES
    ('Huevo grande de gallina', 'UD'),
    ('Huevo extragrande de gallina', 'UD'),
    ('Huevo doble A de gallina', 'UD'),
    ('Huevo mediano de gallina', 'UD'),
    ('Huevo pequeño de gallina', 'UD'),
    ('Huevo para uso industrial', 'UD'),
    ('Huevo de gallina de cáscara blanca', 'UD');
