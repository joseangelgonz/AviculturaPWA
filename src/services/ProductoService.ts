import { supabase } from './supabaseClient';
import type { Producto } from '../models/Producto';
import type { UnidadMedida } from '../models/UnidadMedida';

const ProductoService = {
  /**
   * Obtiene todos los productos.
   * @returns Una promesa que resuelve con un array de productos o un error.
   */
  async getAllProductos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*'); // Selecciona todos los campos de la tabla productos

    if (error) {
      console.error('Error al obtener productos:', error);
      throw new Error('No se pudieron obtener los productos.');
    }
    return data as Producto[];
  },

  /**
   * Crea un nuevo producto.
   * @param newProducto Los datos del nuevo producto a crear.
   * @returns Una promesa que resuelve con el producto creado o un error.
   */
  async createProducto(newProducto: Omit<Producto, 'id' | 'codigo'>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert([newProducto])
      .select('id, codigo, descripcion, unidad_medida_codigo'); // Select all fields including the generated codigo

    if (error) {
      console.error('Error al crear producto:', error);
      throw new Error('No se pudo crear el producto.');
    }
    return data[0] as Producto;
  },

  /**
   * Obtiene todas las unidades de medida.
   * @returns Una promesa que resuelve con un array de unidades de medida o un error.
   */
  async getAllUnidadesMedida(): Promise<UnidadMedida[]> {
    const { data, error } = await supabase
      .from('unidades_medida')
      .select('*'); // Selecciona todos los campos de la tabla unidades_medida

    if (error) {
      console.error('Error al obtener unidades de medida:', error);
      throw new Error('No se pudieron obtener las unidades de medida.');
    }
    return data as UnidadMedida[];
  },
};

export default ProductoService;
