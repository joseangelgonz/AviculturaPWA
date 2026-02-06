// src/models/Produccion.ts
export interface Produccion {
  id: number;
  corte_id: number;
  fecha: string; // ISO 8601
  huevos_y: number;
  huevos_aaa: number;
  huevos_aa: number;
  huevos_a: number;
  huevos_b: number;
  huevos_c: number;
  huevos_blancos: number;
  alimento: number | null;
  muertes: number;
  notas?: string;
  created_at: string;
}
