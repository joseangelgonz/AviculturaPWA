-- 28_security_and_policy_cleanup.sql
-- Limpieza de seguridad y micro-optimizaciones RLS sin cambiar autorizaciones.

BEGIN;

-- Advisory 0011: fijar search_path de funcion trigger de signup.
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Estandarizar policies admin en tablas de catalogos para evitar repetir subqueries complejas.
DROP POLICY IF EXISTS "Los administradores pueden gestionar fabricantes de alimento" ON public.fabricantes_alimento;
CREATE POLICY "Los administradores pueden gestionar fabricantes de alimento"
  ON public.fabricantes_alimento FOR ALL
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Los administradores pueden gestionar alimentos" ON public.alimentos;
CREATE POLICY "Los administradores pueden gestionar alimentos"
  ON public.alimentos FOR ALL
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Los administradores pueden gestionar productos" ON public.productos;
CREATE POLICY "Los administradores pueden gestionar productos"
  ON public.productos FOR ALL
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Los administradores pueden gestionar unidades de medida" ON public.unidades_medida;
CREATE POLICY "Los administradores pueden gestionar unidades de medida"
  ON public.unidades_medida FOR ALL
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

COMMIT;
