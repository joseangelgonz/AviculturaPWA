-- 05: Índice compuesto en produccion + políticas RLS para productos y unidades_medida

-- 1. Índice compuesto en produccion(corte_id, fecha) para optimizar consultas del dashboard
CREATE INDEX IF NOT EXISTS idx_produccion_corte_fecha
  ON public.produccion (corte_id, fecha);

-- 2. Habilitar RLS en productos y unidades_medida
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_medida ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para productos: lectura pública para usuarios autenticados, escritura solo admin
CREATE POLICY "Usuarios autenticados pueden ver productos"
  ON public.productos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los administradores pueden gestionar productos"
  ON public.productos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrador'));

-- 4. Políticas para unidades_medida: lectura pública para usuarios autenticados, escritura solo admin
CREATE POLICY "Usuarios autenticados pueden ver unidades de medida"
  ON public.unidades_medida FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los administradores pueden gestionar unidades de medida"
  ON public.unidades_medida FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrador'));
