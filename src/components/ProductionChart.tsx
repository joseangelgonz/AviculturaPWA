import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { DailyProductionPoint } from '../services/DashboardService';

interface ProductionChartProps {
  data: DailyProductionPoint[];
}

const ProductionChart = ({ data }: ProductionChartProps) => {
  const theme = useTheme();
  if (data.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
            Producción (últimos 30 días)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'text.secondary' }}>
            <Typography variant="body2">Sin datos de producción disponibles</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
          Producción (últimos 30 días)
        </Typography>
        <LineChart
          xAxis={[{
            data: data.map((_, i) => i),
            valueFormatter: (value: number) => data[value]?.fecha ?? '',
            tickLabelInterval: (_value: number, index: number) => index % Math.ceil(data.length / 6) === 0,
          }]}
          series={[{
            data: data.map((d) => d.total),
            area: true,
            label: 'Huevos',
            color: theme.palette.primary.main,
            showMark: false,
          }]}
          height={280}
          margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
};

export default ProductionChart;
