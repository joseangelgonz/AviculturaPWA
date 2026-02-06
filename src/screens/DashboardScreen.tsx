import { Box, Typography, Alert, Skeleton, Grid } from '@mui/material';
import EggOutlined from '@mui/icons-material/EggOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import KpiCard from '../components/KpiCard';
import ProductionChart from '../components/ProductionChart';
import EggClassificationChart from '../components/EggClassificationChart';
import {
  useDashboardKpis,
  useProductionChart,
  useEggClassification,
  useDashboardAlerts,
} from '../services/DashboardService';

const DashboardScreen = () => {
  const kpis = useDashboardKpis();
  const chart = useProductionChart();
  const classification = useEggClassification();
  const alerts = useDashboardAlerts();

  return (
    <Box>
      {/* Título */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Panel
      </Typography>

      {/* Alertas */}
      {alerts.data && alerts.data.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {alerts.data.map((alert) => (
            <Alert key={alert.id} severity={alert.severity} variant="outlined">
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Producción hoy"
            value={kpis.data?.todayProduction ?? null}
            unit="huevos"
            loading={kpis.loading}
            icon={<EggOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tasa de producción"
            value={kpis.data?.productionRate ?? null}
            unit="%"
            loading={kpis.loading}
            icon={<TrendingUpOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Mortalidad semanal"
            value={kpis.data?.weeklyMortality ?? null}
            unit="aves"
            loading={kpis.loading}
            icon={<WarningAmberOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="FCR (7 días)"
            value={kpis.data?.fcr ?? null}
            loading={kpis.loading}
            icon={<RestaurantOutlined />}
          />
        </Grid>
      </Grid>

      {/* Gráficas */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          {chart.loading ? (
            <Skeleton variant="rounded" height={340} />
          ) : (
            <ProductionChart data={chart.data ?? []} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {classification.loading ? (
            <Skeleton variant="rounded" height={340} />
          ) : (
            <EggClassificationChart data={classification.data ?? []} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen;
