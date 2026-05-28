import { Box, Typography, Grid, Card, CardContent, Button, Chip, Alert, Stack, TextField, MenuItem } from '@mui/material';
import { Package, Wheat, HeartCrack, Tags, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';

const OperarioDashboardScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedGalpon, setSelectedGalpon, assignedGalpones } = useSelectedGalpon();
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

  const fincaMap = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string }>();
    for (const galpon of assignedGalpones) {
      if (galpon.fincas?.nombre) {
        map.set(galpon.finca_id, { id: galpon.finca_id, nombre: galpon.fincas.nombre });
      }
    }
    return map;
  }, [assignedGalpones]);
  const assignedFincaIds = useMemo(
    () => Array.from(new Set(assignedGalpones.map((galpon) => galpon.finca_id))),
    [assignedGalpones],
  );

  const defaultFincaId = useMemo(() => {
    if (selectedGalpon) return selectedGalpon.finca_id.toString();
    if (assignedFincaIds.length > 0) return assignedFincaIds[0].toString();
    return '';
  }, [selectedGalpon, assignedFincaIds]);

  const [fincaOverride, setFincaOverride] = useState<string | null>(null);
  const [syncedGalponId, setSyncedGalponId] = useState<number | undefined>(selectedGalpon?.id);
  if (selectedGalpon?.id !== syncedGalponId) {
    setSyncedGalponId(selectedGalpon?.id);
    setFincaOverride(null);
  }
  const selectedFincaId = fincaOverride ?? defaultFincaId;

  const filteredGalpones = useMemo(() => {
    if (!selectedFincaId) return [];
    const fincaId = Number(selectedFincaId);
    return assignedGalpones.filter((galpon) => galpon.finca_id === fincaId);
  }, [assignedGalpones, selectedFincaId]);

  const selectedFincaLabel = selectedFincaId
    ? (() => {
      const finca = fincaMap.get(Number(selectedFincaId));
      if (!finca) return `Finca ${selectedFincaId}`;
      return finca.nombre;
    })()
    : '';

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

          <Box className="premium-fade-up premium-delay-1" sx={{ mb: 2.25 }}>
            {assignedGalpones.length === 0 ? (
              <Alert severity="info" variant="outlined">
                No hay galpon asignado actualmente.
              </Alert>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  select
                  label="Finca"
                  value={selectedFincaId}
                  onChange={(event) => setFincaOverride(event.target.value)}
                  sx={{ minWidth: 220 }}
                  disabled={assignedFincaIds.length === 0}
                >
                  {assignedFincaIds.map((id) => {
                    const finca = fincaMap.get(id);
                    const label = finca ? finca.nombre : `Finca ${id}`;
                    return (
                    <MenuItem key={id} value={id.toString()}>
                      {label}
                    </MenuItem>
                    );
                  })}
                </TextField>
                <TextField
                  select
                  label="Galpon"
                  value={selectedGalpon?.id ? selectedGalpon.id.toString() : ''}
                  onChange={(event) => {
                    const galponId = Number(event.target.value);
                    const galpon = assignedGalpones.find((item) => item.id === galponId) ?? null;
                    setSelectedGalpon(galpon);
                  }}
                  sx={{ minWidth: 240 }}
                  disabled={!selectedFincaId || filteredGalpones.length === 0}
                >
                  {filteredGalpones.map((galpon) => (
                    <MenuItem key={galpon.id} value={galpon.id.toString()}>
                      {galpon.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                {selectedGalpon && (
                  <Chip
                    label={`Activo: ${selectedFincaLabel} · ${selectedGalpon.nombre}`}
                    variant="outlined"
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  />
                )}
              </Stack>
            )}
          </Box>

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
