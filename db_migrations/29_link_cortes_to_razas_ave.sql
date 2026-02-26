-- Migración 29: Vincular cortes con razas_ave mediante FK y actualizar RPCs de creación

BEGIN;

ALTER TABLE public.cortes
  ADD COLUMN IF NOT EXISTS raza_ave_id integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cortes_raza_ave_id_fkey'
      AND conrelid = 'public.cortes'::regclass
  ) THEN
    ALTER TABLE public.cortes
      ADD CONSTRAINT cortes_raza_ave_id_fkey
      FOREIGN KEY (raza_ave_id)
      REFERENCES public.razas_ave (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cortes_raza_ave_id ON public.cortes (raza_ave_id);

-- Backfill desde el campo legacy tipo_ave cuando sea posible.
WITH raza_lookup AS (
  SELECT
    r.id,
    upper(trim(r.codigo)) AS codigo_upper,
    regexp_replace(upper(r.codigo), '[^A-Z0-9]+', '', 'g') AS codigo_norm,
    upper(trim(split_part(coalesce(r.descripcion, ''), ' - ', 1))) AS nombre_upper,
    regexp_replace(upper(split_part(coalesce(r.descripcion, ''), ' - ', 1)), '[^A-Z0-9]+', '', 'g') AS nombre_norm
  FROM public.razas_ave r
),
matches AS (
  SELECT
    c.id AS corte_id,
    rl.id AS raza_id,
    row_number() OVER (
      PARTITION BY c.id
      ORDER BY
        CASE
          WHEN upper(trim(c.tipo_ave)) = rl.codigo_upper THEN 1
          WHEN upper(trim(c.tipo_ave)) = rl.nombre_upper THEN 2
          WHEN regexp_replace(upper(c.tipo_ave), '[^A-Z0-9]+', '', 'g') = rl.codigo_norm THEN 3
          WHEN regexp_replace(upper(c.tipo_ave), '[^A-Z0-9]+', '', 'g') = rl.nombre_norm THEN 4
          ELSE 99
        END,
        rl.id
    ) AS rn
  FROM public.cortes c
  JOIN raza_lookup rl
    ON (
      upper(trim(c.tipo_ave)) = rl.codigo_upper
      OR upper(trim(c.tipo_ave)) = rl.nombre_upper
      OR regexp_replace(upper(c.tipo_ave), '[^A-Z0-9]+', '', 'g') = rl.codigo_norm
      OR regexp_replace(upper(c.tipo_ave), '[^A-Z0-9]+', '', 'g') = rl.nombre_norm
    )
  WHERE c.raza_ave_id IS NULL
    AND c.tipo_ave IS NOT NULL
    AND btrim(c.tipo_ave) <> ''
)
UPDATE public.cortes c
SET raza_ave_id = m.raza_id
FROM matches m
WHERE c.id = m.corte_id
  AND m.rn = 1;

DROP FUNCTION IF EXISTS public.create_corte_with_galpones(date, text, text, integer, jsonb);

CREATE OR REPLACE FUNCTION public.create_corte_with_galpones(
  p_fecha_inicio date,
  p_tipo_ave text,
  p_notas text,
  p_numero_aves_total integer,
  p_galpones jsonb,
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
  v_tipo_ave_resolved text;
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

  IF p_raza_ave_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(trim(r.descripcion), ''), r.codigo)
    INTO v_tipo_ave_resolved
    FROM public.razas_ave r
    WHERE r.id = p_raza_ave_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'La raza de ave % no existe.', p_raza_ave_id;
    END IF;
  ELSE
    v_tipo_ave_resolved := NULLIF(TRIM(COALESCE(p_tipo_ave, '')), '');
  END IF;

  INSERT INTO public.cortes (
    fecha_inicio,
    fecha_final,
    numero_aves_total,
    saldo_aves_total,
    raza_ave_id,
    tipo_ave,
    notas,
    estado
  )
  VALUES (
    p_fecha_inicio,
    NULL,
    p_numero_aves_total,
    p_numero_aves_total,
    p_raza_ave_id,
    v_tipo_ave_resolved,
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

DROP FUNCTION IF EXISTS public.crear_corte_con_galpones(date, text, text, integer, jsonb);

CREATE OR REPLACE FUNCTION public.crear_corte_con_galpones(
  p_fecha_inicio date,
  p_tipo_ave text,
  p_notas text,
  p_numero_aves_total integer,
  p_galpones jsonb,
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

COMMIT;
