import { supabase } from './supabaseClient';
import type { Alimento } from '../models/Alimento';

const AlimentoService = {
  async getAllAlimentos(): Promise<Alimento[]> {
    const { data, error } = await supabase
      .from('alimentos')
      .select('codigo, descripcion, fabricante_alimento_id, categoria, activo, fabricantes_alimento(nombre)')
      .eq('activo', true)
      .order('descripcion', { ascending: true });

    if (error) {
      console.error('Error al obtener alimentos:', error);
      throw new Error('No se pudieron obtener los alimentos.');
    }

    return (data ?? []).map((row) => ({
      codigo: row.codigo,
      descripcion: row.descripcion,
      fabricante_alimento_id: row.fabricante_alimento_id,
      fabricante_nombre: (row.fabricantes_alimento as { nombre: string } | null)?.nombre ?? 'Sin fabricante',
      categoria: row.categoria,
      activo: row.activo,
    }));
  },
};

export default AlimentoService;
