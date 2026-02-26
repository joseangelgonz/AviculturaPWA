-- Migración 30: Limpieza de legado tipo_ave en cortes
-- - Requiere raza_ave_id en cortes
-- - Elimina columna legacy tipo_ave
-- - Mantiene compatibilidad de RPC aceptando p_tipo_ave (ignorado)

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.cortes WHERE raza_ave_id IS NULL) THEN
    RAISE EXCEPTION 'No se puede limpiar tipo_ave: existen cortes sin raza_ave_id.';
  END IF;
END $$;

ALTER TABLE public.cortes
  ALTER COLUMN raza_ave_id SET NOT NULL;

DROP FUNCTION IF EXISTS public.create_corte_with_galpones(date, text, text, integer, jsonb, integer);

CREATE OR REPLACE FUNCTION public.create_corte_with_galpones(
  p_fecha_inicio date,
  p_tipo_ave text DEFAULT NULL,
  p_notas text DEFAULT NULL,
  p_numero_aves_total integer DEFAULT NULL,
  p_galpones jsonb DEFAULT NULL,
  p_raza_ave_id integer DEFAULT NULL
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
  IF p_raza_ave_id IS NULL THEN
    RAISE EXCEPTION 'La raza de ave es obligatoria.';
  END IF;

  PERFORM 1
  FROM public.razas_ave r
  WHERE r.id = p_raza_ave_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La raza de ave % no existe.', p_raza_ave_id;
  END IF;

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
    raza_ave_id,
    notas,
    estado
  )
  VALUES (
    p_fecha_inicio,
    NULL,
    p_numero_aves_total,
    p_numero_aves_total,
    p_raza_ave_id,
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

DROP FUNCTION IF EXISTS public.crear_corte_con_galpones(date, text, text, integer, jsonb, integer);

CREATE OR REPLACE FUNCTION public.crear_corte_con_galpones(
  p_fecha_inicio date,
  p_tipo_ave text DEFAULT NULL,
  p_notas text DEFAULT NULL,
  p_numero_aves_total integer DEFAULT NULL,
  p_galpones jsonb DEFAULT NULL,
  p_raza_ave_id integer DEFAULT NULL
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
    p_galpones,
    p_raza_ave_id
  );

  RETURN jsonb_build_object('corte_id', v_corte_id);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_corte_with_galpones(date, text, text, integer, jsonb, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_corte_con_galpones(date, text, text, integer, jsonb, integer) TO authenticated;

ALTER TABLE public.cortes
  DROP COLUMN IF EXISTS tipo_ave;

COMMIT;
