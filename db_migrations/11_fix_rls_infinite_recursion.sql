-- db_migrations/11_fix_rls_infinite_recursion.sql
-- Corrige la recursión infinita en las políticas RLS que consultan
-- la tabla 'profiles' dentro de políticas sobre la misma tabla.
--
-- Solución: función SECURITY DEFINER que lee el rol sin pasar por RLS.

BEGIN;

-- ============================================================
-- 1. Función auxiliar para obtener el rol sin RLS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- ============================================================
-- 2. Helper: ¿es administrador el usuario actual?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrador'
  );
$$;

-- ============================================================
-- 3. Reemplazar políticas de profiles
-- ============================================================
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;

CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los administradores pueden ver todos los perfiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 4. Reemplazar políticas de fincas
-- ============================================================
DROP POLICY IF EXISTS "Los administradores pueden gestionar fincas" ON public.fincas;

CREATE POLICY "Los administradores pueden gestionar fincas" ON public.fincas
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 5. Reemplazar políticas de galpones
-- ============================================================
DROP POLICY IF EXISTS "Los administradores pueden gestionar galpones" ON public.galpones;
DROP POLICY IF EXISTS "Los operarios pueden ver sus galpones asignados" ON public.galpones;

CREATE POLICY "Los administradores pueden gestionar galpones" ON public.galpones
  FOR ALL USING (public.is_admin());

CREATE POLICY "Los operarios pueden ver sus galpones asignados" ON public.galpones
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.operario_galpones WHERE galpon_id = id AND operario_id = auth.uid()
  ));

-- ============================================================
-- 6. Reemplazar políticas de cortes
-- ============================================================
DROP POLICY IF EXISTS "Los administradores pueden gestionar cortes" ON public.cortes;
DROP POLICY IF EXISTS "Los operarios pueden ver los cortes de sus galpones" ON public.cortes;

CREATE POLICY "Los administradores pueden gestionar cortes" ON public.cortes
  FOR ALL USING (public.is_admin());

CREATE POLICY "Los operarios pueden ver los cortes de sus galpones" ON public.cortes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.operario_galpones WHERE galpon_id = cortes.galpon_id AND operario_id = auth.uid()
  ));

-- ============================================================
-- 7. Reemplazar políticas de produccion
-- ============================================================
DROP POLICY IF EXISTS "Los administradores pueden gestionar la produccion" ON public.produccion;
DROP POLICY IF EXISTS "Los operarios pueden gestionar la produccion de sus galpones" ON public.produccion;

CREATE POLICY "Los administradores pueden gestionar la produccion" ON public.produccion
  FOR ALL USING (public.is_admin());

CREATE POLICY "Los operarios pueden gestionar la produccion de sus galpones" ON public.produccion
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.operario_galpones
    WHERE galpon_id = produccion.galpon_id AND operario_id = auth.uid()
  ));

-- ============================================================
-- 8. Reemplazar políticas de operario_galpones
-- ============================================================
DROP POLICY IF EXISTS "Los administradores pueden gestionar asignaciones" ON public.operario_galpones;

CREATE POLICY "Los administradores pueden gestionar asignaciones" ON public.operario_galpones
  FOR ALL USING (public.is_admin());

CREATE POLICY "Los operarios pueden ver sus asignaciones" ON public.operario_galpones
  FOR SELECT USING (operario_id = auth.uid());

-- ============================================================
-- 9. Políticas para tablas nuevas (PR #5)
-- ============================================================

-- recoleccion_huevos
ALTER TABLE public.recoleccion_huevos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestiona recoleccion" ON public.recoleccion_huevos
  FOR ALL USING (public.is_admin());

CREATE POLICY "Operarios gestionan recoleccion de sus galpones" ON public.recoleccion_huevos
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.operario_galpones
    WHERE galpon_id = recoleccion_huevos.galpon_id AND operario_id = auth.uid()
  ));

-- registro_diario_galpon
ALTER TABLE public.registro_diario_galpon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestiona registro diario" ON public.registro_diario_galpon
  FOR ALL USING (public.is_admin());

CREATE POLICY "Operarios gestionan registro diario de sus galpones" ON public.registro_diario_galpon
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.operario_galpones
    WHERE galpon_id = registro_diario_galpon.galpon_id AND operario_id = auth.uid()
  ));

-- causas_mortalidad (tabla de referencia, lectura para todos los autenticados)
ALTER TABLE public.causas_mortalidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver causas de mortalidad" ON public.causas_mortalidad
  FOR SELECT USING (auth.uid() IS NOT NULL);

COMMIT;
