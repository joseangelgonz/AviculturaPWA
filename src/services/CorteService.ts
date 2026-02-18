import { supabase } from './supabaseClient';
import type { Corte, CorteGalpon } from '../models/Corte';

interface CreateCortePayload {
  fecha_inicio: string;
  tipo_ave: string;
  notas: string;
  numero_aves_total: number;
  galpones: { galpon_id: number; aves_iniciales: number }[];
}

const CorteService = {
  async getAllCortes(): Promise<Corte[]> {
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .order('fecha_inicio', { ascending: false });

    if (error) throw error;

    return (data || []) as Corte[];
  },

  async getCorteGalpones(corteIds: number[]): Promise<CorteGalpon[]> {
    if (corteIds.length === 0) return [];

    const { data, error } = await supabase
      .from('corte_galpones')
      .select('*')
      .in('corte_id', corteIds);

    if (error) throw error;

    return data || [];
  },

  async createCorte(payload: CreateCortePayload): Promise<{ corte_id: number }> {
    const { data, error } = await supabase.rpc('crear_corte_con_galpones', {
      p_fecha_inicio: payload.fecha_inicio,
      p_tipo_ave: payload.tipo_ave,
      p_notas: payload.notas,
      p_numero_aves_total: payload.numero_aves_total,
      p_galpones: payload.galpones,
    });

    if (error) throw error;

    return data as { corte_id: number };
  },

  async finalizarCorte(corteId: number, fechaFinal: string): Promise<void> {
    const { error } = await supabase
      .from('cortes')
      .update({ estado: 'finalizado', fecha_final: fechaFinal })
      .eq('id', corteId);

    if (error) throw error;
  },
};

export default CorteService;
