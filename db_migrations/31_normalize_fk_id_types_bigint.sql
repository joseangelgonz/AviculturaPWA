-- Migración 31: Normalizar tipos de columnas FK hacia IDs bigint
-- Objetivo: evitar relaciones int4 -> int8 y eliminar casts innecesarios en RPC de cortes

BEGIN;

-- RLS policies (en tablas propias y dependientes) referencian estas columnas.
-- Se recrean para permitir ALTER COLUMN TYPE.
DROP POLICY IF EXISTS "Los operarios pueden ver los cortes de sus galpones" ON public.cortes;
DROP POLICY IF EXISTS "Los operarios pueden ver sus galpones asignados" ON public.galpones;
DROP POLICY IF EXISTS "Los administradores pueden gestionar corte_galpones" ON public.corte_galpones;
DROP POLICY IF EXISTS "Los operarios pueden ver corte_galpones asignados" ON public.corte_galpones;
DROP POLICY IF EXISTS "Los administradores pueden gestionar asignaciones" ON public.operario_galpones;
DROP POLICY IF EXISTS "Los operarios pueden ver sus asignaciones" ON public.operario_galpones;
DROP POLICY IF EXISTS "Los administradores pueden gestionar la produccion" ON public.produccion;
DROP POLICY IF EXISTS "Los operarios pueden gestionar la produccion de sus galpones" ON public.produccion;
DROP POLICY IF EXISTS "Admin gestiona recoleccion" ON public.recoleccion_huevos;
DROP POLICY IF EXISTS "Operarios gestionan recoleccion de sus galpones" ON public.recoleccion_huevos;
DROP POLICY IF EXISTS "Admin gestiona registro diario" ON public.registro_alimentacion_galpon;
DROP POLICY IF EXISTS "Operarios gestionan registro diario de sus galpones" ON public.registro_alimentacion_galpon;
DROP POLICY IF EXISTS "Los operarios pueden gestionar la mortalidad de sus galpones" ON public.registro_mortalidad;

-- Soltar FKs dependientes para cambiar tipo de columnas hijas
ALTER TABLE public.corte_galpones DROP CONSTRAINT IF EXISTS corte_galpones_corte_id_fkey;
ALTER TABLE public.corte_galpones DROP CONSTRAINT IF EXISTS corte_galpones_galpon_id_fkey;
ALTER TABLE public.operario_galpones DROP CONSTRAINT IF EXISTS operario_galpones_galpon_id_fkey;
ALTER TABLE public.produccion DROP CONSTRAINT IF EXISTS produccion_galpon_id_fkey;
ALTER TABLE public.recoleccion_huevos DROP CONSTRAINT IF EXISTS recoleccion_huevos_galpon_id_fkey;
ALTER TABLE public.registro_alimentacion_galpon DROP CONSTRAINT IF EXISTS registro_alimentacion_galpon_galpon_id_fkey;

-- Alinear tipos con tablas padre (cortes.id y galpones.id son bigint)
ALTER TABLE public.corte_galpones
  ALTER COLUMN corte_id TYPE bigint USING corte_id::bigint,
  ALTER COLUMN galpon_id TYPE bigint USING galpon_id::bigint;

ALTER TABLE public.operario_galpones
  ALTER COLUMN galpon_id TYPE bigint USING galpon_id::bigint;

ALTER TABLE public.produccion
  ALTER COLUMN galpon_id TYPE bigint USING galpon_id::bigint;

ALTER TABLE public.recoleccion_huevos
  ALTER COLUMN galpon_id TYPE bigint USING galpon_id::bigint;

ALTER TABLE public.registro_alimentacion_galpon
  ALTER COLUMN galpon_id TYPE bigint USING galpon_id::bigint;

-- Restaurar FKs con la misma semántica previa
ALTER TABLE public.corte_galpones
  ADD CONSTRAINT corte_galpones_corte_id_fkey
    FOREIGN KEY (corte_id) REFERENCES public.cortes(id) ON DELETE CASCADE,
  ADD CONSTRAINT corte_galpones_galpon_id_fkey
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id);

ALTER TABLE public.operario_galpones
  ADD CONSTRAINT operario_galpones_galpon_id_fkey
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id);

ALTER TABLE public.produccion
  ADD CONSTRAINT produccion_galpon_id_fkey
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id);

ALTER TABLE public.recoleccion_huevos
  ADD CONSTRAINT recoleccion_huevos_galpon_id_fkey
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id);

ALTER TABLE public.registro_alimentacion_galpon
  ADD CONSTRAINT registro_alimentacion_galpon_galpon_id_fkey
    FOREIGN KEY (galpon_id) REFERENCES public.galpones(id);

-- Actualizar RPCs de cortes para no truncar IDs bigint en casts/variables
DROP FUNCTION IF EXISTS public.create_corte_with_galpones(date, text, text, integer, jsonb, integer);

CREATE OR REPLACE FUNCTION public.create_corte_with_galpones(
  p_fecha_inicio date,
  p_tipo_ave text DEFAULT NULL,
  p_notas text DEFAULT NULL,
  p_numero_aves_total integer DEFAULT NULL,
  p_galpones jsonb DEFAULT NULL,
  p_raza_ave_id integer DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_corte_id bigint;
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
    (item->>'galpon_id')::bigint,
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
  v_corte_id bigint;
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

-- Restaurar políticas RLS con la misma lógica actual
CREATE POLICY "Los operarios pueden ver los cortes de sus galpones" ON public.cortes
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.corte_galpones cg
    JOIN public.operario_galpones og ON og.galpon_id = cg.galpon_id
    WHERE cg.corte_id = cortes.id
      AND og.operario_id = auth.uid()
  )
);

CREATE POLICY "Los operarios pueden ver sus galpones asignados" ON public.galpones
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.operario_galpones
    WHERE operario_galpones.galpon_id = galpones.id
      AND operario_galpones.operario_id = auth.uid()
  )
);

CREATE POLICY "Los administradores pueden gestionar corte_galpones" ON public.corte_galpones
FOR ALL TO public
USING (is_admin());

CREATE POLICY "Los operarios pueden ver corte_galpones asignados" ON public.corte_galpones
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.operario_galpones og
    WHERE og.galpon_id = corte_galpones.galpon_id
      AND og.operario_id = auth.uid()
  )
);

CREATE POLICY "Los administradores pueden gestionar asignaciones" ON public.operario_galpones
FOR ALL TO public
USING (is_admin());

CREATE POLICY "Los operarios pueden ver sus asignaciones" ON public.operario_galpones
FOR SELECT TO public
USING (operario_id = auth.uid());

CREATE POLICY "Los administradores pueden gestionar la produccion" ON public.produccion
FOR ALL TO public
USING (is_admin());

CREATE POLICY "Los operarios pueden gestionar la produccion de sus galpones" ON public.produccion
FOR ALL TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.operario_galpones
    WHERE operario_galpones.galpon_id = produccion.galpon_id
      AND operario_galpones.operario_id = auth.uid()
  )
);

CREATE POLICY "Admin gestiona recoleccion" ON public.recoleccion_huevos
FOR ALL TO public
USING (is_admin());

CREATE POLICY "Operarios gestionan recoleccion de sus galpones" ON public.recoleccion_huevos
FOR ALL TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.operario_galpones
    WHERE operario_galpones.galpon_id = recoleccion_huevos.galpon_id
      AND operario_galpones.operario_id = auth.uid()
  )
);

CREATE POLICY "Admin gestiona registro diario" ON public.registro_alimentacion_galpon
FOR ALL TO public
USING (is_admin());

CREATE POLICY "Operarios gestionan registro diario de sus galpones" ON public.registro_alimentacion_galpon
FOR ALL TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.operario_galpones
    WHERE operario_galpones.galpon_id = registro_alimentacion_galpon.galpon_id
      AND operario_galpones.operario_id = auth.uid()
  )
);

CREATE POLICY "Los operarios pueden gestionar la mortalidad de sus galpones" ON public.registro_mortalidad
FOR ALL TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.operario_galpones og
    WHERE og.galpon_id = registro_mortalidad.galpon_id
      AND og.operario_id = auth.uid()
  )
);

COMMIT;
