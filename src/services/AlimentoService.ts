import { supabase } from './supabaseClient';
import { logServiceError } from './supabaseErrors';
import type { Alimento } from '../models/Alimento';

export interface FabricanteAlimento {
  id: number;
  nombre: string;
  created_at: string;
}

function mapAlimentoRow(row: {
  codigo: number;
  descripcion: string;
  fabricante_alimento_id: number;
  categoria: string | null;
  activo: boolean;
  fabricantes_alimento: { nombre: string } | null;
}): Alimento {
  return {
    codigo: row.codigo,
    descripcion: row.descripcion,
    fabricante_alimento_id: row.fabricante_alimento_id,
    fabricante_nombre: (row.fabricantes_alimento as { nombre: string } | null)?.nombre ?? 'Sin fabricante',
    categoria: row.categoria,
    activo: row.activo,
  };
}

const AlimentoService = {
  async getAllAlimentos(): Promise<Alimento[]> {
    const { data, error } = await supabase
      .from('alimentos')
      .select('codigo, descripcion, fabricante_alimento_id, categoria, activo, fabricantes_alimento(nombre)')
      .eq('activo', true)
      .order('descripcion', { ascending: true });

    if (error) {
      logServiceError('Error al obtener alimentos:', error);
      throw new Error('No se pudieron obtener los alimentos.');
    }

    return (data ?? []).map(mapAlimentoRow);
  },

  async getAllAlimentosIncludingInactive(): Promise<Alimento[]> {
    const { data, error } = await supabase
      .from('alimentos')
      .select('codigo, descripcion, fabricante_alimento_id, categoria, activo, fabricantes_alimento(nombre)')
      .order('descripcion', { ascending: true });

    if (error) {
      logServiceError('Error al obtener todos los alimentos:', error);
      throw new Error('No se pudieron obtener los alimentos.');
    }

    return (data ?? []).map(mapAlimentoRow);
  },

  async createAlimento(alimento: {
    descripcion: string;
    fabricante_alimento_id: number;
    categoria?: string;
  }): Promise<Alimento> {
    const { data, error } = await supabase
      .from('alimentos')
      .insert({ ...alimento, activo: true })
      .select('codigo, descripcion, fabricante_alimento_id, categoria, activo, fabricantes_alimento(nombre)')
      .single();

    if (error) {
      logServiceError('Error al crear alimento:', error);
      throw error;
    }

    return mapAlimentoRow(data);
  },

  async updateAlimento(
    codigo: number,
    updates: { descripcion?: string; fabricante_alimento_id?: number; categoria?: string; activo?: boolean }
  ): Promise<Alimento> {
    const { data, error } = await supabase
      .from('alimentos')
      .update(updates)
      .eq('codigo', codigo)
      .select('codigo, descripcion, fabricante_alimento_id, categoria, activo, fabricantes_alimento(nombre)')
      .single();

    if (error) {
      logServiceError('Error al actualizar alimento:', error);
      throw error;
    }

    return mapAlimentoRow(data);
  },

  async getAllFabricantes(): Promise<FabricanteAlimento[]> {
    const { data, error } = await supabase
      .from('fabricantes_alimento')
      .select('id, nombre, created_at')
      .order('nombre', { ascending: true });

    if (error) {
      logServiceError('Error al obtener fabricantes:', error);
      throw new Error('No se pudieron obtener los fabricantes.');
    }

    return data ?? [];
  },

  async createFabricante(nombre: string): Promise<FabricanteAlimento> {
    const { data, error } = await supabase
      .from('fabricantes_alimento')
      .insert({ nombre })
      .select('id, nombre, created_at')
      .single();

    if (error) {
      logServiceError('Error al crear fabricante:', error);
      throw error;
    }

    return data;
  },
};

export default AlimentoService;
