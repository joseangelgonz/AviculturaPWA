export interface Alimento {
  codigo: number;
  descripcion: string;
  fabricante_alimento_id: number;
  fabricante_nombre: string;
  categoria: string | null;
  activo: boolean;
}
