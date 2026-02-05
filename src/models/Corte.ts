// src/models/Corte.ts
export interface Corte {
  id: number;
  galpon_id: number;
  fecha_inicio: string; // ISO 8601
  fecha_final?: string; // Opcional
  numero_aves: number;
  tipo_ave: string;
  notas?: string; // Opcional
  /**
   * Representa el estado actual del corte.
   * Puede ser 'activo' o 'finalizado'.
   */
  estado: 'activo' | 'finalizado';
  created_at: string;
}
