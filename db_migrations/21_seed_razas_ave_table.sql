-- Migración para poblar la tabla de razas de aves
-- Estos son algunos de los tipos de aves de postura más comunes.

INSERT INTO "public"."razas_ave" ("codigo", "descripcion") VALUES
('LEGHORN', 'Leghorn - Huevos blancos, alta producción'),
('RHODE-ISLAND-RED', 'Rhode Island Red - Huevos marrones, muy resistente'),
('PLYMOUTH-ROCK', 'Plymouth Rock Barrada - Huevos marrones, dócil'),
('ISA-BROWN', 'ISA Brown - Huevos marrones, alta producción'),
('SUSSEX', 'Sussex - Huevos claros, doble propósito'),
('AUSTRALORP', 'Australorp - Huevos marrones, alta producción y resistencia'),
('LOHMANN-BROWN', 'Lohmann Brown - Huevos marrones, híbrida de alta productividad');

COMMENT ON TABLE "public"."razas_ave" IS 'Catálogo de razas de aves de postura.';
