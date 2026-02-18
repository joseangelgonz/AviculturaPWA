import { supabase } from './supabaseClient';

const ProduccionService = {
  /**
   * Inserta múltiples registros de clasificación en una sola operación atómica.
   * Calcula los números de secuencia a partir del siguiente disponible.
   */
  async addClasificacionBatch(
    galpon_id: number,
    fecha: string,
    entries: { producto_codigo: number; cantidad: number }[]
  ) {
    const startSecuencia = await this.getNextNumeroSecuencia(galpon_id, fecha);

    const rows = entries.map((entry, index) => ({
      galpon_id,
      fecha,
      numero_secuencia: startSecuencia + index,
      producto_codigo: entry.producto_codigo,
      cantidad: entry.cantidad,
    }));

    const { data, error } = await supabase
      .from('produccion')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error al registrar clasificación en lote:', error);
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

  /**
   * Verifica si ya existen registros de clasificación para un galpón y fecha dados.
   * @param galpon_id El ID del galpón.
   * @param fecha La fecha (YYYY-MM-DD).
   * @returns Una promesa que resuelve con `true` si existen registros, `false` en caso contrario.
   */
  async checkDailyClasificacionExists(galpon_id: number, fecha: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('produccion')
      .select('*', { count: 'exact' }) // Select count of id column
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha);

    if (error) {
      console.error('Error al verificar clasificaciones diarias existentes:', error);
      throw error;
    }

    return (count || 0) > 0;
  },

  /**
   * Obtiene la fecha del último registro de producción para un galpón dado.
   * @param galpon_id El ID del galpón.
   * @returns Una promesa que resuelve con la fecha del último registro (YYYY-MM-DD) o null si no hay registros.
   */
  async getLastProduccionDate(galpon_id: number): Promise<string | null> {
    const { data, error } = await supabase
      .from('produccion')
      .select('fecha')
      .eq('galpon_id', galpon_id)
      .order('fecha', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener la fecha del último registro de producción:', error);
      throw error;
    }

    if (data && data.length > 0) {
      return data[0].fecha as string;
    }
    return null;
  },
};

export default ProduccionService;
