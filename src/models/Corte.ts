// src/models/Corte.ts
export interface Corte {
  id: number;
  galpon_id: number | null;
  fecha_inicio: string; // ISO 8601
  fecha_final: string | null;
  numero_aves: number;
  tipo_ave: string | null;
  notas: string | null;
  numero_aves_total: number;
  saldo_aves_total: number;
  /**
   * Representa el estado actual del corte.
   * Puede ser 'activo' o 'finalizado'.
   */
  estado: 'activo' | 'finalizado';
  created_at: string | null;
}

export interface CorteGalpon {
  id: number;
  corte_id: number;
  galpon_id: number;
  aves_iniciales: number;
  aves_actuales: number;
}
