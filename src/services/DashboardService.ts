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

export interface DashboardData {
  readonly kpis: KpiSummary;
  readonly chart: DailyProductionPoint[];
  readonly classification: EggClassificationBreakdown[];
  readonly alerts: DashboardAlert[];
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

const EGG_LABELS: Record<string, string> = {
  huevos_y: 'Y',
  huevos_aaa: 'AAA',
  huevos_aa: 'AA',
  huevos_a: 'A',
  huevos_b: 'B',
  huevos_c: 'C',
  huevos_blancos: 'Blancos',
};

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

function sumEggs(row: Pick<ProduccionRow, typeof EGG_COLUMNS[number]>): number {
  return EGG_COLUMNS.reduce((sum, col) => sum + (row[col] ?? 0), 0);
}

function weightedEggMass(row: Pick<ProduccionRow, typeof EGG_COLUMNS[number]>): number {
  return EGG_COLUMNS.reduce((sum, col) => sum + (row[col] ?? 0) * EGG_WEIGHT_KG[col], 0);
}

export interface ProduccionRow {
  corte_id: string;
  fecha: string;
  huevos_y: number | null;
  huevos_aaa: number | null;
  huevos_aa: number | null;
  huevos_a: number | null;
  huevos_b: number | null;
  huevos_c: number | null;
  huevos_blancos: number | null;
  alimento: number | null;
  muertes: number | null;
}

type CorteRow = { id: string; numero_aves: number; galpon_id: string | null; fecha_inicio: string };

// --- Derivar datos desde 2 consultas ---
function deriveKpis(cortes: CorteRow[], produccion: ProduccionRow[], today: { start: string; end: string }, sevenDaysAgo: string): KpiSummary {
  const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves, 0);

  const todayRows = produccion.filter((p) => p.fecha >= today.start && p.fecha < today.end);
  const todayProduction = todayRows.length > 0 ? todayRows.reduce((sum, row) => sum + sumEggs(row), 0) : null;

  const productionRate = todayProduction !== null && totalAves > 0
    ? Math.round((todayProduction / totalAves) * 1000) / 10
    : null;

  const weekRows = produccion.filter((p) => p.fecha >= sevenDaysAgo);
  const weeklyMortality = weekRows.length > 0
    ? weekRows.reduce((sum, row) => sum + (row.muertes ?? 0), 0)
    : null;

  let fcr: number | null = null;
  if (weekRows.length > 0) {
    const totalAlimento = weekRows.reduce((sum, row) => sum + ((row.alimento as number) ?? 0), 0);
    const totalEggMass = weekRows.reduce((sum, row) => sum + weightedEggMass(row), 0);
    fcr = totalEggMass > 0 ? Math.round((totalAlimento / totalEggMass) * 100) / 100 : null;
  }

  return { todayProduction, productionRate, weeklyMortality, fcr };
}

function deriveChart(produccion: ProduccionRow[]): DailyProductionPoint[] {
  if (produccion.length === 0) return [];

  const byDate = new Map<string, number>();
  for (const row of produccion) {
    const date = new Date(row.fecha).toLocaleDateString('es-CO');
    byDate.set(date, (byDate.get(date) ?? 0) + sumEggs(row));
  }

  return Array.from(byDate.entries()).map(([fecha, total]) => ({ fecha, total }));
}

function deriveClassification(produccion: ProduccionRow[], today: { start: string; end: string }): EggClassificationBreakdown[] {
  const todayRows = produccion.filter((p) => p.fecha >= today.start && p.fecha < today.end);
  if (todayRows.length === 0) return [];

  return EGG_COLUMNS.map((col) => ({
    classification: EGG_LABELS[col],
    count: todayRows.reduce((sum, row) => sum + ((row[col] as number) ?? 0), 0),
  })).filter((item) => item.count > 0);
}

function deriveAlerts(cortes: CorteRow[], produccion: ProduccionRow[], today: { start: string; end: string }, sevenDaysAgo: string): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const todayRows = produccion.filter((p) => p.fecha >= today.start && p.fecha < today.end);

  // Sin datos hoy por corte
  const cortesConDatosHoy = new Set(todayRows.map((d) => d.corte_id));
  for (const corte of cortes) {
    if (!cortesConDatosHoy.has(corte.id)) {
      alerts.push({
        id: `sin-datos-${corte.id}`,
        severity: 'info',
        message: `Corte #${corte.id} no tiene datos de producción para hoy.`,
      });
    }
  }

  // Mortalidad alta (muertes hoy > 2x promedio diario últimos 7 días)
  const weekRows = produccion.filter((p) => p.fecha >= sevenDaysAgo);
  for (const corte of cortes) {
    const corteProd = weekRows.filter((p) => p.corte_id === corte.id);
    if (corteProd.length < 7) continue;

    const todayMuertes = corteProd
      .filter((p) => p.fecha >= today.start && p.fecha < today.end)
      .reduce((sum, p) => sum + (p.muertes ?? 0), 0);

    const pastProd = corteProd.filter((p) => p.fecha < today.start);
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

  // Baja producción (tasa < 80%)
  if (todayRows.length > 0) {
    const totalEggs = todayRows.reduce((sum, row) => sum + sumEggs(row), 0);
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
}

// --- Servicio ---
const EMPTY_DASHBOARD: DashboardData = {
  kpis: { todayProduction: null, productionRate: null, weeklyMortality: null, fcr: null },
  chart: [],
  classification: [],
  alerts: [{ id: 'no-cortes', severity: 'info', message: 'No hay cortes activos. Crea un corte para comenzar a registrar producción.' }],
};

const DashboardService = {
  async fetchDashboardData(): Promise<DashboardData> {
    const today = getTodayRange();
    const sevenDaysAgo = getDaysAgoISO(7);
    const thirtyDaysAgo = getDaysAgoISO(30);

    // 1. Consultar cortes activos
    const { data: cortes, error: cortesError } = await supabase
      .from('cortes')
      .select('id, numero_aves, galpon_id, fecha_inicio')
      .eq('estado', 'activo');

    if (cortesError || !cortes || cortes.length === 0) {
      return EMPTY_DASHBOARD;
    }

    const corteIds = cortes.map((c) => c.id);

    // 2. Consultar toda la producción de los últimos 30 días (cubre KPIs 7d, hoy, y gráfica)
    const { data: produccion } = await supabase
      .from('produccion')
      .select('corte_id, fecha, huevos_y, huevos_aaa, huevos_aa, huevos_a, huevos_b, huevos_c, huevos_blancos, alimento, muertes')
      .in('corte_id', corteIds)
      .gte('fecha', thirtyDaysAgo)
      .order('fecha', { ascending: true });

    const rows = (produccion ?? []) as ProduccionRow[];

    // 3. Derivar todos los datos desde las 2 consultas
    return {
      kpis: deriveKpis(cortes as CorteRow[], rows, today, sevenDaysAgo),
      chart: deriveChart(rows),
      classification: deriveClassification(rows, today),
      alerts: deriveAlerts(cortes as CorteRow[], rows, today, sevenDaysAgo),
    };
  },
};

// --- Hook ---
export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
}

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

export default DashboardService;
