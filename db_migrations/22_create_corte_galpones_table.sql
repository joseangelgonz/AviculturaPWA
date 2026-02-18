-- Migración 22: Tabla corte_galpones (distribución multi-galpón) y columnas totales en cortes

-- 1. Agregar columnas de totales a cortes (si no existen)
ALTER TABLE "public"."cortes"
  ADD COLUMN IF NOT EXISTS "numero_aves_total" INTEGER NOT NULL CHECK (numero_aves_total > 0),
  ADD COLUMN IF NOT EXISTS "saldo_aves_total" INTEGER NOT NULL CHECK (saldo_aves_total >= 0);

-- 2. Crear tabla de detalle corte ↔ galpón
CREATE TABLE IF NOT EXISTS "public"."corte_galpones" (
  "corte_id"        INTEGER NOT NULL REFERENCES "public"."cortes" ("id") ON DELETE CASCADE,
  "galpon_id"       INTEGER NOT NULL REFERENCES "public"."galpones" ("id"),
  "aves_iniciales"  INTEGER NOT NULL CHECK (aves_iniciales > 0),
  "saldo_aves"      INTEGER NOT NULL CHECK (saldo_aves >= 0),
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("corte_id", "galpon_id")
);

-- 3. RLS
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
