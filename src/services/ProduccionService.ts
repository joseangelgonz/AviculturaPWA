import { supabase } from './supabaseClient';

const ProduccionService = {
  /**
   * Inserta un registro de producción (clasificación de huevos).
   *
   * @param galpon_id El ID del galpón.
   * @param fecha La fecha del registro (YYYY-MM-DD).
   * @param numero_secuencia El número de secuencia para ese galpón y fecha.
   * @param producto_codigo El código del producto (tipo de huevo).
   * @param cantidad La cantidad de huevos.
   * @returns Una promesa que resuelve con los datos insertados o un error.
   */
  async addClasificacionEntry(
    galpon_id: number,
    fecha: string,
    numero_secuencia: number,
    producto_codigo: number,
    cantidad: number
  ) {
    const { data, error } = await supabase
      .from('produccion')
      .insert([
        {
          galpon_id,
          fecha,
          numero_secuencia,
          producto_codigo,
          cantidad,
        },
      ])
      .select();

    if (error) {
      console.error('Error al registrar entrada de clasificación:', error);
      throw error;
    }
    return data;
  },

  /**
   * Obtiene el siguiente número de secuencia disponible para un galpón y fecha dados.
   * @param galpon_id El ID del galpón.
   * @param fecha La fecha (YYYY-MM-DD).
   * @returns El siguiente número de secuencia o 1 si no hay registros existentes.
   */
  async getNextNumeroSecuencia(galpon_id: number, fecha: string): Promise<number> {
    const { data, error } = await supabase
      .from('produccion')
      .select('numero_secuencia')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha)
      .order('numero_secuencia', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener el siguiente número de secuencia:', error);
      throw error;
    }

    if (data && data.length > 0) {
      return (data[0].numero_secuencia as number) + 1;
    }
    return 1; // Si no hay registros, empieza con 1
  },
};

export default ProduccionService;
