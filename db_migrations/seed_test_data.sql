-- seed_test_data.sql
-- Datos de prueba para validar el operario dashboard (PR #5).
-- Ejecutar después de todas las migraciones (01–10).
-- IMPORTANTE: No ejecutar en producción.

BEGIN;

-- ============================================================
-- 1. Unidades de medida (si no existen)
-- ============================================================
INSERT INTO public.unidades_medida (codigo, nombre, valor_en_unidad_base)
VALUES
  ('UD', 'Unidad', 1),
  ('KG', 'Kilogramo', 1),
  ('BL', 'Bulto', 40)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- 2. Productos: huevos + alimento
-- ============================================================
INSERT INTO public.productos (descripcion, unidad_medida_codigo)
VALUES
  ('Huevo grande de gallina', 'UD'),
  ('Huevo extragrande de gallina', 'UD'),
  ('Huevo doble A de gallina', 'UD'),
  ('Huevo mediano de gallina', 'UD'),
  ('Huevo pequeño de gallina', 'UD'),
  ('Huevo para uso industrial', 'UD'),
  ('Huevo de gallina de cáscara blanca', 'UD'),
  ('Concentrado ponedoras fase 1', 'BL'),
  ('Concentrado ponedoras fase 2', 'BL')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Causas de mortalidad
-- ============================================================
INSERT INTO public.causas_mortalidad (codigo, descripcion)
VALUES
  ('ENF_RESP', 'Enfermedad respiratoria'),
  ('ENF_DIG', 'Enfermedad digestiva'),
  ('CALOR', 'Estrés por calor'),
  ('DEPREDADOR', 'Ataque de depredador'),
  ('DESCONOCIDA', 'Causa desconocida'),
  ('APLASTAMIENTO', 'Aplastamiento')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- 4. Fincas
-- ============================================================
INSERT INTO public.fincas (id, nombre, ubicacion)
VALUES
  (1, 'Finca La Esperanza', 'Vereda El Rosal, Cundinamarca'),
  (2, 'Finca El Porvenir', 'Vereda San Pedro, Boyacá')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. Galpones
-- ============================================================
INSERT INTO public.galpones (id, finca_id, nombre, capacidad, saldo_aves)
VALUES
  (1, 1, 'Galpón A1', 5000, 4800),
  (2, 1, 'Galpón A2', 5000, 4900),
  (3, 1, 'Galpón A3', 3000, 2950),
  (4, 2, 'Galpón B1', 4000, 3800)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. Cortes (lotes activos)
-- ============================================================
INSERT INTO public.cortes (id, galpon_id, fecha_inicio, numero_aves, tipo_ave, estado, saldo_aves)
VALUES
  (1, 1, '2025-01-15', 4800, 'Hy-Line Brown', 'activo', 4800),
  (2, 2, '2025-02-01', 4900, 'Hy-Line Brown', 'activo', 4900),
  (3, 3, '2025-01-20', 2950, 'Lohmann LSL', 'activo', 2950),
  (4, 4, '2025-03-01', 3800, 'Hy-Line Brown', 'activo', 3800)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. Usuarios de prueba
-- ============================================================
-- Los usuarios deben crearse primero a través de la UI o la API de Supabase Auth.
-- Después de crearlos, copiar sus UUIDs aquí y descomentar las líneas.
--
-- Opción A: Crear usuarios desde el dashboard de Supabase (Authentication > Users > Add User)
--   - admin@test.com / TestAdmin123
--   - operario1@test.com / TestOper123
--   - operario2@test.com / TestOper456
--
-- Opción B: Crear usuarios usando la API de Supabase (reemplazar <SUPABASE_URL> y <SERVICE_ROLE_KEY>):
--   curl -X POST '<SUPABASE_URL>/auth/v1/admin/users' \
--     -H 'apikey: <SERVICE_ROLE_KEY>' \
--     -H 'Authorization: Bearer <SERVICE_ROLE_KEY>' \
--     -H 'Content-Type: application/json' \
--     -d '{"email": "admin@test.com", "password": "TestAdmin123", "email_confirm": true}'
--
-- Una vez creados, el trigger on_auth_user_created insertará automáticamente
-- los perfiles con role = 'operario'. Para el admin, actualizar manualmente:
--
-- UPDATE public.profiles SET role = 'administrador' WHERE email = 'admin@test.com';

-- ============================================================
-- 8. Asignación de galpones a operarios
-- ============================================================
-- Descomentar y reemplazar los UUIDs con los IDs reales de los operarios.

INSERT INTO public.operario_galpones (operario_id, galpon_id)
VALUES
   ('91bceb28-ba39-42d4-ace1-c0d03b3f6e16', 1),  -- operario1 -> Galpón A1
   ('91bceb28-ba39-42d4-ace1-c0d03b3f6e16', 2),  -- operario1 -> Galpón A2
   ('c041f123-28d3-48b1-a854-dd12522baa3d', 3),  -- operario2 -> Galpón A3
   ('c041f123-28d3-48b1-a854-dd12522baa3d', 4)   -- operario2 -> Galpón B1
ON CONFLICT DO NOTHING;

COMMIT;
