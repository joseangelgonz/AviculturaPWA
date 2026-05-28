import { supabase } from './supabaseClient';
import { logServiceError } from './supabaseErrors';

interface CausaMortalidad {
  codigo: string;
  descripcion: string;
}

interface UpsertRegistroData {
  producto_alimento_codigo?: number;
  cantidad_alimento_bultos?: number;
  numero_aves_muertas?: number;
  causa_mortalidad_codigo?: string;
}

const RegistroDiarioGalponService = {
  async upsertRegistroDiario(
    galpon_id: number,
    fecha: string,
    data: UpsertRegistroData
  ) {
    const hasFeedData = data.producto_alimento_codigo !== undefined || data.cantidad_alimento_bultos !== undefined;
    const hasMortalityData = data.numero_aves_muertas !== undefined || data.causa_mortalidad_codigo !== undefined;

    if (!hasFeedData && !hasMortalityData) {
      return [];
    }

    const resultRows: unknown[] = [];

    if (hasFeedData) {
      if (data.producto_alimento_codigo === undefined || data.cantidad_alimento_bultos === undefined) {
        throw new Error('Faltan datos de alimentación para registrar el día.');
      }

      const { error: feedError } = await supabase
        .from('registro_alimentacion_galpon')
        .upsert(
          {
            galpon_id,
            fecha,
            producto_alimento_codigo: data.producto_alimento_codigo,
            cantidad_alimento_bultos: data.cantidad_alimento_bultos,
          },
          { onConflict: 'galpon_id,fecha' }
        );

      if (feedError) {
        logServiceError('Error upserting feed daily record:', feedError);
        throw feedError;
      }
    }

    if (hasMortalityData) {
      if (data.numero_aves_muertas === undefined || data.causa_mortalidad_codigo === undefined) {
        throw new Error('Faltan datos de mortalidad para registrar el día.');
      }

      const { data: lastRows, error: lastError } = await supabase
        .from('registro_mortalidad')
        .select('numero_secuencia')
        .eq('galpon_id', galpon_id)
        .eq('fecha', fecha)
        .order('numero_secuencia', { ascending: false })
        .limit(1);

      if (lastError) {
        logServiceError('Error al consultar siguiente secuencia de mortalidad:', lastError);
        throw lastError;
      }

      const nextNumeroSecuencia = (lastRows?.[0]?.numero_secuencia ?? 0) + 1;

      const { error: mortalityError } = await supabase
        .from('registro_mortalidad')
        .insert([
          {
            galpon_id,
            fecha,
            numero_secuencia: nextNumeroSecuencia,
            causa_mortalidad_codigo: data.causa_mortalidad_codigo,
            cantidad_aves_muertas: data.numero_aves_muertas,
          },
        ]);

      if (mortalityError) {
        logServiceError('Error al insertar mortalidad diaria:', mortalityError);
        throw mortalityError;
      }
    }

    return resultRows;
  },

  async getRegistroDiario(galpon_id: number, fecha: string) {
    const { data: feedData, error: feedError } = await supabase
      .from('registro_alimentacion_galpon')
      .select('*')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha)
      .maybeSingle();

    if (feedError) {
      logServiceError('Error al obtener registro de alimentación diario:', feedError);
      throw feedError;
    }

    const { data: mortalityRows, error: mortalityError } = await supabase
      .from('registro_mortalidad')
      .select('cantidad_aves_muertas')
      .eq('galpon_id', galpon_id)
      .eq('fecha', fecha);

    if (mortalityError) {
      logServiceError('Error al obtener mortalidad diaria:', mortalityError);
      throw mortalityError;
    }

    const totalAvesMuertas = (mortalityRows ?? []).reduce(
      (sum, row) => sum + (row.cantidad_aves_muertas ?? 0),
      0
    );

    return {
      galpon_id,
      fecha,
      ...(feedData ?? {}),
      numero_aves_muertas: totalAvesMuertas,
    };
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
