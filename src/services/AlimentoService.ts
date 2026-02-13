import { supabase } from './supabaseClient';
import type { Alimento } from '../models/Alimento';

interface FabricanteAlimentoRow {
  id: number;
  nombre: string;
}

interface AlimentoRow {
  codigo: number;
  descripcion: string;
  fabricante_alimento_id: number;
  activo: boolean;
}

const AlimentoService = {
  async getAllAlimentos(): Promise<Alimento[]> {
    const [alimentosResult, fabricantesResult] = await Promise.all([
      supabase
        .from('alimentos')
        .select('codigo, descripcion, fabricante_alimento_id, activo')
        .eq('activo', true)
        .order('descripcion', { ascending: true }),
      supabase
        .from('fabricantes_alimento')
        .select('id, nombre')
        .order('nombre', { ascending: true }),
    ]);

    if (alimentosResult.error) {
      console.error('Error al obtener alimentos:', alimentosResult.error);
      throw new Error('No se pudieron obtener los alimentos.');
    }

    if (fabricantesResult.error) {
      console.error('Error al obtener fabricantes de alimento:', fabricantesResult.error);
      throw new Error('No se pudieron obtener los fabricantes de alimento.');
    }

    const fabricantesPorId = new Map<number, string>(
      (fabricantesResult.data as FabricanteAlimentoRow[]).map((fabricante) => [fabricante.id, fabricante.nombre])
    );

    return (alimentosResult.data as AlimentoRow[]).map((alimento) => ({
      codigo: alimento.codigo,
      descripcion: alimento.descripcion,
      fabricanteAlimentoId: alimento.fabricante_alimento_id,
      fabricanteNombre: fabricantesPorId.get(alimento.fabricante_alimento_id) ?? 'Sin fabricante',
      activo: alimento.activo,
    }));
  },
};

export default AlimentoService;

