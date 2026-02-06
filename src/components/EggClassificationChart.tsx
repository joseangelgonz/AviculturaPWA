import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { EggClassificationBreakdown } from '../services/DashboardService';

interface EggClassificationChartProps {
  data: EggClassificationBreakdown[];
}

const EggClassificationChart = ({ data }: EggClassificationChartProps) => {
  const { palette } = useTheme();
  const COLORS = [palette.primary.main, palette.secondary.main, palette.primary.light, palette.primary.dark, palette.success.main, palette.warning.main, palette.error.main];
  if (data.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
            Clasificación de huevos (hoy)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'text.secondary' }}>
            <Typography variant="body2">Sin datos de clasificación disponibles</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const pieData = data.map((item, i) => ({
    id: i,
    value: item.count,
    label: item.classification,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 2 }}>
          Clasificación de huevos (hoy)
        </Typography>
        <PieChart
          series={[{
            data: pieData,
            innerRadius: '40%',
            outerRadius: '80%',
            paddingAngle: 2,
            cornerRadius: 4,
          }]}
          height={280}
          margin={{ left: 0, right: 120, top: 0, bottom: 0 }}
        />
      </CardContent>
    </Card>
  );
};

export default EggClassificationChart;
