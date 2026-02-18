-- Migración 23: RPC crear_corte_con_galpones — inserta corte + detalle atómicamente

CREATE OR REPLACE FUNCTION public.crear_corte_con_galpones(
  p_fecha_inicio      DATE,
  p_tipo_ave          TEXT,
  p_notas             TEXT,
  p_numero_aves_total INTEGER,
  p_galpones          JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_corte_id   INTEGER;
  v_galpon     JSONB;
BEGIN
  -- Insertar corte
  INSERT INTO cortes (
    fecha_inicio, tipo_ave, notas,
    numero_aves_total, saldo_aves_total,
    estado
  ) VALUES (
    p_fecha_inicio, p_tipo_ave, p_notas,
    p_numero_aves_total, p_numero_aves_total,
    'activo'
  )
  RETURNING id INTO v_corte_id;

  -- Insertar detalle por galpon
  FOR v_galpon IN SELECT * FROM jsonb_array_elements(p_galpones)
  LOOP
    INSERT INTO corte_galpones (corte_id, galpon_id, aves_iniciales, saldo_aves)
    VALUES (
      v_corte_id,
      (v_galpon->>'galpon_id')::INTEGER,
      (v_galpon->>'aves_iniciales')::INTEGER,
      (v_galpon->>'aves_iniciales')::INTEGER
    );
  END LOOP;

  RETURN jsonb_build_object('corte_id', v_corte_id);
END;
$$;
