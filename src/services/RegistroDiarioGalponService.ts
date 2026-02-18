import { supabase } from './supabaseClient';
import { logServiceError } from './supabaseErrors';

interface CausaMortalidad {
  codigo: string;
  descripcion: string;
}

const RegistroDiarioGalponService = {
  async upsertRegistroDiario(
    galpon_id: number,
    fecha: string,
    data: {
      producto_alimento_codigo?: number;
      cantidad_alimento_bultos?: number;
      numero_aves_muertas?: number;
      causa_mortalidad_codigo?: string;
    }
  ) {
    const { data: result, error } = await supabase
      .from('registro_diario_galpon')
      .upsert(
        { galpon_id, fecha, ...data },
        { onConflict: 'galpon_id,fecha' }
      )
      .select();

    if (error) {
      logServiceError('Error upserting daily record:', error);
      throw error;
    }
    return result;
  },

  async getRegistroDiario(galpon_id: number, fecha: string) {
    const { data, error } = await supabase
      .from('registro_diario_galpon')
      .select('*')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha)
      .maybeSingle();

    if (error) {
      logServiceError('Error al obtener registro diario:', error);
      throw error;
    }
    return data;
  },

  async getCausasMortalidad(): Promise<CausaMortalidad[]> {
    const { data, error } = await supabase
      .from('causas_mortalidad')
      .select('*');

    if (error) {
      logServiceError('Error fetching mortality causes:', error);
      throw error;
    }
    return data as CausaMortalidad[];
  },
};

export default RegistroDiarioGalponService;
