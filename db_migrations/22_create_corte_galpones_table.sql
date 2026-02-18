-- Migración 22: Tabla corte_galpones (distribución multi-galpón) y columnas totales en cortes

-- 1. Agregar columnas de totales a cortes
ALTER TABLE "public"."cortes"
  ADD COLUMN IF NOT EXISTS "numero_aves_total" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "saldo_aves_total" INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill desde las columnas legacy
UPDATE "public"."cortes"
SET "numero_aves_total" = "numero_aves",
    "saldo_aves_total"  = "saldo_aves"
WHERE "numero_aves_total" = 0;

-- 3. Hacer galpon_id nullable (cortes multi-galpón no lo usan)
ALTER TABLE "public"."cortes"
  ALTER COLUMN "galpon_id" DROP NOT NULL;

-- 4. Crear tabla de detalle corte ↔ galpón
CREATE TABLE IF NOT EXISTS "public"."corte_galpones" (
  "id"              SERIAL PRIMARY KEY,
  "corte_id"        INTEGER NOT NULL REFERENCES "public"."cortes" ("id") ON DELETE CASCADE,
  "galpon_id"       INTEGER NOT NULL REFERENCES "public"."galpones" ("id") ON DELETE RESTRICT,
  "aves_iniciales"  INTEGER NOT NULL DEFAULT 0,
  "aves_actuales"   INTEGER NOT NULL DEFAULT 0,
  UNIQUE ("corte_id", "galpon_id")
);

-- 5. Backfill corte_galpones desde cortes existentes con galpon_id
INSERT INTO "public"."corte_galpones" ("corte_id", "galpon_id", "aves_iniciales", "aves_actuales")
SELECT "id", "galpon_id", "numero_aves", "saldo_aves"
FROM "public"."cortes"
WHERE "galpon_id" IS NOT NULL
ON CONFLICT ("corte_id", "galpon_id") DO NOTHING;

-- 6. RLS
ALTER TABLE "public"."corte_galpones" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on corte_galpones"
  ON "public"."corte_galpones"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "public"."profiles"
      WHERE "profiles"."id" = auth.uid()
        AND "profiles"."role" = 'administrador'
    )
  );

CREATE POLICY "Operarios select own corte_galpones"
  ON "public"."corte_galpones"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "public"."operario_galpones"
      WHERE "operario_galpones"."operario_id" = auth.uid()
        AND "operario_galpones"."galpon_id" = "corte_galpones"."galpon_id"
    )
  );

COMMENT ON TABLE "public"."corte_galpones" IS 'Distribución de aves por galpón dentro de un corte.';
