import { supabase } from './supabaseClient';
import { getSupabaseErrorMessage, logServiceError } from './supabaseErrors';

export interface OperarioProfile {
  id: string;
  email: string | null;
  role: string;
}

const OperarioService = {
  async getOperarios(): Promise<OperarioProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'operario')
      .order('email', { ascending: true, nullsFirst: false });

    if (error) {
      logServiceError('Error al obtener operarios:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudieron cargar los operarios.'));
    }

    return (data || []) as OperarioProfile[];
  },

  async getOperarioAssignments(operarioId: string) {
    const { data, error } = await supabase
      .from('operario_galpones')
      .select('galpon_id, galpones(finca_id)')
      .eq('operario_id', operarioId);

    if (error) {
      logServiceError('Error al obtener asignaciones de operario:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudieron cargar las asignaciones.'));
    }

    return (data || []) as Array<{ galpon_id: number; galpones: { finca_id: number } | null }>;
  },

  async setAssignmentsForFinca(operarioId: string, fincaId: number, galponIds: number[]): Promise<void> {
    const { data, error } = await supabase
      .from('operario_galpones')
      .select('galpon_id, galpones(finca_id)')
      .eq('operario_id', operarioId);

    if (error) {
      logServiceError('Error al consultar asignaciones actuales:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudieron validar las asignaciones.'));
    }

    const existingIds = (data || [])
      .filter((row) => row.galpones?.finca_id === fincaId)
      .map((row) => row.galpon_id);

    const desiredSet = new Set(galponIds);
    const existingSet = new Set(existingIds);
    const toAdd = galponIds.filter((id) => !existingSet.has(id));
    const toRemove = existingIds.filter((id) => !desiredSet.has(id));

    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('operario_galpones')
        .delete()
        .eq('operario_id', operarioId)
        .in('galpon_id', toRemove);

      if (deleteError) {
        logServiceError('Error al eliminar asignaciones:', deleteError);
        throw new Error(getSupabaseErrorMessage(deleteError, 'No se pudieron eliminar asignaciones.'));
      }
    }

    if (toAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('operario_galpones')
        .insert(toAdd.map((galpon_id) => ({ operario_id: operarioId, galpon_id })));

      if (insertError) {
        logServiceError('Error al crear asignaciones:', insertError);
        throw new Error(getSupabaseErrorMessage(insertError, 'No se pudieron crear asignaciones.'));
      }
    }
  },
};

export default OperarioService;
