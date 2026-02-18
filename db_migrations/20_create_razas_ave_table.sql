-- Migración para crear la tabla de razas de aves
-- Esta tabla almacenará las diferentes razas de aves ponedoras.

CREATE TABLE "public"."razas_ave" (
    "id" SERIAL PRIMARY KEY,
    "codigo" VARCHAR(50) UNIQUE NOT NULL,
    "descripcion" TEXT
);

-- Habilitar RLS para la nueva tabla
ALTER TABLE "public"."razas_ave" ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública a todos los usuarios autenticados
CREATE POLICY "allow_read_for_authenticated_users"
ON "public"."razas_ave"
FOR SELECT
TO authenticated
USING (true);

COMMENT ON TABLE "public"."razas_ave" IS 'Catálogo de razas de aves de postura.';
COMMENT ON COLUMN "public"."razas_ave"."codigo" IS 'Código único para la raza, ej. HYLINE-BROWN.';
COMMENT ON COLUMN "public"."razas_ave"."descripcion" IS 'Nombre completo o descripción de la raza.';
