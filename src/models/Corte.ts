// src/models/Corte.ts
export interface Corte {
  id: number;
  fecha_inicio: string; // ISO 8601
  fecha_final: string | null;
  tipo_ave: string | null;
  notas: string | null;
  numero_aves_total: number;
  saldo_aves_total: number;
  estado: 'activo' | 'finalizado';
  created_at: string | null;
}

export interface CorteGalpon {
  corte_id: number;
  galpon_id: number;
  aves_iniciales: number;
  saldo_aves: number;
  created_at: string;
}
