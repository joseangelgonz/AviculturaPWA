import { supabase } from './supabaseClient';
import { logServiceError } from './supabaseErrors';
import type { Producto } from '../models/Producto';
import type { Produccion } from '../models/Produccion';

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

type DailyRecordRow = {
  galpon_id: number;
  fecha: string;
  numero_aves_muertas: number;
  cantidad_alimento_bultos: number;
};

type FeedRecordRow = {
  galpon_id: number;
  fecha: string;
  cantidad_alimento_bultos: number | null;
};

type MortalityRecordRow = {
  galpon_id: number;
  fecha: string;
  cantidad_aves_muertas: number | null;
};

type CorteRow = {
  id: number;
  numero_aves_total: number;
  fecha_inicio: string;
};

type CorteGalponRow = {
  corte_id: number;
  galpon_id: number;
};

// --- Utilidades de fecha (YYYY-MM-DD para comparar con columnas date de Supabase) ---
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function fetchDailyRecords(galponIds: number[], sevenDaysAgoDate: string): Promise<DailyRecordRow[]> {
  const feedResult = await supabase
    .from('registro_alimentacion_galpon')
    .select('galpon_id, fecha, cantidad_alimento_bultos')
    .in('galpon_id', galponIds)
    .gte('fecha', sevenDaysAgoDate);

  if (feedResult.error) {
    logServiceError('Error al obtener registros de alimentación:', feedResult.error);
    throw new Error('No se pudieron obtener los registros diarios.');
  }

  const feeds = (feedResult.data ?? []) as FeedRecordRow[];
  const dailyByKey = new Map<string, DailyRecordRow>();

  for (const feed of feeds) {
    const key = `${feed.galpon_id}|${feed.fecha}`;
    dailyByKey.set(key, {
      galpon_id: feed.galpon_id,
      fecha: feed.fecha,
      cantidad_alimento_bultos: feed.cantidad_alimento_bultos ?? 0,
      numero_aves_muertas: 0,
    });
  }

  const mortalityResult = await supabase
    .from('registro_mortalidad')
    .select('galpon_id, fecha, cantidad_aves_muertas')
    .in('galpon_id', galponIds)
    .gte('fecha', sevenDaysAgoDate);

  if (mortalityResult.error) {
    logServiceError('Error al obtener registros de mortalidad:', mortalityResult.error);
    throw new Error('No se pudieron obtener los registros diarios.');
  }

  const mortalityRows = (mortalityResult.data ?? []) as MortalityRecordRow[];
  for (const mortality of mortalityRows) {
    const key = `${mortality.galpon_id}|${mortality.fecha}`;
    const current = dailyByKey.get(key);
    if (current) {
      current.numero_aves_muertas += mortality.cantidad_aves_muertas ?? 0;
      continue;
    }

    dailyByKey.set(key, {
      galpon_id: mortality.galpon_id,
      fecha: mortality.fecha,
      cantidad_alimento_bultos: 0,
      numero_aves_muertas: mortality.cantidad_aves_muertas ?? 0,
    });
  }

  return Array.from(dailyByKey.values());
}

function deriveKpis(
  cortes: CorteRow[],
  produccion: Produccion[],
  dailyRecords: DailyRecordRow[],
  todayDate: string,
  sevenDaysAgoDate: string
): KpiSummary {
  const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves_total, 0);

  const todayRows = produccion.filter((p) => p.fecha === todayDate);
  const weekRows = produccion.filter((p) => p.fecha >= sevenDaysAgoDate);

  // Today Production (Eggs) — produccion table now only contains egg classification data
  const todayEggProduction = todayRows.reduce((sum, p) => sum + p.cantidad, 0);
  const todayProduction = todayEggProduction > 0 ? todayEggProduction : null;

  const productionRate = todayProduction !== null && totalAves > 0
    ? Math.round((todayProduction / totalAves) * 1000) / 10
    : null;

  // Weekly Mortality (from registro_diario_galpon)
  const weekDailyRecords = dailyRecords.filter((r) => r.fecha >= sevenDaysAgoDate);
  const weeklyMortalityTotal = weekDailyRecords.reduce((sum, r) => sum + (r.numero_aves_muertas || 0), 0);
  const weeklyMortality = weeklyMortalityTotal > 0 ? weeklyMortalityTotal : null;

  // FCR Calculation (Feed Conversion Ratio) from registro_diario_galpon
  let fcr: number | null = null;
  const totalAlimentoBultos = weekDailyRecords.reduce((sum, r) => sum + (r.cantidad_alimento_bultos || 0), 0);
  if (totalAlimentoBultos > 0) {
    const AVERAGE_EGG_WEIGHT_KG = 0.060;
    const weekEggTotal = weekRows.reduce((sum, p) => sum + p.cantidad, 0);
    const totalEggMass = weekEggTotal * AVERAGE_EGG_WEIGHT_KG;
    fcr = totalEggMass > 0 ? Math.round((totalAlimentoBultos / totalEggMass) * 100) / 100 : null;
  }

  return { todayProduction, productionRate, weeklyMortality, fcr };
}

function deriveChart(produccion: Produccion[]): DailyProductionPoint[] {
  if (produccion.length === 0) return [];

  const byDate = new Map<string, number>();
  for (const row of produccion) {
    byDate.set(row.fecha, (byDate.get(row.fecha) ?? 0) + row.cantidad);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => ({ fecha, total }));
}

function deriveClassification(produccion: Produccion[], productMap: Map<number, Producto>, todayDate: string): EggClassificationBreakdown[] {
  const todayRows = produccion.filter((p) => p.fecha === todayDate);
  if (todayRows.length === 0) return [];

  const classificationMap = new Map<number, number>();
  for (const row of todayRows) {
    const currentCount = classificationMap.get(row.producto_codigo) ?? 0;
    classificationMap.set(row.producto_codigo, currentCount + row.cantidad);
  }

  return Array.from(classificationMap.entries())
    .map(([codigo, count]) => ({
      classification: productMap.get(codigo)?.descripcion || `Producto ${codigo}`,
      count,
    }))
    .filter((item) => item.count > 0);
}

function deriveAlerts(
  cortes: CorteRow[],
  corteGalponesMap: Map<number, number[]>,
  produccion: Produccion[],
  dailyRecords: DailyRecordRow[],
  todayDate: string,
  sevenDaysAgoDate: string
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const totalAves = cortes.reduce((sum, c) => sum + c.numero_aves_total, 0);

  const todayRows = produccion.filter((p) => p.fecha === todayDate);

  // Sin datos hoy por corte
  const galponesConDatosHoy = new Set(todayRows.map((d) => d.galpon_id));
  for (const corte of cortes) {
    const corteGalponIds = corteGalponesMap.get(corte.id) ?? [];
    const sinDatos = corteGalponIds.some((gid) => !galponesConDatosHoy.has(gid));
    if (corteGalponIds.length > 0 && sinDatos) {
      alerts.push({
        id: `sin-datos-${corte.id}`,
        severity: 'info',
        message: `Corte #${corte.id} no tiene datos de producción para hoy.`,
      });
    }
  }

  // Mortalidad alta (from registro_diario_galpon)
  const weekDailyRecords = dailyRecords.filter((r) => r.fecha >= sevenDaysAgoDate);
  for (const corte of cortes) {
    const corteGalponIds = new Set(corteGalponesMap.get(corte.id) ?? []);
    const corteRecords = weekDailyRecords.filter(
      (r) => corteGalponIds.has(r.galpon_id) && r.numero_aves_muertas > 0
    );
    if (corteRecords.length === 0) continue;

    const todayMortality = corteRecords
      .filter((r) => r.fecha === todayDate)
      .reduce((sum, r) => sum + r.numero_aves_muertas, 0);

    const pastRecords = corteRecords.filter((r) => r.fecha < todayDate);
    const pastMortality = pastRecords.reduce((sum, r) => sum + r.numero_aves_muertas, 0);
    const pastDays = pastRecords.length;
    const avgMortality = pastDays > 0 ? pastMortality / pastDays : 0;

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
    const todayEggProduction = todayRows.reduce((sum, p) => sum + p.cantidad, 0);
    const rate = (todayEggProduction / totalAves) * 100;

    if (rate < 80 && rate > 0) {
      alerts.push({
        id: 'baja-produccion',
        severity: 'warning',
        message: `Tasa de producción de huevos baja: ${rate.toFixed(1)}% (objetivo: ≥80%).`,
      });
    }
  }

  const severityOrder = { error: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

const EMPTY_DASHBOARD: DashboardData = {
  kpis: { todayProduction: null, productionRate: null, weeklyMortality: null, fcr: null },
  chart: [],
  classification: [],
  alerts: [{ id: 'no-cortes', severity: 'info', message: 'No hay cortes activos. Crea un corte para comenzar a registrar producción.' }],
};

const DashboardService = {
  async fetchDashboardData(): Promise<DashboardData> {
    const todayDate = getTodayDate();
    const sevenDaysAgoDate = getDaysAgoDate(7);
    const thirtyDaysAgoDate = getDaysAgoDate(30);

    // 1. Consultar cortes activos
    const { data: cortes, error: cortesError } = await supabase
      .from('cortes')
      .select('id, numero_aves_total, fecha_inicio')
      .eq('estado', 'activo');

    if (cortesError || !cortes || cortes.length === 0) {
      return EMPTY_DASHBOARD;
    }

    const corteRows = (cortes ?? []) as CorteRow[];
    const corteIds = corteRows.map((c) => c.id);

    // 2a. Consultar galpon_ids desde corte_galpones
    const { data: corteGalponesData, error: cgError } = await supabase
      .from('corte_galpones')
      .select('corte_id, galpon_id')
      .in('corte_id', corteIds);

    if (cgError) {
      logServiceError('Error al obtener corte_galpones:', cgError);
      throw new Error('No se pudieron obtener los galpones de los cortes.');
    }

    const corteGalpones = (corteGalponesData ?? []) as CorteGalponRow[];
    const galponIds = [...new Set(corteGalpones.map((cg) => cg.galpon_id))];

    if (galponIds.length === 0) {
      return EMPTY_DASHBOARD;
    }

    // 2b. Consultar producción, registros diarios y productos en paralelo
    const [produccionResult, dailyRecords, productosResult] = await Promise.all([
      supabase
        .from('produccion')
        .select('galpon_id, fecha, numero_secuencia, producto_codigo, cantidad')
        .in('galpon_id', galponIds)
        .gte('fecha', thirtyDaysAgoDate)
        .order('fecha', { ascending: true }),
      fetchDailyRecords(galponIds, sevenDaysAgoDate),
      supabase
        .from('productos')
        .select('*'),
    ]);

    if (produccionResult.error) {
      logServiceError('Error al obtener producción:', produccionResult.error);
      throw new Error('No se pudo obtener la producción.');
    }
    if (productosResult.error) {
      logServiceError('Error al obtener productos:', productosResult.error);
      throw new Error('No se pudieron obtener los productos.');
    }

    const produccionRows = (produccionResult.data ?? []) as Produccion[];
    const products = (productosResult.data ?? []) as Producto[];
    const productMap = new Map<number, Producto>(products.map((p) => [p.codigo, p]));

    // 3. Construir mapa corte -> galpon_ids para alertas
    const corteGalponesMap = new Map<number, number[]>();
    for (const cg of corteGalpones) {
      const current = corteGalponesMap.get(cg.corte_id) ?? [];
      current.push(cg.galpon_id);
      corteGalponesMap.set(cg.corte_id, current);
    }

    // 4. Derivar todos los datos
    return {
      kpis: deriveKpis(corteRows, produccionRows, dailyRecords, todayDate, sevenDaysAgoDate),
      chart: deriveChart(produccionRows),
      classification: deriveClassification(produccionRows, productMap, todayDate),
      alerts: deriveAlerts(corteRows, corteGalponesMap, produccionRows, dailyRecords, todayDate, sevenDaysAgoDate),
    };
  },
};

export default DashboardService;
