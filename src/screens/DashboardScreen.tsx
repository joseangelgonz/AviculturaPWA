import { Box, Typography, Alert, Skeleton, Grid } from '@mui/material';
import EggOutlined from '@mui/icons-material/EggOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import KpiCard from '../components/KpiCard';
import ProductionChart from '../components/ProductionChart';
import EggClassificationChart from '../components/EggClassificationChart';
import { useDashboardData } from '../services/DashboardService';

const DashboardScreen = () => {
  const { data, loading, error } = useDashboardData();

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Panel</Typography>
        <Alert severity="error" variant="outlined">
          Error al cargar el panel: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Título */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Panel
      </Typography>

      {/* Alertas */}
      {data?.alerts && data.alerts.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {data.alerts.map((alert) => (
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
            value={data?.kpis.todayProduction ?? null}
            unit="huevos"
            loading={loading}
            icon={<EggOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tasa de producción"
            value={data?.kpis.productionRate ?? null}
            unit="%"
            loading={loading}
            icon={<TrendingUpOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Mortalidad semanal"
            value={data?.kpis.weeklyMortality ?? null}
            unit="aves"
            loading={loading}
            icon={<WarningAmberOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="FCR (7 días)"
            value={data?.kpis.fcr ?? null}
            loading={loading}
            icon={<RestaurantOutlined />}
          />
        </Grid>
      </Grid>

      {/* Gráficas */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          {loading ? (
            <Skeleton variant="rounded" height={340} />
          ) : (
            <ProductionChart data={data?.chart ?? []} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {loading ? (
            <Skeleton variant="rounded" height={340} />
          ) : (
            <EggClassificationChart data={data?.classification ?? []} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen;
