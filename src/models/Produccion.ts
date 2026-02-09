// src/models/Produccion.ts
export interface Produccion {
  galpon_id: number;
  fecha: string; // ISO 8601
  numero_secuencia: number;
  producto_codigo: number; // Referencia al codigo INTEGER de productos
  cantidad: number;
}

