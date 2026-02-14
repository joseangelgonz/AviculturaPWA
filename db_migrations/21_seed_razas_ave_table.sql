-- Migración para poblar la tabla de razas de aves
-- Estos son algunos de los tipos de aves de postura más comunes.

INSERT INTO "public"."razas_ave" ("codigo", "descripcion") VALUES
('ISA-BROWN', 'Isa Brown - Reina de la producción de huevos en Colombia, alta eficiencia'),
('LOHMANN-BROWN', 'Lohmann Brown - Alta productividad, reconocida en Colombia'),
('HY-LINE-BROWN', 'Hy-Line Brown - Excelente producción y tamaño de huevos'),
('DEKALB-WHITE', 'Dekalb White - Alta producción de huevos blancos'),
('LEGHORN', 'Leghorn - Máxima eficiencia y productividad, huevos blancos'),
('RHODE-ISLAND-RED', 'Rhode Island Red - Resistente y adaptable, huevos marrones'),
('SUSSEX', 'Sussex - Dócil, adaptable a pastoreo, doble propósito'),
('PLYMOUTH-ROCK', 'Plymouth Rock - Doble propósito, huevos marrones claros'),
('BABCOCK-BROWN', 'Babcock Brown - Equilibrada, robusta y de alto rendimiento'),
('AUSTRALORP', 'Australorp - Dócil, adaptable a climas fríos, alta producción'),
('FAGRO', 'FAGRO - Gallina criolla mejorada (huevos blancos)'),
('IPA', 'IPA - Gallina criolla mejorada (huevos crema o blancos)');

COMMENT ON TABLE "public"."razas_ave" IS 'Catálogo de razas de aves de postura.';
