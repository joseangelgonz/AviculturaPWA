import { supabase } from './supabaseClient';
import { getSupabaseErrorMessage, logServiceError } from './supabaseErrors';
import type { Finca } from '../models/Finca';

interface CreateFincaPayload {
  nombre: string;
  ubicacion?: string | null;
}

interface UpdateFincaPayload {
  nombre: string;
  ubicacion?: string | null;
}

const FincaService = {
  async getAllFincas(): Promise<Finca[]> {
    const { data, error } = await supabase
      .from('fincas')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      logServiceError('Error fetching fincas:', error);
      throw error;
    }

    return (data || []) as Finca[];
  },

  async createFinca(payload: CreateFincaPayload): Promise<Finca> {
    const { data, error } = await supabase
      .from('fincas')
      .insert({
        nombre: payload.nombre.trim(),
        ubicacion: payload.ubicacion?.trim() || null,
      })
      .select('*')
      .single();

    if (error) {
      logServiceError('Error creating finca:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudo crear la finca.'));
    }

    return data as Finca;
  },

  async updateFinca(fincaId: number, payload: UpdateFincaPayload): Promise<Finca> {
    const { data, error } = await supabase
      .from('fincas')
      .update({
        nombre: payload.nombre.trim(),
        ubicacion: payload.ubicacion?.trim() || null,
      })
      .eq('id', fincaId)
      .select('*')
      .single();

    if (error) {
      logServiceError('Error updating finca:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudo actualizar la finca.'));
    }

    return data as Finca;
  },

  async deleteFinca(fincaId: number): Promise<void> {
    const { error } = await supabase
      .from('fincas')
      .delete()
      .eq('id', fincaId);

    if (error) {
      logServiceError('Error deleting finca:', error);
      const maybeForeignKeyError = (error as { code?: string }).code === '23503';
      if (maybeForeignKeyError) {
        throw new Error('No se puede eliminar la finca porque tiene galpones asociados.');
      }
      throw new Error(getSupabaseErrorMessage(error, 'No se pudo eliminar la finca.'));
    }
  },
};

export default FincaService;
