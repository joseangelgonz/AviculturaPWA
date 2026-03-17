import { supabase } from './supabaseClient';
import { getSupabaseErrorMessage, logServiceError } from './supabaseErrors';
import type { Galpon } from '../models/Galpon';

interface CreateGalponPayload {
  finca_id: number;
  nombre: string;
  capacidad: number;
}

interface UpdateGalponPayload {
  finca_id: number;
  nombre: string;
  capacidad: number;
}

const GalponService = {
  /**
   * Obtiene la lista de galpones asignados a un operario específico.
   * @param operarioId El ID UUID del operario.
   * @returns Una promesa que resuelve con un array de objetos Galpon.
   */
  async getAssignedGalpones(operarioId: string): Promise<Galpon[]> {
    const { data, error } = await supabase
      .from('operario_galpones')
      .select('galpones(*, fincas(id, nombre, ubicacion))') // Incluye datos de la finca
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
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      logServiceError('Error fetching all galpones:', error);
      throw error;
    }

    return data || [];
  },

  async createGalpon(payload: CreateGalponPayload): Promise<Galpon> {
    const { data, error } = await supabase
      .from('galpones')
      .insert({
        finca_id: payload.finca_id,
        nombre: payload.nombre.trim(),
        capacidad: payload.capacidad,
      })
      .select('*')
      .single();

    if (error) {
      logServiceError('Error creating galpon:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudo crear el galpon.'));
    }

    return data as Galpon;
  },

  async updateGalpon(galponId: number, payload: UpdateGalponPayload): Promise<Galpon> {
    const { data, error } = await supabase
      .from('galpones')
      .update({
        finca_id: payload.finca_id,
        nombre: payload.nombre.trim(),
        capacidad: payload.capacidad,
      })
      .eq('id', galponId)
      .select('*')
      .single();

    if (error) {
      logServiceError('Error updating galpon:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudo actualizar el galpon.'));
    }

    return data as Galpon;
  },

  async deleteGalpon(galponId: number): Promise<void> {
    const { error } = await supabase
      .from('galpones')
      .delete()
      .eq('id', galponId);

    if (error) {
      logServiceError('Error deleting galpon:', error);
      if ((error as { code?: string }).code === '23503') {
        throw new Error('No se puede eliminar el galpon porque tiene historial o relaciones asociadas.');
      }
      throw new Error(getSupabaseErrorMessage(error, 'No se pudo eliminar el galpon.'));
    }
  },
};

export default GalponService;
