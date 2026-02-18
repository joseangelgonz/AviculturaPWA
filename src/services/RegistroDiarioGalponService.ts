import { supabase } from './supabaseClient';

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
      console.error('Error upserting daily record:', error);
      throw error;
    }
    return result;
  },

  async getCausasMortalidad(): Promise<CausaMortalidad[]> {
    const { data, error } = await supabase
      .from('causas_mortalidad')
      .select('*');

    if (error) {
      console.error('Error fetching mortality causes:', error);
      throw error;
    }
    return data as CausaMortalidad[];
  },
};

export default RegistroDiarioGalponService;
