-- 27_saldo_projection_from_events.sql
-- saldo_aves se mantiene como proyeccion derivada de eventos de mortalidad.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'galpones_saldo_aves_check'
      AND conrelid = 'public.galpones'::regclass
  ) THEN
    ALTER TABLE public.galpones
      ADD CONSTRAINT galpones_saldo_aves_check
      CHECK (saldo_aves >= 0);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.apply_saldo_delta_from_mortality(
  p_galpon_id bigint,
  p_fecha date,
  p_delta integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_corte_id bigint;
BEGIN
  -- Ajuste de saldo por galpon (proyeccion inmediata).
  UPDATE public.galpones
  SET saldo_aves = saldo_aves - p_delta
  WHERE id = p_galpon_id;

  -- Resolver corte activo por galpon y fecha del evento.
  SELECT cg.corte_id
  INTO v_corte_id
  FROM public.corte_galpones cg
  JOIN public.cortes c ON c.id = cg.corte_id
  WHERE cg.galpon_id = p_galpon_id
    AND c.estado = 'activo'
    AND c.fecha_inicio::date <= p_fecha
    AND (c.fecha_final IS NULL OR c.fecha_final::date >= p_fecha)
  ORDER BY c.fecha_inicio DESC
  LIMIT 1;

  IF v_corte_id IS NOT NULL THEN
    UPDATE public.corte_galpones
    SET saldo_aves = saldo_aves - p_delta
    WHERE corte_id = v_corte_id
      AND galpon_id = p_galpon_id;

    UPDATE public.cortes
    SET saldo_aves_total = saldo_aves_total - p_delta
    WHERE id = v_corte_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_saldo_aves_from_mortality()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.apply_saldo_delta_from_mortality(NEW.galpon_id, NEW.fecha, NEW.cantidad_aves_muertas);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM public.apply_saldo_delta_from_mortality(OLD.galpon_id, OLD.fecha, -OLD.cantidad_aves_muertas);
    RETURN OLD;
  END IF;

  -- UPDATE
  IF OLD.galpon_id = NEW.galpon_id AND OLD.fecha = NEW.fecha THEN
    PERFORM public.apply_saldo_delta_from_mortality(
      NEW.galpon_id,
      NEW.fecha,
      NEW.cantidad_aves_muertas - OLD.cantidad_aves_muertas
    );
  ELSE
    -- revertir efecto anterior
    PERFORM public.apply_saldo_delta_from_mortality(OLD.galpon_id, OLD.fecha, -OLD.cantidad_aves_muertas);
    -- aplicar efecto nuevo
    PERFORM public.apply_saldo_delta_from_mortality(NEW.galpon_id, NEW.fecha, NEW.cantidad_aves_muertas);
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_update_saldo_aves_from_mortality ON public.registro_mortalidad;
CREATE TRIGGER trg_update_saldo_aves_from_mortality
AFTER INSERT OR UPDATE OR DELETE ON public.registro_mortalidad
FOR EACH ROW
EXECUTE FUNCTION public.update_saldo_aves_from_mortality();

CREATE OR REPLACE FUNCTION public.rebuild_saldos_from_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.corte_galpones cg
  SET saldo_aves = GREATEST(
    cg.aves_iniciales - COALESCE((
      SELECT SUM(rm.cantidad_aves_muertas)::integer
      FROM public.registro_mortalidad rm
      JOIN public.cortes c ON c.id = cg.corte_id
      WHERE rm.galpon_id = cg.galpon_id
        AND rm.fecha >= c.fecha_inicio::date
        AND (c.fecha_final IS NULL OR rm.fecha <= c.fecha_final::date)
    ), 0),
    0
  );

  UPDATE public.cortes c
  SET saldo_aves_total = COALESCE(s.sum_saldo, 0)
  FROM (
    SELECT corte_id, SUM(saldo_aves)::integer AS sum_saldo
    FROM public.corte_galpones
    GROUP BY corte_id
  ) s
  WHERE s.corte_id = c.id;

  UPDATE public.galpones g
  SET saldo_aves = COALESCE((
    SELECT cg.saldo_aves
    FROM public.corte_galpones cg
    JOIN public.cortes c ON c.id = cg.corte_id
    WHERE cg.galpon_id = g.id
      AND c.estado = 'activo'
    ORDER BY c.fecha_inicio DESC
    LIMIT 1
  ), 0);
END;
$function$;

-- Reconciliar una vez al aplicar la migracion.
SELECT public.rebuild_saldos_from_events();

COMMIT;
