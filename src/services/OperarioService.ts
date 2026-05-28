import { supabase } from './supabaseClient';
import { getSupabaseErrorMessage, logServiceError } from './supabaseErrors';

export interface OperarioProfile {
  id: string;
  email: string | null;
  role: string;
}

export interface GalponAssignmentOwner {
  galpon_id: number;
  operario_id: string;
  operario_email: string | null;
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

  async getAllGalponAssignments(): Promise<GalponAssignmentOwner[]> {
    const { data, error } = await supabase
      .from('operario_galpones')
      .select('galpon_id, operario_id, profiles(email)');

    if (error) {
      logServiceError('Error al obtener asignaciones globales:', error);
      throw new Error(getSupabaseErrorMessage(error, 'No se pudieron cargar las asignaciones.'));
    }

    return (data || []).map((row) => ({
      galpon_id: row.galpon_id as number,
      operario_id: row.operario_id as string,
      operario_email: (row.profiles as { email: string | null } | null)?.email ?? null,
    }));
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
      const { data: conflicts, error: conflictError } = await supabase
        .from('operario_galpones')
        .select('galpon_id, operario_id, profiles(email)')
        .in('galpon_id', toAdd)
        .neq('operario_id', operarioId);

      if (conflictError) {
        logServiceError('Error al validar conflictos de asignacion:', conflictError);
        throw new Error(getSupabaseErrorMessage(conflictError, 'No se pudieron validar las asignaciones.'));
      }

      if (conflicts && conflicts.length > 0) {
        const labels = conflicts.map((row) => {
          const email = (row.profiles as { email: string | null } | null)?.email;
          return `galpón ${row.galpon_id}${email ? ` (${email})` : ''}`;
        });
        throw new Error(
          `No se puede asignar: ${labels.join(', ')} ya está asignado a otro operario. Quítalo primero en su perfil.`,
        );
      }

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
