export interface Producto {
  id: string; // UUID
  codigo: number; // Ahora es un INTEGER autoincremental
  descripcion?: string; // Nullable
  unidad_medida_codigo: string; // Ahora es una clave foránea que referencia unidades_medida.codigo
}
