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

export interface DashboardData {
  readonly kpis: KpiSummary;
  readonly chart: DailyProductionPoint[];
  readonly classification: EggClassificationBreakdown[];
}

type DailyRecordRow = {
  corte_id: number | null;
  galpon_id: number;
  fecha: string;
  numero_aves_muertas: number;
  cantidad_alimento_bultos: number;
};

type FeedRecordRow = {
  corte_id: number | null;
  galpon_id: number;
  fecha: string;
  cantidad_alimento_bultos: number | null;
};

type MortalityRecordRow = {
  corte_id: number | null;
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
    .select('corte_id, galpon_id, fecha, cantidad_alimento_bultos')
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
      corte_id: feed.corte_id ?? null,
      cantidad_alimento_bultos: feed.cantidad_alimento_bultos ?? 0,
      numero_aves_muertas: 0,
    });
  }

  const mortalityResult = await supabase
    .from('registro_mortalidad')
    .select('corte_id, galpon_id, fecha, cantidad_aves_muertas')
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
      current.corte_id ??= mortality.corte_id ?? null;
      current.numero_aves_muertas += mortality.cantidad_aves_muertas ?? 0;
      continue;
    }

    dailyByKey.set(key, {
      galpon_id: mortality.galpon_id,
      fecha: mortality.fecha,
      corte_id: mortality.corte_id ?? null,
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

  // Weekly Mortality (from registro_mortalidad aggregated by galpon/fecha)
  const weekDailyRecords = dailyRecords.filter((r) => r.fecha >= sevenDaysAgoDate);
  const weeklyMortalityTotal = weekDailyRecords.reduce((sum, r) => sum + (r.numero_aves_muertas || 0), 0);
  const weeklyMortality = weeklyMortalityTotal > 0 ? weeklyMortalityTotal : null;

  // FCR Calculation (Feed Conversion Ratio) from registro_alimentacion_galpon
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

const EMPTY_DASHBOARD: DashboardData = {
  kpis: { todayProduction: null, productionRate: null, weeklyMortality: null, fcr: null },
  chart: [],
  classification: [],
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
        .select('corte_id, galpon_id, fecha, numero_secuencia, producto_codigo, cantidad')
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
    // 3. Derivar todos los datos
    return {
      kpis: deriveKpis(corteRows, produccionRows, dailyRecords, todayDate, sevenDaysAgoDate),
      chart: deriveChart(produccionRows),
      classification: deriveClassification(produccionRows, productMap, todayDate),
    };
  },
};

export default DashboardService;

