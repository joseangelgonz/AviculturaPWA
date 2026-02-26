-- Migración 32: Ajustar reglas ON DELETE para integridad de historial y tablas de asignación
-- Cambios:
-- - operario_galpones.operario_id  -> profiles.id  : CASCADE
-- - operario_galpones.galpon_id    -> galpones.id  : CASCADE
-- - galpones.finca_id              -> fincas.id    : RESTRICT
-- - registro_mortalidad.galpon_id  -> galpones.id  : RESTRICT

BEGIN;

ALTER TABLE public.operario_galpones
  DROP CONSTRAINT IF EXISTS operario_galpones_operario_id_fkey,
  DROP CONSTRAINT IF EXISTS operario_galpones_galpon_id_fkey;

ALTER TABLE public.galpones
  DROP CONSTRAINT IF EXISTS galpones_finca_id_fkey;

ALTER TABLE public.registro_mortalidad
  DROP CONSTRAINT IF EXISTS registro_mortalidad_galpon_id_fkey;

ALTER TABLE public.operario_galpones
  ADD CONSTRAINT operario_galpones_operario_id_fkey
    FOREIGN KEY (operario_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  ADD CONSTRAINT operario_galpones_galpon_id_fkey
    FOREIGN KEY (galpon_id)
    REFERENCES public.galpones(id)
    ON DELETE CASCADE;

ALTER TABLE public.galpones
  ADD CONSTRAINT galpones_finca_id_fkey
    FOREIGN KEY (finca_id)
    REFERENCES public.fincas(id)
    ON DELETE RESTRICT;

ALTER TABLE public.registro_mortalidad
  ADD CONSTRAINT registro_mortalidad_galpon_id_fkey
    FOREIGN KEY (galpon_id)
    REFERENCES public.galpones(id)
    ON DELETE RESTRICT;

COMMIT;
