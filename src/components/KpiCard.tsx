import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';

interface KpiCardProps {
  label: string;
  value: number | string | null;
  unit?: string;
  trend?: number | null;
  trendLabel?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

const KpiCard = ({ label, value, unit, trend, trendLabel, loading, icon }: KpiCardProps) => {
  const trendColor =
    trend == null ? 'text.secondary' :
    trend > 0 ? 'success.main' :
    trend < 0 ? 'error.main' :
    'text.secondary';

  const formattedValue = value == null
    ? '--'
    : typeof value === 'number'
      ? value.toLocaleString('es-CO')
      : value;

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={48} />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Etiqueta + icono */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            variant="h6"
            component="span"
            sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}
          >
            {label}
          </Typography>
          {icon && (
            <Box sx={{ color: 'text.disabled', display: 'flex' }}>
              {icon}
            </Box>
          )}
        </Box>

        {/* Valor grande */}
        <Typography variant="h3" component="div" sx={{ mb: 0.5 }}>
          {formattedValue}
          {unit && value != null && (
            <Typography
              component="span"
              sx={{ fontSize: '1rem', fontWeight: 400, color: 'text.secondary', ml: 0.5 }}
            >
              {unit}
            </Typography>
          )}
        </Typography>

        {/* Indicador de tendencia (inline) */}
        {trend != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend > 0 ? (
              <TrendingUpOutlined sx={{ fontSize: '1rem', color: trendColor }} />
            ) : trend < 0 ? (
              <TrendingDownOutlined sx={{ fontSize: '1rem', color: trendColor }} />
            ) : null}
            <Typography variant="body2" sx={{ color: trendColor, fontWeight: 600, fontSize: '0.75rem' }}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </Typography>
            {trendLabel && (
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {trendLabel}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
