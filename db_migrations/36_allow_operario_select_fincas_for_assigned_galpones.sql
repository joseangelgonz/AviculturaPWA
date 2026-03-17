-- Migracion 36: Permitir a operarios leer fincas relacionadas a sus galpones asignados

BEGIN;

-- Asegurar RLS activo (ya deberia estarlo)
ALTER TABLE public.fincas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Operarios pueden ver fincas de sus galpones" ON public.fincas;

CREATE POLICY "Operarios pueden ver fincas de sus galpones" ON public.fincas
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.galpones g
    JOIN public.operario_galpones og ON og.galpon_id = g.id
    WHERE g.finca_id = fincas.id
      AND og.operario_id = auth.uid()
  )
);

COMMIT;
