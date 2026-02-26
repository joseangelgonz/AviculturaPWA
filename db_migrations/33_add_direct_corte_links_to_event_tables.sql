-- Migración 33: Enlace directo opcional de eventos -> corte para analítica
-- Tablas: produccion, registro_alimentacion_galpon, registro_mortalidad
--
-- Objetivo:
-- - mantener analítica por galpón (galpon_id)
-- - habilitar analítica directa por corte (corte_id)
-- - auto-resolver corte_id por (galpon_id, fecha) cuando sea posible
-- - validar consistencia contra corte_galpones + ventana de fechas del corte

BEGIN;

ALTER TABLE public.produccion
  ADD COLUMN IF NOT EXISTS corte_id bigint;

ALTER TABLE public.registro_alimentacion_galpon
  ADD COLUMN IF NOT EXISTS corte_id bigint;

ALTER TABLE public.registro_mortalidad
  ADD COLUMN IF NOT EXISTS corte_id bigint;

COMMENT ON COLUMN public.produccion.corte_id IS 'Enlace directo opcional al corte para analítica; se deriva por galpón + fecha.';
COMMENT ON COLUMN public.registro_alimentacion_galpon.corte_id IS 'Enlace directo opcional al corte para analítica; se deriva por galpón + fecha.';
COMMENT ON COLUMN public.registro_mortalidad.corte_id IS 'Enlace directo opcional al corte para analítica; se deriva por galpón + fecha.';

CREATE OR REPLACE FUNCTION public.resolve_corte_for_galpon_date(
  p_galpon_id bigint,
  p_fecha date
)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_corte_id bigint;
  v_matches integer;
BEGIN
  SELECT COUNT(*), MAX(x.corte_id)
  INTO v_matches, v_corte_id
  FROM (
    SELECT cg.corte_id
    FROM public.corte_galpones cg
    JOIN public.cortes c ON c.id = cg.corte_id
    WHERE cg.galpon_id = p_galpon_id
      AND c.fecha_inicio::date <= p_fecha
      AND (c.fecha_final IS NULL OR c.fecha_final::date >= p_fecha)
  ) x;

  IF v_matches > 1 THEN
    RAISE EXCEPTION 'Ambigüedad de corte para galpón % en fecha %: % cortes coinciden.', p_galpon_id, p_fecha, v_matches;
  END IF;

  RETURN CASE WHEN v_matches = 1 THEN v_corte_id ELSE NULL END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.attach_and_validate_event_corte_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_resolved_corte_id bigint;
BEGIN
  IF NEW.galpon_id IS NULL OR NEW.fecha IS NULL THEN
    RETURN NEW;
  END IF;

  v_resolved_corte_id := public.resolve_corte_for_galpon_date(NEW.galpon_id, NEW.fecha);

  IF NEW.corte_id IS NULL THEN
    NEW.corte_id := v_resolved_corte_id;
    RETURN NEW;
  END IF;

  -- Si existe resolución automática, el corte enviado debe coincidir.
  IF v_resolved_corte_id IS NOT NULL AND NEW.corte_id <> v_resolved_corte_id THEN
    RAISE EXCEPTION
      'El corte % no coincide con el corte esperado % para galpón % en fecha %.',
      NEW.corte_id, v_resolved_corte_id, NEW.galpon_id, NEW.fecha;
  END IF;

  -- Validar integridad explícita: relación galpón<->corte y ventana de fechas.
  PERFORM 1
  FROM public.corte_galpones cg
  JOIN public.cortes c ON c.id = cg.corte_id
  WHERE cg.corte_id = NEW.corte_id
    AND cg.galpon_id = NEW.galpon_id
    AND c.fecha_inicio::date <= NEW.fecha
    AND (c.fecha_final IS NULL OR c.fecha_final::date >= NEW.fecha);

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'El corte % no aplica al galpón % en la fecha %.',
      NEW.corte_id, NEW.galpon_id, NEW.fecha;
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill histórico usando la misma regla galpón + fecha.
UPDATE public.produccion p
SET corte_id = public.resolve_corte_for_galpon_date(p.galpon_id, p.fecha)
WHERE p.corte_id IS NULL;

UPDATE public.registro_alimentacion_galpon rag
SET corte_id = public.resolve_corte_for_galpon_date(rag.galpon_id, rag.fecha)
WHERE rag.corte_id IS NULL;

UPDATE public.registro_mortalidad rm
SET corte_id = public.resolve_corte_for_galpon_date(rm.galpon_id, rm.fecha)
WHERE rm.corte_id IS NULL;

-- FKs directos a cortes (lectura/analítica)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'produccion_corte_id_fkey'
      AND conrelid = 'public.produccion'::regclass
  ) THEN
    ALTER TABLE public.produccion
      ADD CONSTRAINT produccion_corte_id_fkey
      FOREIGN KEY (corte_id)
      REFERENCES public.cortes(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reg_alim_galpon_corte_id_fkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) THEN
    ALTER TABLE public.registro_alimentacion_galpon
      ADD CONSTRAINT reg_alim_galpon_corte_id_fkey
      FOREIGN KEY (corte_id)
      REFERENCES public.cortes(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'registro_mortalidad_corte_id_fkey'
      AND conrelid = 'public.registro_mortalidad'::regclass
  ) THEN
    ALTER TABLE public.registro_mortalidad
      ADD CONSTRAINT registro_mortalidad_corte_id_fkey
      FOREIGN KEY (corte_id)
      REFERENCES public.cortes(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- FKs compuestos para asegurar asignación corte-galpón válida.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'produccion_corte_galpon_fkey'
      AND conrelid = 'public.produccion'::regclass
  ) THEN
    ALTER TABLE public.produccion
      ADD CONSTRAINT produccion_corte_galpon_fkey
      FOREIGN KEY (corte_id, galpon_id)
      REFERENCES public.corte_galpones(corte_id, galpon_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reg_alim_corte_galpon_fkey'
      AND conrelid = 'public.registro_alimentacion_galpon'::regclass
  ) THEN
    ALTER TABLE public.registro_alimentacion_galpon
      ADD CONSTRAINT reg_alim_corte_galpon_fkey
      FOREIGN KEY (corte_id, galpon_id)
      REFERENCES public.corte_galpones(corte_id, galpon_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reg_mort_corte_galpon_fkey'
      AND conrelid = 'public.registro_mortalidad'::regclass
  ) THEN
    ALTER TABLE public.registro_mortalidad
      ADD CONSTRAINT reg_mort_corte_galpon_fkey
      FOREIGN KEY (corte_id, galpon_id)
      REFERENCES public.corte_galpones(corte_id, galpon_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_produccion_corte_id_fecha
  ON public.produccion (corte_id, fecha)
  WHERE corte_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reg_alim_corte_id_fecha
  ON public.registro_alimentacion_galpon (corte_id, fecha)
  WHERE corte_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reg_mortalidad_corte_id_fecha
  ON public.registro_mortalidad (corte_id, fecha)
  WHERE corte_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_attach_corte_id_produccion ON public.produccion;
CREATE TRIGGER trg_attach_corte_id_produccion
BEFORE INSERT OR UPDATE ON public.produccion
FOR EACH ROW
EXECUTE FUNCTION public.attach_and_validate_event_corte_id();

DROP TRIGGER IF EXISTS trg_attach_corte_id_reg_alim ON public.registro_alimentacion_galpon;
CREATE TRIGGER trg_attach_corte_id_reg_alim
BEFORE INSERT OR UPDATE ON public.registro_alimentacion_galpon
FOR EACH ROW
EXECUTE FUNCTION public.attach_and_validate_event_corte_id();

DROP TRIGGER IF EXISTS trg_attach_corte_id_reg_mort ON public.registro_mortalidad;
CREATE TRIGGER trg_attach_corte_id_reg_mort
BEFORE INSERT OR UPDATE ON public.registro_mortalidad
FOR EACH ROW
EXECUTE FUNCTION public.attach_and_validate_event_corte_id();

COMMIT;
