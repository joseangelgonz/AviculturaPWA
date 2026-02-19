-- 25_decouple_mortality_from_feeding.sql
-- Permite registrar mortalidad aunque no exista registro de alimentacion ese dia.

BEGIN;

ALTER TABLE public.registro_mortalidad
  DROP CONSTRAINT IF EXISTS registro_mortalidad_galpon_id_fecha_fkey;

-- Mantener relacion directa de mortalidad -> galpon.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registro_mortalidad_galpon_id_fkey'
      AND conrelid = 'public.registro_mortalidad'::regclass
  ) THEN
    ALTER TABLE public.registro_mortalidad
      ADD CONSTRAINT registro_mortalidad_galpon_id_fkey
      FOREIGN KEY (galpon_id)
      REFERENCES public.galpones(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

COMMIT;
