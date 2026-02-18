import { memo, useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import ChartCard from './ChartCard';
import type { EggClassificationBreakdown } from '../services/DashboardService';

interface EggClassificationChartProps {
  data: EggClassificationBreakdown[];
}

const EggClassificationChart = memo(({ data }: EggClassificationChartProps) => {
  const theme = useTheme();
  const { palette } = theme;

  const pieData = useMemo(() => {
    const colors = [
      palette.primary.main,
      palette.primary.light,
      palette.primary.dark,
      alpha(palette.primary.main, 0.72),
      alpha(palette.primary.main, 0.54),
      '#AFA595',
      '#CDC3B3',
    ];
    return data.map((item, i) => ({
      id: i,
      value: item.count,
      label: item.classification,
      color: colors[i % colors.length],
    }));
  }, [data, palette]);

  return (
    <ChartCard
      title="Clasificación de huevos (hoy)"
      emptyMessage="Sin datos de clasificación disponibles"
      isEmpty={data.length === 0}
    >
      <Box sx={{ width: '100%', minWidth: 0 }}>
        <PieChart
          series={[{
            data: pieData,
            innerRadius: '40%',
            outerRadius: '80%',
            paddingAngle: 2,
            cornerRadius: 4,
          }]}
          height={280}
          margin={{ left: 0, right: 80, top: 0, bottom: 0 }}
        />
      </Box>
    </ChartCard>
  );
});

EggClassificationChart.displayName = 'EggClassificationChart';
export default EggClassificationChart;
