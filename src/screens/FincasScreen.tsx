import { useCallback, useEffect, useState } from 'react';
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
import FincaService from '../services/FincaService';

const FincasScreen = () => {
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [editingFinca, setEditingFinca] = useState<Finca | null>(null);
  const [fincaToDelete, setFincaToDelete] = useState<Finca | null>(null);

  const loadFincas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FincaService.getAllFincas();
      setFincas(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar fincas.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFincas();
  }, [loadFincas]);

  const resetForm = () => {
    setNombre('');
    setUbicacion('');
    setFormError(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setEditingFinca(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleOpenEditDialog = (finca: Finca) => {
    setEditingFinca(finca);
    setNombre(finca.nombre);
    setUbicacion(finca.ubicacion ?? '');
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (finca: Finca) => {
    setFincaToDelete(finca);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (saving) return;
    setDeleteDialogOpen(false);
    setFincaToDelete(null);
    setDeleteError(null);
  };

  const handleCreateFinca = async () => {
    const nombreNormalizado = nombre.trim();
    const ubicacionNormalizada = ubicacion.trim();

    if (!nombreNormalizado) {
      setFormError('El nombre de la finca es obligatorio.');
      return;
    }

    if (nombreNormalizado.length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (nombreNormalizado.length > 120) {
      setFormError('El nombre no debe superar 120 caracteres.');
      return;
    }

    if (ubicacionNormalizada.length > 180) {
      setFormError('La ubicacion no debe superar 180 caracteres.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingFinca) {
        const fincaActualizada = await FincaService.updateFinca(editingFinca.id, {
          nombre: nombreNormalizado,
          ubicacion: ubicacionNormalizada || null,
        });
        setFincas((prev) =>
          prev
            .map((finca) => (finca.id === fincaActualizada.id ? fincaActualizada : finca))
            .sort((a, b) => a.id - b.id),
        );
      } else {
        const nuevaFinca = await FincaService.createFinca({
          nombre: nombreNormalizado,
          ubicacion: ubicacionNormalizada || null,
        });
        setFincas((prev) => [...prev, nuevaFinca].sort((a, b) => a.id - b.id));
      }
      setDialogOpen(false);
      setEditingFinca(null);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la finca.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFinca = async () => {
    if (!fincaToDelete) return;

    setSaving(true);
    setError(null);
    setDeleteError(null);
    try {
      await FincaService.deleteFinca(fincaToDelete.id);
      setFincas((prev) => prev.filter((finca) => finca.id !== fincaToDelete.id));
      handleCloseDeleteDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la finca.';
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
            Fincas
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} strokeWidth={1.85} aria-hidden />}
            onClick={() => void loadFincas()}
            disabled={loading}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} strokeWidth={1.85} aria-hidden />}
            onClick={handleOpenDialog}
          >
            Nueva finca
          </Button>
        </Stack>
      </Box>

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
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ubicacion</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Creada</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fincas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography sx={{ py: 2, color: 'text.secondary' }}>
                      No hay fincas registradas.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                fincas.map((finca) => (
                  <TableRow key={finca.id} hover>
                    <TableCell>{finca.id}</TableCell>
                    <TableCell>{finca.nombre}</TableCell>
                    <TableCell>{finca.ubicacion || '-'}</TableCell>
                    <TableCell>{finca.created_at ? dayjs(finca.created_at).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar finca">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(finca)}
                            disabled={saving}
                          >
                            <Pencil size={16} strokeWidth={1.8} aria-hidden />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Eliminar finca">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(finca)}
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
        <DialogTitle>{editingFinca ? `Editar finca #${editingFinca.id}` : 'Nueva finca'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {formError && (
              <Alert severity="error" variant="outlined">
                {formError}
              </Alert>
            )}

            <TextField
              label="Nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Ubicacion"
              value={ubicacion}
              onChange={(event) => setUbicacion(event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={() => void handleCreateFinca()} variant="contained" disabled={saving}>
            {saving ? 'Guardando...' : editingFinca ? 'Guardar cambios' : 'Crear finca'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar finca</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2, mt: 0.5 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            Se eliminara la finca <strong>{fincaToDelete?.nombre}</strong>. Esta accion no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={() => void handleDeleteFinca()} color="error" variant="contained" disabled={saving}>
            {saving ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FincasScreen;
