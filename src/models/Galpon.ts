// src/models/Galpon.ts
export interface Galpon {
  id: number;
  finca_id: number;
  nombre: string;
  capacidad: number | null;
  saldo_aves: number;
  created_at: string | null;
  fincas?: {
    id: number;
    nombre: string;
    ubicacion?: string | null;
  } | null;
}
