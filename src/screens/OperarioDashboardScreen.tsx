import { Box, Typography, Grid, Card, CardContent, Button, Chip, Alert } from '@mui/material';
import { Package, Wheat, HeartCrack, Tags, ArrowRight } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';

const OperarioDashboardScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedGalpon } = useSelectedGalpon();
  const isIndex = location.pathname === '/operario' || location.pathname === '/';

  const quickActions = [
    {
      title: 'Recoleccion',
      description: 'Registra lotes de huevos por momento de recoleccion.',
      path: '/operario/recoleccion',
      icon: <Package size={20} strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Alimentacion',
      description: 'Carga tipo de alimento y cantidad de bultos del dia.',
      path: '/operario/alimentacion',
      icon: <Wheat size={20} strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Mortalidad',
      description: 'Registra aves muertas y su causa para trazabilidad.',
      path: '/operario/mortalidad',
      icon: <HeartCrack size={20} strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Clasificacion',
      description: 'Registra el desglose de produccion por tipo de huevo.',
      path: '/operario/clasificacion',
      icon: <Tags size={20} strokeWidth={1.75} aria-hidden />,
    },
  ];

  return (
    <Box>
      {isIndex && (
        <>
          <Box className="premium-fade-up" sx={{ mb: 2.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Operacion diaria
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Panel del Operario
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Registra actividades de forma rapida y consistente para mantener trazabilidad de cada galpon.
            </Typography>
          </Box>

          {selectedGalpon ? (
            <Box className="premium-fade-up premium-delay-1">
              <Chip
                label={`Galpon activo: ${selectedGalpon.nombre} (#${selectedGalpon.id})`}
                variant="outlined"
                sx={{ mb: 2.25 }}
              />
            </Box>
          ) : (
            <Alert className="premium-fade-up premium-delay-1" severity="info" variant="outlined" sx={{ mb: 2.25 }}>
              No hay galpon asignado actualmente.
            </Alert>
          )}

          <Grid className="premium-fade-up premium-delay-2" container spacing={2}>
            {quickActions.map((item) => (
              <Grid key={item.path} size={{ xs: 12, sm: 6 }}>
                <Card sx={{ '&:hover': { transform: 'translateY(-2px)', borderColor: '#D2C9B8' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--ds-radius-sm, 6px)',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'rgba(75, 90, 40, 0.1)',
                          color: 'primary.main',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowRight size={14} strokeWidth={2} aria-hidden />}
                      onClick={() => navigate(item.path)}
                    >
                      Abrir
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <Outlet />
    </Box>
  );
};

export default OperarioDashboardScreen;
