import { supabase } from './supabaseClient';
import type { RazaAve } from '../models/RazaAve';

const RazaAveService = {
  async getAll(): Promise<RazaAve[]> {
    const { data, error } = await supabase
      .from('razas_ave')
      .select('*')
      .order('descripcion', { ascending: true });

    if (error) throw error;

    return data as RazaAve[];
  },
};

export default RazaAveService;
