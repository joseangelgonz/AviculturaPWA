-- 26_harden_corte_integrity_and_rpc.sql
-- Endurece integridad de corte/galpon y estandariza RPC canonico.

BEGIN;

CREATE OR REPLACE FUNCTION public.validate_corte_galpones_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_corte_estado text;
  v_capacidad integer;
BEGIN
  SELECT estado
  INTO v_corte_estado
  FROM public.cortes
  WHERE id = NEW.corte_id;

  IF v_corte_estado = 'activo' THEN
    IF EXISTS (
      SELECT 1
      FROM public.corte_galpones cg
      JOIN public.cortes c ON c.id = cg.corte_id
      WHERE cg.galpon_id = NEW.galpon_id
        AND c.estado = 'activo'
        AND cg.corte_id <> NEW.corte_id
    ) THEN
      RAISE EXCEPTION 'El galpon % ya tiene un corte activo.', NEW.galpon_id;
    END IF;
  END IF;

  SELECT capacidad
  INTO v_capacidad
  FROM public.galpones
  WHERE id = NEW.galpon_id;

  IF v_capacidad IS NOT NULL AND NEW.aves_iniciales > v_capacidad THEN
    RAISE EXCEPTION 'Las aves iniciales (%) exceden la capacidad (%) del galpon %.', NEW.aves_iniciales, v_capacidad, NEW.galpon_id;
  END IF;

  IF NEW.saldo_aves IS NULL THEN
    NEW.saldo_aves := NEW.aves_iniciales;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_validate_corte_galpones_entry ON public.corte_galpones;
CREATE TRIGGER trg_validate_corte_galpones_entry
BEFORE INSERT OR UPDATE ON public.corte_galpones
FOR EACH ROW
EXECUTE FUNCTION public.validate_corte_galpones_entry();

-- RPC canonico de creacion de corte.
CREATE OR REPLACE FUNCTION public.create_corte_with_galpones(
  p_fecha_inicio date,
  p_tipo_ave text,
  p_notas text,
  p_numero_aves_total integer,
  p_galpones jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_corte_id integer;
  v_sum_aves integer;
BEGIN
  IF p_numero_aves_total IS NULL OR p_numero_aves_total <= 0 THEN
    RAISE EXCEPTION 'El numero total de aves debe ser mayor que cero.';
  END IF;

  IF p_galpones IS NULL OR jsonb_typeof(p_galpones) <> 'array' OR jsonb_array_length(p_galpones) = 0 THEN
    RAISE EXCEPTION 'Debes enviar al menos un galpon para el corte.';
  END IF;

  SELECT COALESCE(SUM((item->>'aves_iniciales')::integer), 0)
  INTO v_sum_aves
  FROM jsonb_array_elements(p_galpones) item;

  IF v_sum_aves <> p_numero_aves_total THEN
    RAISE EXCEPTION 'La suma de aves por galpon (%) debe coincidir con el total del corte (%).', v_sum_aves, p_numero_aves_total;
  END IF;

  INSERT INTO public.cortes (
    fecha_inicio,
    fecha_final,
    numero_aves_total,
    saldo_aves_total,
    tipo_ave,
    notas,
    estado
  )
  VALUES (
    p_fecha_inicio,
    NULL,
    p_numero_aves_total,
    p_numero_aves_total,
    NULLIF(TRIM(COALESCE(p_tipo_ave, '')), ''),
    NULLIF(TRIM(COALESCE(p_notas, '')), ''),
    'activo'
  )
  RETURNING id INTO v_corte_id;

  INSERT INTO public.corte_galpones (corte_id, galpon_id, aves_iniciales, saldo_aves)
  SELECT
    v_corte_id,
    (item->>'galpon_id')::integer,
    (item->>'aves_iniciales')::integer,
    (item->>'aves_iniciales')::integer
  FROM jsonb_array_elements(p_galpones) item;

  UPDATE public.galpones g
  SET saldo_aves = cg.aves_iniciales
  FROM public.corte_galpones cg
  WHERE cg.corte_id = v_corte_id
    AND cg.galpon_id = g.id;

  RETURN v_corte_id;
END;
$function$;

-- Wrapper legacy (compatibilidad) hacia RPC canonico.
CREATE OR REPLACE FUNCTION public.crear_corte_con_galpones(
  p_fecha_inicio date,
  p_tipo_ave text,
  p_notas text,
  p_numero_aves_total integer,
  p_galpones jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_corte_id integer;
BEGIN
  v_corte_id := public.create_corte_with_galpones(
    p_fecha_inicio,
    p_tipo_ave,
    p_notas,
    p_numero_aves_total,
    p_galpones
  );

  RETURN jsonb_build_object('corte_id', v_corte_id);
END;
$function$;

COMMIT;
