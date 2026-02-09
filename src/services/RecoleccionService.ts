import { supabase } from './supabaseClient';

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
    const { data, error } = await supabase
      .from('recoleccion_huevos')
      .insert([
        {
          galpon_id,
          fecha,
          numero_secuencia,
          cantidad_huevos,
        },
      ])
      .select(); // Retorna los datos insertados

    if (error) {
      console.error('Error al registrar recolección de huevos:', error);
      throw error;
    }
    return data;
  },

  // No se implementan métodos de actualización o eliminación para enforcing inmutabilidad.
};

export default RecoleccionService;
