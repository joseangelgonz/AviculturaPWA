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
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import type { Finca } from '../models/Finca';
import type { Galpon } from '../models/Galpon';
import FincaService from '../services/FincaService';
import GalponService from '../services/GalponService';
import CorteService from '../services/CorteService';

const GalponesScreen = () => {
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [activeGalponIds, setActiveGalponIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingGalpon, setEditingGalpon] = useState<Galpon | null>(null);
  const [galponToDelete, setGalponToDelete] = useState<Galpon | null>(null);

  const [fincaId, setFincaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState('');

  const fincaMap = useMemo(() => new Map<number, Finca>(fincas.map((f) => [f.id, f])), [fincas]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fincasData, galponesData, cortesData] = await Promise.all([
        FincaService.getAllFincas(),
        GalponService.getAllGalpones(),
        CorteService.getAllCortes(),
      ]);
      const activeCorteIds = cortesData
        .filter((corte) => corte.estado === 'activo')
        .map((corte) => corte.id);

      let activeIds = new Set<number>();
      if (activeCorteIds.length > 0) {
        const detalles = await CorteService.getCorteGalpones(activeCorteIds);
        activeIds = new Set(detalles.map((detalle) => detalle.galpon_id));
      }

      setFincas(fincasData);
      setGalpones(galponesData);
      setActiveGalponIds(activeIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar galpones.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setFincaId('');
    setNombre('');
    setCapacidad('');
    setFormError(null);
  };

  const handleOpenCreateDialog = () => {
    setEditingGalpon(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (galpon: Galpon) => {
    if (activeGalponIds.has(galpon.id)) {
      setError('No se puede editar un galpon con corte activo.');
      return;
    }
    setEditingGalpon(galpon);
    setFincaId(galpon.finca_id.toString());
    setNombre(galpon.nombre);
    setCapacidad(galpon.capacidad != null ? galpon.capacidad.toString() : '');
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleOpenDeleteDialog = (galpon: Galpon) => {
    setGalponToDelete(galpon);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (saving) return;
    setDeleteDialogOpen(false);
    setGalponToDelete(null);
    setDeleteError(null);
  };

  const parseCapacidad = (): number => {
    const value = capacidad.trim();
    if (!value) return Number.NaN;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return Number.NaN;
    return parsed;
  };

  const handleSubmitGalpon = async () => {
    const parsedFincaId = Number(fincaId);
    const nombreNormalizado = nombre.trim();
    const capacidadNormalizada = parseCapacidad();
    const nombreComparable = nombreNormalizado.toLocaleLowerCase();

    if (!Number.isInteger(parsedFincaId) || parsedFincaId <= 0) {
      setFormError('Debes seleccionar una finca valida.');
      return;
    }

    if (!nombreNormalizado) {
      setFormError('El nombre del galpon es obligatorio.');
      return;
    }

    if (nombreNormalizado.length < 2) {
      setFormError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (nombreNormalizado.length > 120) {
      setFormError('El nombre no debe superar 120 caracteres.');
      return;
    }

    if (Number.isNaN(capacidadNormalizada)) {
      setFormError('La capacidad es obligatoria y debe ser un entero mayor que cero.');
      return;
    }

    const duplicateInSameFinca = galpones.some((galpon) => {
      if (galpon.finca_id !== parsedFincaId) return false;
      if (editingGalpon && galpon.id === editingGalpon.id) return false;
      return galpon.nombre.trim().toLocaleLowerCase() === nombreComparable;
    });

    if (duplicateInSameFinca) {
      setFormError('Ya existe un galpon con ese nombre en la finca seleccionada.');
      return;
    }

    if (editingGalpon && activeGalponIds.has(editingGalpon.id)) {
      setFormError('No se puede editar un galpon con corte activo.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingGalpon) {
        const galponActualizado = await GalponService.updateGalpon(editingGalpon.id, {
          finca_id: parsedFincaId,
          nombre: nombreNormalizado,
          capacidad: capacidadNormalizada,
        });

        setGalpones((prev) =>
          prev
            .map((item) => (item.id === galponActualizado.id ? galponActualizado : item))
            .sort((a, b) => a.id - b.id),
        );
      } else {
        const nuevoGalpon = await GalponService.createGalpon({
          finca_id: parsedFincaId,
          nombre: nombreNormalizado,
          capacidad: capacidadNormalizada,
        });
        setGalpones((prev) => [...prev, nuevoGalpon].sort((a, b) => a.id - b.id));
      }

      setDialogOpen(false);
      setEditingGalpon(null);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el galpon.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGalpon = async () => {
    if (!galponToDelete) return;

    setSaving(true);
    setDeleteError(null);
    try {
      await GalponService.deleteGalpon(galponToDelete.id);
      setGalpones((prev) => prev.filter((item) => item.id !== galponToDelete.id));
      handleCloseDeleteDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el galpon.';
      setDeleteError(message);
    } finally {
      setSaving(false);
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
            Galpones
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
            onClick={handleOpenCreateDialog}
            disabled={fincas.length === 0}
          >
            Nuevo galpon
          </Button>
        </Stack>
      </Box>

      {fincas.length === 0 && !loading && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          Debes crear al menos una finca antes de registrar galpones.
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
                <TableCell sx={{ fontWeight: 700 }}>Finca</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capacidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Saldo aves</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Creado</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {galpones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ py: 2, color: 'text.secondary' }}>
                      No hay galpones registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                galpones.map((galpon) => (
                  <TableRow key={galpon.id} hover>
                    <TableCell>{galpon.id}</TableCell>
                    <TableCell>{fincaMap.get(galpon.finca_id)?.nombre ?? `Finca ${galpon.finca_id}`}</TableCell>
                    <TableCell>{galpon.nombre}</TableCell>
                    <TableCell>{galpon.capacidad ?? '-'}</TableCell>
                    <TableCell>{galpon.saldo_aves}</TableCell>
                    <TableCell>{galpon.created_at ? dayjs(galpon.created_at).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar galpon">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(galpon)}
                            disabled={saving || activeGalponIds.has(galpon.id)}
                          >
                            <Pencil size={16} strokeWidth={1.8} aria-hidden />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Eliminar galpon">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(galpon)}
                            disabled={saving}
                          >
                            <Trash2 size={16} strokeWidth={1.8} aria-hidden />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingGalpon ? `Editar galpon #${editingGalpon.id}` : 'Nuevo galpon'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {formError && (
              <Alert severity="error" variant="outlined">
                {formError}
              </Alert>
            )}

            <TextField
              select
              label="Finca"
              value={fincaId}
              onChange={(event) => setFincaId(event.target.value)}
              fullWidth
              required
            >
              {fincas.map((finca) => (
                <MenuItem key={finca.id} value={finca.id.toString()}>
                  {finca.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Capacidad"
              type="number"
              value={capacidad}
              onChange={(event) => setCapacidad(event.target.value)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              fullWidth
              required
              helperText="Campo obligatorio. Debe ser un entero mayor que cero."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={() => void handleSubmitGalpon()} variant="contained" disabled={saving}>
            {saving ? 'Guardando...' : editingGalpon ? 'Guardar cambios' : 'Crear galpon'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar galpon</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2, mt: 0.5 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            Se eliminara el galpon <strong>{galponToDelete?.nombre}</strong>. Esta accion no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={() => void handleDeleteGalpon()} color="error" variant="contained" disabled={saving}>
            {saving ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GalponesScreen;
