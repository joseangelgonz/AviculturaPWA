// src/models/Produccion.ts
export interface Produccion {
  corte_id: string; // Asumiendo UUID o string de referencia
  fecha: string; // ISO 8601
  numero_secuencia: number;
  producto_codigo: number; // Referencia al codigo INTEGER de productos
  cantidad: number;
}

