import { supabase } from './supabaseClient';
import { logServiceError } from './supabaseErrors';

const RecoleccionService = {
  /**
   * Registra una nueva recolección de huevos.
   * @param galpon_id El ID del galpón donde se realizó la recolección.
   * @param fecha La fecha de la recolección (formato YYYY-MM-DD).
   * @param numero_secuencia El momento del día de la recolección (ej. 1, 2, 3).
   * @param cantidad_huevos La cantidad de huevos recolectados.
   * @returns Una promesa que resuelve con los datos insertados o un error.
   */
  async addRecoleccion(
    galpon_id: number,
    fecha: string, // YYYY-MM-DD
    numero_secuencia: number,
    cantidad_huevos: number
  ) {
    const { error } = await supabase
      .from('recoleccion_huevos')
      .insert([
        {
          galpon_id,
          fecha,
          numero_secuencia,
          cantidad_huevos,
        },
      ]);

    if (error) {
      logServiceError('Error al registrar recolección de huevos:', error);
      throw error;
    }
  },

  /**
   * Obtiene el siguiente número de secuencia disponible para una recolección
   * en un galpón y fecha dados.
   * @param galpon_id El ID del galpón.
   * @param fecha La fecha (YYYY-MM-DD).
   * @returns El siguiente número de secuencia o 1 si no hay registros existentes para ese día.
   */
  async getRecoleccionesPorFecha(galpon_id: number, fecha: string) {
    const { data, error } = await supabase
      .from('recoleccion_huevos')
      .select('galpon_id, fecha, numero_secuencia, cantidad_huevos')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha)
      .order('numero_secuencia', { ascending: true });

    if (error) {
      logServiceError('Error al obtener recolecciones por fecha:', error);
      throw error;
    }
    return data ?? [];
  },

  async getNextNumeroSecuencia(galpon_id: number, fecha: string): Promise<number> {
    const { data, error } = await supabase
      .from('recoleccion_huevos')
      .select('numero_secuencia')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha)
      .order('numero_secuencia', { ascending: false })
      .limit(1);

    if (error) {
      logServiceError('Error al obtener el siguiente número de secuencia de recolección:', error);
      throw error;
    }

    if (data && data.length > 0) {
      return (data[0].numero_secuencia as number) + 1;
    }
    return 1; // Si no hay registros, empieza con 1
  },

  /**
   * Obtiene la cantidad total de huevos recolectados para un galpón y fecha dados.
   * @param galpon_id El ID del galpón.
   * @param fecha La fecha (YYYY-MM-DD).
   * @returns Una promesa que resuelve con la cantidad total de huevos o 0 si no hay registros.
   */
  async getTotalHuevosRecoletados(galpon_id: number, fecha: string): Promise<number> {
    const { data, error } = await supabase
      .from('recoleccion_huevos')
      .select('cantidad_huevos')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha);

    if (error) {
      logServiceError('Error al obtener el total de huevos recolectados:', error);
      throw error;
    }

    if (data) {
      const total = data.reduce((sum, entry) => sum + (entry.cantidad_huevos || 0), 0);
      return total;
    }
    return 0; // Si no hay registros, el total es 0
  },
};

export default RecoleccionService;
