import { supabase } from './supabaseClient';
import type { Finca } from '../models/Finca';

const FincaService = {
  async getAllFincas(): Promise<Finca[]> {
    const { data, error } = await supabase
      .from('fincas')
      .select('*');

    if (error) throw error;

    return (data || []) as Finca[];
  },
};

export default FincaService;
