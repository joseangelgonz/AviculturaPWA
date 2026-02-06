import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// --- Tipos ---
export interface KpiSummary {
  readonly todayProduction: number | null;
  readonly productionRate: number | null;
  readonly weeklyMortality: number | null;
  readonly fcr: number | null;
}

export interface DailyProductionPoint {
  readonly fecha: string;
  readonly total: number;
}

export interface EggClassificationBreakdown {
  readonly classification: string;
  readonly count: number;
}

export interface DashboardAlert {
  readonly id: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
}

interface HookState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Pesos promedio por clasificación de huevo (kg)
const EGG_WEIGHT_KG: Record<string, number> = {
  huevos_y: 0.073,
  huevos_aaa: 0.067,
  huevos_aa: 0.062,
  huevos_a: 0.056,
  huevos_b: 0.049,
  huevos_c: 0.042,
  huevos_blancos: 0.060,
};

const EGG_COLUMNS = ['huevos_y', 'huevos_aaa', 'huevos_aa', 'huevos_a', 'huevos_b', 'huevos_c', 'huevos_blancos'] as const;

// --- Utilidades de fecha ---
function getTodayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sumEggs(row: Record<string, number | null>): number {
  return EGG_COLUMNS.reduce((sum, col) => sum + (row[col] ?? 0), 0);
}

function weightedEggMass(row: Record<string, number | null>): number {
  return EGG_COLUMNS.reduce((sum, col) => sum + (row[col] ?? 0) * EGG_WEIGHT_KG[col], 0);
}

// --- Servicio ---
const DashboardService = {
  async fetchKpis(): Promise<KpiSummary> {
    const { start, end } = getTodayRange();
    const sevenDaysAgo = getDaysAgoISO(7);

    // Obtener cortes activos
    const { data: cortes, error: cortesError } = await supabase
      .from('cortes')
      .select('id, numero_aves')
      .eq('estado', 'activo');

    if (cortesError || !cortes || cortes.length === 0) {
      return { todayProduction: null, productionRate: null, weeklyMortality: null, fcr: null };
    }

    const corteIds = cortes.map((c) => c.id);
    const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves, 0);

    // Producción de hoy
    const { data: todayData } = await supabase
      .from('produccion')
      .select('huevos_y, huevos_aaa, huevos_aa, huevos_a, huevos_b, huevos_c, huevos_blancos')
      .in('corte_id', corteIds)
      .gte('fecha', start)
      .lt('fecha', end);

    const todayProduction = todayData && todayData.length > 0
      ? todayData.reduce((sum, row) => sum + sumEggs(row), 0)
      : null;

    const productionRate = todayProduction !== null && totalAves > 0
      ? Math.round((todayProduction / totalAves) * 1000) / 10
      : null;

    // Mortalidad semanal
    const { data: weekData } = await supabase
      .from('produccion')
      .select('muertes')
      .in('corte_id', corteIds)
      .gte('fecha', sevenDaysAgo);

    const weeklyMortality = weekData && weekData.length > 0
      ? weekData.reduce((sum, row) => sum + (row.muertes ?? 0), 0)
      : null;

    // FCR (últimos 7 días)
    const { data: fcrData } = await supabase
      .from('produccion')
      .select('huevos_y, huevos_aaa, huevos_aa, huevos_a, huevos_b, huevos_c, huevos_blancos, alimento')
      .in('corte_id', corteIds)
      .gte('fecha', sevenDaysAgo);

    let fcr: number | null = null;
    if (fcrData && fcrData.length > 0) {
      const totalAlimento = fcrData.reduce((sum, row) => sum + (row.alimento ?? 0), 0);
      const totalEggMass = fcrData.reduce((sum, row) => sum + weightedEggMass(row), 0);
      fcr = totalEggMass > 0 ? Math.round((totalAlimento / totalEggMass) * 100) / 100 : null;
    }

    return { todayProduction, productionRate, weeklyMortality, fcr };
  },

  async fetchProductionChart(): Promise<DailyProductionPoint[]> {
    const thirtyDaysAgo = getDaysAgoISO(30);

    const { data: cortes } = await supabase
      .from('cortes')
      .select('id')
      .eq('estado', 'activo');

    if (!cortes || cortes.length === 0) return [];

    const corteIds = cortes.map((c) => c.id);

    const { data } = await supabase
      .from('produccion')
      .select('fecha, huevos_y, huevos_aaa, huevos_aa, huevos_a, huevos_b, huevos_c, huevos_blancos')
      .in('corte_id', corteIds)
      .gte('fecha', thirtyDaysAgo)
      .order('fecha', { ascending: true });

    if (!data || data.length === 0) return [];

    // Agrupar por fecha
    const byDate = new Map<string, number>();
    for (const row of data) {
      const date = new Date(row.fecha).toLocaleDateString('es-CO');
      byDate.set(date, (byDate.get(date) ?? 0) + sumEggs(row));
    }

    return Array.from(byDate.entries()).map(([fecha, total]) => ({ fecha, total }));
  },

  async fetchEggClassification(): Promise<EggClassificationBreakdown[]> {
    const { start, end } = getTodayRange();

    const { data: cortes } = await supabase
      .from('cortes')
      .select('id')
      .eq('estado', 'activo');

    if (!cortes || cortes.length === 0) return [];

    const corteIds = cortes.map((c) => c.id);

    const { data } = await supabase
      .from('produccion')
      .select('huevos_y, huevos_aaa, huevos_aa, huevos_a, huevos_b, huevos_c, huevos_blancos')
      .in('corte_id', corteIds)
      .gte('fecha', start)
      .lt('fecha', end);

    if (!data || data.length === 0) return [];

    const labels: Record<string, string> = {
      huevos_y: 'Y',
      huevos_aaa: 'AAA',
      huevos_aa: 'AA',
      huevos_a: 'A',
      huevos_b: 'B',
      huevos_c: 'C',
      huevos_blancos: 'Blancos',
    };

    return EGG_COLUMNS.map((col) => ({
      classification: labels[col],
      count: data.reduce((sum, row) => sum + ((row[col] as number) ?? 0), 0),
    })).filter((item) => item.count > 0);
  },

  async fetchAlerts(): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];
    const { start, end } = getTodayRange();
    const sevenDaysAgo = getDaysAgoISO(7);

    const { data: cortes } = await supabase
      .from('cortes')
      .select('id, numero_aves, galpon_id, fecha_inicio')
      .eq('estado', 'activo');

    if (!cortes || cortes.length === 0) {
      alerts.push({
        id: 'no-cortes',
        severity: 'info',
        message: 'No hay cortes activos. Crea un corte para comenzar a registrar producción.',
      });
      return alerts;
    }

    const corteIds = cortes.map((c) => c.id);

    // Verificar si hay datos hoy para cada corte
    const { data: todayData } = await supabase
      .from('produccion')
      .select('corte_id')
      .in('corte_id', corteIds)
      .gte('fecha', start)
      .lt('fecha', end);

    const cortesConDatosHoy = new Set(todayData?.map((d) => d.corte_id) ?? []);
    for (const corte of cortes) {
      if (!cortesConDatosHoy.has(corte.id)) {
        alerts.push({
          id: `sin-datos-${corte.id}`,
          severity: 'info',
          message: `Corte #${corte.id} no tiene datos de producción para hoy.`,
        });
      }
    }

    // Mortalidad alta (muertes hoy > 2x promedio diario, mínimo 7 días de datos)
    const { data: weekProd } = await supabase
      .from('produccion')
      .select('corte_id, fecha, muertes')
      .in('corte_id', corteIds)
      .gte('fecha', sevenDaysAgo);

    if (weekProd) {
      for (const corte of cortes) {
        const corteProd = weekProd.filter((p) => p.corte_id === corte.id);
        if (corteProd.length < 7) continue;

        const todayMuertes = corteProd
          .filter((p) => p.fecha >= start && p.fecha < end)
          .reduce((sum, p) => sum + (p.muertes ?? 0), 0);

        const pastProd = corteProd.filter((p) => p.fecha < start);
        if (pastProd.length === 0) continue;

        const avgMuertes = pastProd.reduce((sum, p) => sum + (p.muertes ?? 0), 0) / pastProd.length;

        if (todayMuertes > avgMuertes * 2 && avgMuertes > 0) {
          alerts.push({
            id: `mortalidad-${corte.id}`,
            severity: 'error',
            message: `Alta mortalidad en Corte #${corte.id}: ${todayMuertes} muertes hoy (promedio: ${Math.round(avgMuertes)}).`,
          });
        }
      }
    }

    // Baja producción (tasa < 80%)
    const { data: todayAllData } = await supabase
      .from('produccion')
      .select('huevos_y, huevos_aaa, huevos_aa, huevos_a, huevos_b, huevos_c, huevos_blancos')
      .in('corte_id', corteIds)
      .gte('fecha', start)
      .lt('fecha', end);

    if (todayAllData && todayAllData.length > 0) {
      const totalEggs = todayAllData.reduce((sum, row) => sum + sumEggs(row), 0);
      const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves, 0);
      const rate = totalAves > 0 ? (totalEggs / totalAves) * 100 : 0;

      if (rate < 80 && rate > 0) {
        alerts.push({
          id: 'baja-produccion',
          severity: 'warning',
          message: `Tasa de producción baja: ${rate.toFixed(1)}% (objetivo: ≥80%).`,
        });
      }
    }

    // Ordenar: error > warning > info
    const severityOrder = { error: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts;
  },
};

// --- Hooks ---
export function useDashboardKpis(): HookState<KpiSummary> {
  const [state, setState] = useState<HookState<KpiSummary>>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    DashboardService.fetchKpis()
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function useProductionChart(): HookState<DailyProductionPoint[]> {
  const [state, setState] = useState<HookState<DailyProductionPoint[]>>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    DashboardService.fetchProductionChart()
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function useEggClassification(): HookState<EggClassificationBreakdown[]> {
  const [state, setState] = useState<HookState<EggClassificationBreakdown[]>>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    DashboardService.fetchEggClassification()
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function useDashboardAlerts(): HookState<DashboardAlert[]> {
  const [state, setState] = useState<HookState<DashboardAlert[]>>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    DashboardService.fetchAlerts()
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export default DashboardService;
