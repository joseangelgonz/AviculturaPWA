import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { Producto } from '../models/Producto';


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

const MORTALIDAD_PRODUCT_CODE = 999; // Placeholder: Assign a valid product code for mortality from your 'productos' table
const ALIMENTO_PRODUCT_CODE = 998; // Placeholder: Assign a valid product code for feed from your 'productos' table


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

import type { Produccion } from '../models/Produccion';


type CorteRow = { id: string; numero_aves: number; galpon_id: string | null; fecha_inicio: string };

// --- Derivar datos desde 2 consultas ---
function deriveKpis(
  cortes: CorteRow[],
  produccion: Produccion[],
  productMap: Map<number, Producto>,
  today: { start: string; end: string },
  sevenDaysAgo: string
): KpiSummary {
  const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves, 0);

  // Helper to identify product types
  const isEggProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.descripcion?.includes('Huevo') : false; // Assuming eggs have 'Huevo' in description
  };
  const isMortalityProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.codigo === MORTALIDAD_PRODUCT_CODE : false; // Assuming a specific code for mortality
  };
  const isFeedProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.codigo === ALIMENTO_PRODUCT_CODE : false; // Assuming a specific code for feed
  };

  const todayRows = produccion.filter((p) => p.fecha >= today.start && p.fecha < today.end);
  const weekRows = produccion.filter((p) => p.fecha >= sevenDaysAgo);

  // Today Production (Eggs)
  const todayEggProduction = todayRows
    .filter((p) => isEggProduct(p.producto_codigo))
    .reduce((sum, p) => sum + p.cantidad, 0);
  const todayProduction = todayEggProduction > 0 ? todayEggProduction : null;

  const productionRate = todayProduction !== null && totalAves > 0
    ? Math.round((todayProduction / totalAves) * 1000) / 10
    : null;

  // Weekly Mortality
  const weeklyMortality = weekRows
    .filter((p) => isMortalityProduct(p.producto_codigo))
    .reduce((sum, p) => sum + p.cantidad, 0);
  const totalWeeklyMortality = weeklyMortality > 0 ? weeklyMortality : null;

  // FCR Calculation (Feed Conversion Ratio)
  let fcr: number | null = null;
  if (weekRows.length > 0) {
    const totalAlimento = weekRows
      .filter((p) => isFeedProduct(p.producto_codigo))
      .reduce((sum, p) => sum + p.cantidad, 0);

    // This part is complex as we don't have individual egg weights in this structure directly.
    // For now, let's simplify or assume an average egg weight.
    // Ideally, productMap should contain average weight for egg products.
    // For this refactor, let's use a placeholder average weight for eggs.
    const AVERAGE_EGG_WEIGHT_KG = 0.060; // Placeholder average weight
    const totalEggMass = weekRows
      .filter((p) => isEggProduct(p.producto_codigo))
      .reduce((sum, p) => sum + (p.cantidad * AVERAGE_EGG_WEIGHT_KG), 0);

    fcr = totalEggMass > 0 ? Math.round((totalAlimento / totalEggMass) * 100) / 100 : null;
  }

  return { todayProduction, productionRate, weeklyMortality: totalWeeklyMortality, fcr };
}

function deriveChart(produccion: Produccion[], productMap: Map<number, Producto>): DailyProductionPoint[] {
  if (produccion.length === 0) return [];

  const isEggProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.descripcion?.includes('Huevo') : false; // Assuming eggs have 'Huevo' in description
  };

  const byDate = new Map<string, number>();
  for (const row of produccion.filter(p => isEggProduct(p.producto_codigo))) {
    const date = new Date(row.fecha).toLocaleDateString('es-CO');
    byDate.set(date, (byDate.get(date) ?? 0) + row.cantidad);
  }

  return Array.from(byDate.entries()).map(([fecha, total]) => ({ fecha, total }));
}

function deriveClassification(produccion: Produccion[], productMap: Map<number, Producto>, today: { start: string; end: string }): EggClassificationBreakdown[] {
  const todayRows = produccion.filter((p) => p.fecha >= today.start && p.fecha < today.end);
  if (todayRows.length === 0) return [];

  const isEggProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.descripcion?.includes('Huevo') : false;
  };

  const classificationMap = new Map<number, number>();
  for (const row of todayRows) {
    if (isEggProduct(row.producto_codigo)) {
      const currentCount = classificationMap.get(row.producto_codigo) ?? 0;
      classificationMap.set(row.producto_codigo, currentCount + row.cantidad);
    }
  }

  return Array.from(classificationMap.entries())
    .map(([codigo, count]) => ({
      classification: productMap.get(codigo)?.descripcion || `Producto ${codigo}`, // Use product description as label
      count: count,
    }))
    .filter((item) => item.count > 0);
}

function deriveAlerts(
  cortes: CorteRow[],
  produccion: Produccion[],
  productMap: Map<number, Producto>,
  today: { start: string; end: string },
  sevenDaysAgo: string
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves, 0);

  const todayRows = produccion.filter((p) => p.fecha >= today.start && p.fecha < today.end);
  const weekRows = produccion.filter((p) => p.fecha >= sevenDaysAgo);

  const isMortalityProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.codigo === MORTALIDAD_PRODUCT_CODE : false;
  };
  const isEggProduct = (codigo: number) => {
    const product = productMap.get(codigo);
    return product ? product.descripcion?.includes('Huevo') : false;
  };

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
  for (const corte of cortes) {
    const corteProdMortality = weekRows.filter((p) => p.corte_id === corte.id && isMortalityProduct(p.producto_codigo));
    if (corteProdMortality.length === 0) continue; // No mortality records for this corte in the week

    const todayMortality = corteProdMortality
      .filter((p) => p.fecha >= today.start && p.fecha < today.end)
      .reduce((sum, p) => sum + p.cantidad, 0);

    const pastMortality = corteProdMortality
      .filter((p) => p.fecha < today.start)
      .reduce((sum, p) => sum + p.cantidad, 0);

    const pastMortalityDays = new Set(corteProdMortality.filter(p => p.fecha < today.start).map(p => p.fecha.split('T')[0])).size;

    const avgMortality = pastMortalityDays > 0 ? pastMortality / pastMortalityDays : 0;

    if (todayMortality > avgMortality * 2 && avgMortality > 0) {
      alerts.push({
        id: `mortalidad-${corte.id}`,
        severity: 'error',
        message: `Alta mortalidad en Corte #${corte.id}: ${todayMortality} muertes hoy (promedio: ${Math.round(avgMortality)}).`,
      });
    }
  }

  // Baja producción (tasa < 80%)
  if (totalAves > 0) {
    const todayEggProduction = todayRows
      .filter((p) => isEggProduct(p.producto_codigo))
      .reduce((sum, p) => sum + p.cantidad, 0);

    const rate = (todayEggProduction / totalAves) * 100;

    if (rate < 80 && rate > 0) {
      alerts.push({
        id: 'baja-produccion',
        severity: 'warning',
        message: `Tasa de producción de huevos baja: ${rate.toFixed(1)}% (objetivo: ≥80%).`,
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

    // 2. Consultar toda la producción de los últimos 30 días
    const { data: produccionData, error: produccionError } = await supabase
      .from('produccion')
      .select('corte_id, fecha, numero_secuencia, producto_codigo, cantidad')
      .in('corte_id', corteIds)
      .gte('fecha', thirtyDaysAgo)
      .order('fecha', { ascending: true });
    
    if (produccionError) {
      console.error('Error al obtener producción:', produccionError);
      // Depending on desired behavior, return EMPTY_DASHBOARD or rethrow
      throw new Error('No se pudo obtener la producción.');
    }

    const produccionRows = (produccionData ?? []) as Produccion[];

    // 3. Consultar productos y unidades de medida
    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .select('*');
    if (productosError) {
      console.error('Error al obtener productos:', productosError);
      throw new Error('No se pudieron obtener los productos.');
    }
    const products: Producto[] = productosData;
    const productMap = new Map<number, Producto>(products.map(p => [p.codigo, p]));




    // 4. Derivar todos los datos desde las consultas
    return {
      kpis: deriveKpis(cortes as CorteRow[], produccionRows, productMap, today, sevenDaysAgo),
      chart: deriveChart(produccionRows, productMap),
      classification: deriveClassification(produccionRows, productMap, today),
      alerts: deriveAlerts(cortes as CorteRow[], produccionRows, productMap, today, sevenDaysAgo),
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
