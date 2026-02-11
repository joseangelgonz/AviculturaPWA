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
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={48} />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="premium-fade-up premium-delay-1"
      sx={{
        height: '100%',
        borderRadius: 3,
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#D1C8B8',
          boxShadow: '0 1px 0 rgba(29, 31, 26, 0.05), 0 16px 30px rgba(29, 31, 26, 0.05)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography
            variant="h6"
            component="span"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.69rem',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
          {icon && (
            <Box
              sx={{
                color: 'primary.main',
                display: 'grid',
                placeItems: 'center',
                width: 28,
                height: 28,
                borderRadius: '9px',
                bgcolor: 'rgba(75, 90, 40, 0.09)',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography variant="h3" component="div" sx={{ mb: 0.25, fontSize: '1.95rem' }}>
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
