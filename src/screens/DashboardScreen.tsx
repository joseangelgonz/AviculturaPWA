import { lazy, Suspense } from 'react';
import { Box, Typography, Alert, Skeleton, Grid, Chip, Stack, Paper } from '@mui/material';
import { Egg, TrendingUp, AlertTriangle, Wheat } from 'lucide-react';
import dayjs from 'dayjs';
import KpiCard from '../components/KpiCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { useDashboardData } from '../hooks/useDashboardData';

const ProductionChart = lazy(() => import('../components/ProductionChart'));
const EggClassificationChart = lazy(() => import('../components/EggClassificationChart'));

const DashboardScreen = () => {
  const { data, loading, error } = useDashboardData();

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Panel</Typography>
        <Alert severity="error" variant="outlined">
          Error al cargar el panel: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="premium-fade-up" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, flexDirection: { xs: 'column', sm: 'row' }, mb: 2.5 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Insights
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Resumen Operativo
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            label={dayjs().format('DD [de] MMMM, YYYY')}
            variant="outlined"
            sx={{ borderColor: 'divider', color: 'text.secondary', fontWeight: 500 }}
          />
          {!!data?.alerts?.length && (
            <Chip
              size="small"
              label={`${data.alerts.length} alerta${data.alerts.length === 1 ? '' : 's'}`}
              sx={{ bgcolor: 'rgba(168, 120, 33, 0.12)', color: 'warning.dark' }}
            />
          )}
        </Stack>
      </Box>

      {data?.alerts && data.alerts.length > 0 && (
        <Box className="premium-fade-up premium-delay-1" sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.25 }}>
          {data.alerts.map((alert) => (
            <Alert key={alert.id} severity={alert.severity} variant="outlined">
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={2} sx={{ mb: 2.25 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Producción hoy"
            value={data?.kpis.todayProduction ?? null}
            unit="huevos"
            loading={loading}
            icon={<Egg size={18} strokeWidth={1.85} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tasa de producción"
            value={data?.kpis.productionRate ?? null}
            unit="%"
            loading={loading}
            icon={<TrendingUp size={18} strokeWidth={1.85} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Mortalidad semanal"
            value={data?.kpis.weeklyMortality ?? null}
            unit="aves"
            loading={loading}
            icon={<AlertTriangle size={18} strokeWidth={1.85} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="FCR (7 días)"
            value={data?.kpis.fcr ?? null}
            loading={loading}
            icon={<Wheat size={18} strokeWidth={1.85} aria-hidden />}
          />
        </Grid>
      </Grid>

      <Paper className="premium-fade-up premium-delay-2" sx={{ p: { xs: 1.25, sm: 1.5 }, borderRadius: 3 }}>
        <Typography
          variant="body2"
          sx={{
            mb: 1.25,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'text.secondary',
            fontSize: '0.69rem',
          }}
        >
          Tendencias
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            {loading ? (
              <Skeleton variant="rounded" height={340} />
            ) : (
              <ErrorBoundary level="section" fallbackMessage="Error al cargar el gráfico de producción.">
                <Suspense fallback={<Skeleton variant="rounded" height={340} />}>
                  <ProductionChart data={data?.chart ?? []} />
                </Suspense>
              </ErrorBoundary>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {loading ? (
              <Skeleton variant="rounded" height={340} />
            ) : (
              <ErrorBoundary level="section" fallbackMessage="Error al cargar el gráfico de clasificación.">
                <Suspense fallback={<Skeleton variant="rounded" height={340} />}>
                  <EggClassificationChart data={data?.classification ?? []} />
                </Suspense>
              </ErrorBoundary>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardScreen;
