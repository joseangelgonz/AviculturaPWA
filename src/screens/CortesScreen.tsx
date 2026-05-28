import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Check, Plus, RefreshCw, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import type { Corte, CorteGalpon } from '../models/Corte';
import type { Finca } from '../models/Finca';
import type { Galpon } from '../models/Galpon';
import type { RazaAve } from '../models/RazaAve';
import CorteService from '../services/CorteService';
import FincaService from '../services/FincaService';
import GalponService from '../services/GalponService';
import RazaAveService from '../services/RazaAveService';

interface FormDetalle {
  galponId: string;
  avesIniciales: string;
}

interface CorteDetalleRow extends Corte {
  galpones: CorteGalpon[];
}

const emptyDetalle = (): FormDetalle => ({ galponId: '', avesIniciales: '' });

const CortesScreen = () => {
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [corteGalpones, setCorteGalpones] = useState<CorteGalpon[]>([]);
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [razasAve, setRazasAve] = useState<RazaAve[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizingId, setFinalizingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmUnderUtil, setConfirmUnderUtil] = useState(false);
  const [finalizarCorteId, setFinalizarCorteId] = useState<number | null>(null);

  const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedRazaAveId, setSelectedRazaAveId] = useState('');
  const [notas, setNotas] = useState('');
  const [numeroAvesTotal, setNumeroAvesTotal] = useState('');
  const [detalles, setDetalles] = useState<FormDetalle[]>([emptyDetalle()]);
  const [selectedFincaId, setSelectedFincaId] = useState('');

  const galponMap = useMemo(() => new Map<number, Galpon>(galpones.map((g) => [g.id, g])), [galpones]);
  const fincaMap = useMemo(() => new Map<number, Finca>(fincas.map((f) => [f.id, f])), [fincas]);
  const razaMap = useMemo(() => new Map<number, RazaAve>(razasAve.map((r) => [r.id, r])), [razasAve]);

  const activeGalponIds = useMemo(() => {
    const ids = new Set<number>();
    cortes.filter(corte => corte.estado === 'activo').forEach(activeCorte => {
      corteGalpones.filter(cg => cg.corte_id === activeCorte.id).forEach(cg => {
        ids.add(cg.galpon_id);
      });
    });
    return ids;
  }, [cortes, corteGalpones]);

  const filteredGalpones = useMemo(
    () => galpones.filter((g) => g.finca_id.toString() === selectedFincaId && !activeGalponIds.has(g.id)),
    [galpones, selectedFincaId, activeGalponIds],
  );

  const cortesRows = useMemo<CorteDetalleRow[]>(() => {
    const detalleMap = new Map<number, CorteGalpon[]>();
    for (const detalle of corteGalpones) {
      const current = detalleMap.get(detalle.corte_id) ?? [];
      current.push(detalle);
      detalleMap.set(detalle.corte_id, current);
    }

    return cortes.map((corte) => ({
      ...corte,
      galpones: detalleMap.get(corte.id) ?? [],
    }));
  }, [cortes, corteGalpones]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cortesData, fincasData, galponesData, razasData] = await Promise.all([
        CorteService.getAllCortes(),
        FincaService.getAllFincas(),
        GalponService.getAllGalpones(),
        RazaAveService.getAll(),
      ]);
      setCortes(cortesData);
      setFincas(fincasData);
      setGalpones(galponesData);
      setRazasAve(razasData);

      const detallesData = await CorteService.getCorteGalpones(cortesData.map((c) => c.id));
      setCorteGalpones(detallesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar cortes.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setFechaInicio(dayjs().format('YYYY-MM-DD'));
    setSelectedRazaAveId('');
    setNotas('');
    setNumeroAvesTotal('');
    setDetalles([emptyDetalle()]);
    setFormError(null);
    setSelectedFincaId('');
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const addDetalle = () => setDetalles((prev) => [...prev, emptyDetalle()]);

  const removeDetalle = (index: number) => {
    setDetalles((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const updateDetalle = (index: number, patch: Partial<FormDetalle>) => {
    setDetalles((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const parsedTotal = Number(numeroAvesTotal);
  const parsedSum = detalles.reduce((sum, detalle) => sum + (Number(detalle.avesIniciales) || 0), 0);

  const handleCreateCorte = async () => {
    const total = Number(numeroAvesTotal);

    if (!fechaInicio) {
      setFormError('La fecha de inicio es obligatoria.');
      return;
    }

    if (!selectedFincaId) {
      setFormError('Debes seleccionar una finca.');
      return;
    }

    if (!selectedRazaAveId) {
      setFormError('La raza de ave es obligatoria.');
      return;
    }

    const razaAveId = Number(selectedRazaAveId);
    if (!Number.isInteger(razaAveId) || razaAveId <= 0) {
      setFormError('La raza de ave seleccionada no es válida.');
      return;
    }

    const selectedRaza = razasAve.find((raza) => raza.id === razaAveId);
    if (!selectedRaza) {
      setFormError('No se encontró la raza de ave seleccionada.');
      return;
    }

    if (!Number.isInteger(total) || total <= 0) {
      setFormError('El numero total de aves debe ser un entero mayor que cero.');
      return;
    }

    const payloadDetalles = detalles.map((detalle) => ({
      galpon_id: Number(detalle.galponId),
      aves_iniciales: Number(detalle.avesIniciales),
    }));

    if (payloadDetalles.length === 0) {
      setFormError('Debes agregar al menos un galpon.');
      return;
    }

    const duplicated = new Set<number>();
    const unique = new Set<number>();

    for (const item of payloadDetalles) {
      if (!Number.isInteger(item.galpon_id) || item.galpon_id <= 0) {
        setFormError('Todos los galpones deben ser validos.');
        return;
      }
      if (!Number.isInteger(item.aves_iniciales) || item.aves_iniciales <= 0) {
        setFormError('Las aves por galpon deben ser enteros mayores que cero.');
        return;
      }
      if (unique.has(item.galpon_id)) {
        duplicated.add(item.galpon_id);
      }
      unique.add(item.galpon_id);
    }

    if (duplicated.size > 0) {
      setFormError('No puedes repetir un galpon dentro del mismo corte.');
      return;
    }

    const sumAves = payloadDetalles.reduce((sum, item) => sum + item.aves_iniciales, 0);
    if (sumAves !== total) {
      setFormError(`La suma por galpon (${sumAves}) debe ser igual al total (${total}).`);
      return;
    }

    setSaving(true);
    setFormError(null);
    
    try {
      // Frontend validation: Check if aves_iniciales exceed galpon capacity or under-utilize
      let hasUnderUtilization = false;
      for (const detalle of payloadDetalles) {
        const galpon = galponMap.get(detalle.galpon_id);
        if (galpon && galpon.capacidad != null) {
          if (detalle.aves_iniciales > galpon.capacidad) {
            setFormError(`El número de aves (${detalle.aves_iniciales}) para el galpón ${galpon.nombre} excede su capacidad (${galpon.capacidad}).`);
            setSaving(false);
            return;
          }
          if (detalle.aves_iniciales < galpon.capacidad) {
            hasUnderUtilization = true;
          }
        }
      }

      if (hasUnderUtilization) {
        setConfirmUnderUtil(true);
        setSaving(false);
        return;
      }

      await submitCorte(payloadDetalles, total, selectedRaza);
    } catch (err) {
      console.error('Error creating corte:', err);
      setFormError('No se pudo crear el corte. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const submitCorte = async (
    payloadDetalles: { galpon_id: number; aves_iniciales: number }[],
    total: number,
    raza: RazaAve,
  ) => {
    setSaving(true);
    setFormError(null);
    try {
      await CorteService.createCorte({
        fecha_inicio: fechaInicio,
        raza_ave_id: raza.id,
        notas,
        numero_aves_total: total,
        galpones: payloadDetalles,
      });
      setDialogOpen(false);
      setConfirmUnderUtil(false);
      await loadData();
    } catch (err) {
      console.error('Error creating corte:', err);
      setFormError('No se pudo crear el corte. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizar = (corte: Corte) => {
    setFinalizarCorteId(corte.id);
  };

  const doFinalizar = async () => {
    if (finalizarCorteId === null) return;
    const corteId = finalizarCorteId;
    setFinalizarCorteId(null);
    setFinalizingId(corteId);
    setError(null);

    try {
      await CorteService.finalizarCorte(corteId, dayjs().format('YYYY-MM-DD'));
      await loadData();
    } catch (err) {
      console.error('Error finalizing corte:', err);
      setError('No se pudo finalizar el corte.');
    } finally {
      setFinalizingId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, mb: 0.5 }}>
            Administracion
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Cortes
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} strokeWidth={1.85} aria-hidden />}
            onClick={() => void loadData()}
            disabled={loading}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} strokeWidth={1.85} aria-hidden />}
            onClick={handleOpenDialog}
            disabled={galpones.length === 0}
          >
            Nuevo corte
          </Button>
        </Stack>
      </Box>

      {galpones.length === 0 && !loading && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          Primero debes registrar galpones para crear cortes.
        </Alert>
      )}

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 'var(--ds-radius-lg, 10px)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha inicio</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Raza</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Aves total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Saldo total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Finca(s)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Galpones</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cortesRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography sx={{ py: 2, color: 'text.secondary' }}>
                      No hay cortes registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cortesRows.map((corte) => {
                  const fincaSummary = Array.from(
                    new Set(
                      corte.galpones
                        .map((item) => {
                          const galpon = galponMap.get(item.galpon_id);
                          if (!galpon) return 'Sin finca';
                          return fincaMap.get(galpon.finca_id)?.nombre ?? `Finca ${galpon.finca_id}`;
                        }),
                    ),
                  ).join(', ');

                  const galponSummary = corte.galpones
                    .map((item) => {
                      const galpon = galponMap.get(item.galpon_id);
                      return galpon
                        ? `${galpon.nombre} (${item.aves_iniciales})`
                        : `Galpon ${item.galpon_id} (${item.aves_iniciales})`;
                    })
                    .join(', ');
                  const razaLabel = razaMap.get(corte.raza_ave_id)?.descripcion ?? `Raza #${corte.raza_ave_id}`;

                  return (
                    <TableRow key={corte.id} hover>
                      <TableCell>{corte.id}</TableCell>
                      <TableCell>{dayjs(corte.fecha_inicio).format('YYYY-MM-DD')}</TableCell>
                      <TableCell>{razaLabel}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{corte.estado}</TableCell>
                      <TableCell>{corte.numero_aves_total}</TableCell>
                      <TableCell>{corte.saldo_aves_total}</TableCell>
                      <TableCell>{fincaSummary || '-'}</TableCell>
                      <TableCell>{galponSummary || '-'}</TableCell>
                      <TableCell align="right">
                        {corte.estado === 'activo' && (
                          <Tooltip title="Finalizar corte">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => void handleFinalizar(corte)}
                                disabled={finalizingId === corte.id}
                              >
                                <Check size={16} strokeWidth={1.8} aria-hidden />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Nuevo corte</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {formError && (
              <Alert severity="error" variant="outlined">
                {formError}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Fecha inicio"
                type="date"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                required
              />
              <TextField
                label="Total aves"
                type="number"
                value={numeroAvesTotal}
                onChange={(event) => setNumeroAvesTotal(event.target.value)}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Raza de ave"
                value={selectedRazaAveId}
                onChange={(event) => setSelectedRazaAveId(event.target.value)}
                fullWidth
                required
              >
                {razasAve.map((raza) => (
                  <MenuItem key={raza.id} value={raza.id.toString()}>
                    {raza.descripcion}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notas"
                value={notas}
                onChange={(event) => setNotas(event.target.value)}
                fullWidth
              />
            </Stack>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, pt: 1 }}>
              Distribucion por galpon
            </Typography>

            <TextField
              select
              label="Finca"
              value={selectedFincaId}
              onChange={(e) => {
                setSelectedFincaId(e.target.value);
                // Reset details when finca changes
                setDetalles([emptyDetalle()]);
              }}
              fullWidth
              required
              disabled={fincas.length === 0}
            >
              {fincas.map((finca) => (
                <MenuItem key={finca.id} value={finca.id.toString()}>
                  {finca.nombre}
                </MenuItem>
              ))}
            </TextField>

            {detalles.map((detalle, index) => (
              <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  select
                  label="Galpon"
                  value={detalle.galponId}
                  onChange={(event) => updateDetalle(index, { galponId: event.target.value })}
                  fullWidth
                  required
                  disabled={!selectedFincaId}
                >
                  {filteredGalpones.map((galpon) => (
                    <MenuItem key={galpon.id} value={galpon.id.toString()}>
                      {`${galpon.nombre} (Cap: ${galpon.capacidad})`}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Aves"
                  type="number"
                  value={detalle.avesIniciales}
                  onChange={(event) => updateDetalle(index, { avesIniciales: event.target.value })}
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  required
                  sx={{ width: { xs: '100%', sm: 180 } }}
                />

                <Tooltip title="Eliminar fila">
                  <span>
                    <IconButton
                      color="error"
                      onClick={() => removeDetalle(index)}
                      disabled={detalles.length === 1}
                    >
                      <Trash2 size={16} strokeWidth={1.8} aria-hidden />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={addDetalle}
                startIcon={<Plus size={16} strokeWidth={1.85} aria-hidden />}
                disabled={!selectedFincaId}
              >
                Agregar galpón
              </Button>
              <Typography variant="body2" color={Number.isInteger(parsedTotal) && parsedTotal === parsedSum ? 'success.main' : 'text.secondary'}>
                Suma detalle: {parsedSum} / Total: {Number.isFinite(parsedTotal) ? parsedTotal : 0}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={() => void handleCreateCorte()} variant="contained" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear corte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación sub-utilización */}
      <Dialog open={confirmUnderUtil} onClose={() => setConfirmUnderUtil(false)}>
        <DialogTitle>Confirmar creación</DialogTitle>
        <DialogContent>
          <Typography>
            Algunos galpones están siendo utilizados por debajo de su capacidad. ¿Desea continuar con la creación del corte?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUnderUtil(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              const total = Number(numeroAvesTotal);
              const razaAveId = Number(selectedRazaAveId);
              const selectedRaza = razasAve.find((raza) => raza.id === razaAveId);
              if (!selectedRaza) {
                setFormError('No se encontró la raza de ave seleccionada.');
                return;
              }
              const payloadDetalles = detalles.map((d) => ({
                galpon_id: Number(d.galponId),
                aves_iniciales: Number(d.avesIniciales),
              }));
              void submitCorte(payloadDetalles, total, selectedRaza);
            }}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación finalizar corte */}
      <Dialog open={finalizarCorteId !== null} onClose={() => setFinalizarCorteId(null)}>
        <DialogTitle>Finalizar corte</DialogTitle>
        <DialogContent>
          <Typography>
            Se finalizará el corte #{finalizarCorteId}. ¿Desea continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinalizarCorteId(null)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void doFinalizar()}>
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CortesScreen;
