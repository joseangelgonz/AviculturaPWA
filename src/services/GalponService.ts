import { supabase } from './supabaseClient';
import { logServiceError } from './supabaseErrors';
import type { Galpon } from '../models/Galpon';

const GalponService = {
  /**
   * Obtiene la lista de galpones asignados a un operario específico.
   * @param operarioId El ID UUID del operario.
   * @returns Una promesa que resuelve con un array de objetos Galpon.
   */
  async getAssignedGalpones(operarioId: string): Promise<Galpon[]> {
    const { data, error } = await supabase
      .from('operario_galpones')
      .select('galpones(*)') // Selecciona todas las columnas de la tabla 'galpones'
      .eq('operario_id', operarioId);

    if (error) {
      logServiceError('Error fetching assigned galpones:', error);
      throw error;
    }

    // Supabase returns an array of objects like { galpones: { id: ..., nombre: ... } }
    // We want an array of Galpon directly.
    return data ? data.map((item: { galpones: Galpon }) => item.galpones) : [];
  },

  /**
   * Obtiene todos los galpones.
   * @returns Una promesa que resuelve con un array de objetos Galpon.
   */
  async getAllGalpones(): Promise<Galpon[]> {
    const { data, error } = await supabase
      .from('galpones')
      .select('*');

    if (error) {
      logServiceError('Error fetching all galpones:', error);
      throw error;
    }

    return data || [];
  },
};

export default GalponService;
