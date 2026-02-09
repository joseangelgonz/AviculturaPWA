import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';

interface KpiCardProps {
  label: string;
  value: number | string | null;
  unit?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

const KpiCard = ({ label, value, unit, loading, icon }: KpiCardProps) => {
  const formattedValue = value == null
    ? '--'
    : typeof value === 'number'
      ? value.toLocaleString('es-CO')
      : value;

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={48} />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default KpiCard;
