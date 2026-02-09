import { useState, useEffect } from 'react';
import DashboardService from '../services/DashboardService';
import type { DashboardData } from '../services/DashboardService';

export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Obtiene los datos del panel de control al montar el componente.
 * Devuelve el estado de carga, los datos y cualquier error.
 */
export function useDashboardData(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    DashboardService.fetchDashboardData()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: err instanceof Error ? err : new Error(String(err)) });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
