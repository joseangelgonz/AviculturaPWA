import { supabase } from './supabaseClient';

interface CausaMortalidad {
  codigo: string;
  descripcion: string;
}

const RegistroDiarioGalponService = {
  /**
   * Inserta o actualiza un registro diario de galpón.
   * Si ya existe un registro para el galpón y la fecha, lo actualiza.
   * Si no, inserta uno nuevo.
   *
   * @param galpon_id El ID del galpón.
   * @param fecha La fecha del registro (YYYY-MM-DD).
   * @param data Los datos a insertar/actualizar (cantidad_alimento_bultos, producto_alimento_codigo, numero_aves_muertas, causa_mortalidad_codigo).
   * @returns Una promesa que resuelve con los datos insertados/actualizados o un error.
   */
  async upsertRegistroDiario(
    galpon_id: number,
    fecha: string, // YYYY-MM-DD
    data: {
      producto_alimento_codigo?: number;
      cantidad_alimento_bultos?: number;
      numero_aves_muertas?: number;
      causa_mortalidad_codigo?: string;
    }
  ) {
    // Primero, intentar obtener el registro existente
    const { data: existingRecord, error: fetchError } = await supabase
      .from('registro_diario_galpon')
      .select('*')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error('Error fetching existing daily record:', fetchError);
      throw fetchError;
    }

    let result;
    if (existingRecord) {
      // Si existe, actualizar
      result = await supabase
        .from('registro_diario_galpon')
        .update(data)
        .eq('galpon_id', galpon_id)
        .eq('fecha', fecha)
        .select();
    } else {
      // Si no existe, insertar
      result = await supabase
        .from('registro_diario_galpon')
        .insert([{ galpon_id, fecha, ...data }])
        .select();
    }

    if (result.error) {
      console.error('Error upserting daily record:', result.error);
      throw result.error;
    }
    return result.data;
  },

  /**
   * Obtiene todas las causas de mortalidad.
   * @returns Una promesa que resuelve con un array de objetos CausaMortalidad.
   */
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
