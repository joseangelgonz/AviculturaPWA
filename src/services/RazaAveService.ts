import { supabase } from './supabaseClient';
import { RazaAve } from '../models/RazaAve'; // Crearemos este modelo a continuación

export const RazaAveService = {
  async getAll(): Promise<RazaAve[]> {
    const { data, error } = await supabase
      .from('razas_ave')
      .select('*')
      .order('descripcion', { ascending: true });

    if (error) {
      console.error('Error fetching razas de ave:', error);
      throw new Error(error.message);
    }

    return data as RazaAve[];
  },
};
