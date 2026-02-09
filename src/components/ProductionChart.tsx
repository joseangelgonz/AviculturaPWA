import { memo, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import ChartCard from './ChartCard';
import type { DailyProductionPoint } from '../services/DashboardService';

interface ProductionChartProps {
  data: DailyProductionPoint[];
}

const ProductionChart = memo(({ data }: ProductionChartProps) => {
  const theme = useTheme();

  const xAxisData = useMemo(() => data.map((_, i) => i), [data]);
  const seriesData = useMemo(() => data.map((d) => d.total), [data]);

  return (
    <ChartCard
      title="Producción (últimos 30 días)"
      emptyMessage="Sin datos de producción disponibles"
      isEmpty={data.length === 0}
    >
      <LineChart
        xAxis={[{
          data: xAxisData,
          valueFormatter: (value: number) => data[value]?.fecha ?? '',
          tickLabelInterval: (_value: number, index: number) => index % Math.ceil(data.length / 6) === 0,
        }]}
        series={[{
          data: seriesData,
          area: true,
          label: 'Huevos',
          color: theme.palette.primary.main,
          showMark: false,
        }]}
        height={280}
        margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
        hideLegend
      />
    </ChartCard>
  );
});

ProductionChart.displayName = 'ProductionChart';
export default ProductionChart;
