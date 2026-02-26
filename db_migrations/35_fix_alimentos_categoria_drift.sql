-- Migracion 35: Documentar drift en alimentos.categoria
--
-- La migracion 17 creo categoria como TEXT nullable sin default.
-- En algun momento se aplico manualmente:
--   ALTER TABLE alimentos ALTER COLUMN categoria SET NOT NULL;
--   ALTER TABLE alimentos ALTER COLUMN categoria SET DEFAULT 'postura';
--
-- Este archivo registra el cambio para que las migraciones reflejen
-- el estado real de la base de datos. Idempotente.

ALTER TABLE public.alimentos
  ALTER COLUMN categoria SET DEFAULT 'postura';

ALTER TABLE public.alimentos
  ALTER COLUMN categoria SET NOT NULL;
