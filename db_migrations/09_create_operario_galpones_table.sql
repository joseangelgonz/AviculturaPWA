-- db_migrations/09_create_operario_galpones_table.sql

-- Eliminar políticas de RLS dependientes si existen
DROP POLICY IF EXISTS "Los operarios pueden ver sus galpones asignados" ON public.galpones;
DROP POLICY IF EXISTS "Los operarios pueden ver los cortes de sus galpones" ON public.cortes;

DROP TABLE IF EXISTS public.operario_galpones;

CREATE TABLE public.operario_galpones (
    operario_id UUID NOT NULL,
    galpon_id INTEGER NOT NULL,
    PRIMARY KEY (operario_id, galpon_id),
    FOREIGN KEY (operario_id) REFERENCES public.profiles(id), -- Asumiendo que el ID del operario está en la tabla profiles
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id)
);
