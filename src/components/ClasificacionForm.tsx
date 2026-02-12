import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Plus, Trash2 } from 'lucide-react';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import ProduccionService from '../services/ProduccionService';
import ProductoService from '../services/ProductoService';
import type { Producto } from '../models/Producto';
import dayjs from 'dayjs';

interface ClasificacionEntry {
  id: number; // Para manejar las keys en React
  producto_codigo: number | '';
  cantidad: number | '';
}

const ClasificacionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [entries, setEntries] = useState<ClasificacionEntry[]>([{ id: 1, producto_codigo: '', cantidad: '' }]);
  const [productosHuevo, setProductosHuevo] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<Error | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [nextEntryId, setNextEntryId] = useState(2);
  const [hasDailyClasificacion, setHasDailyClasificacion] = useState(false);
  const [loadingDailyCheck, setLoadingDailyCheck] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoadingProductos(true);
        const productos = await ProductoService.getAllProductos();
        // Filtrar productos que sean tipos de huevo si es posible,
        // por ahora, asumimos que todos los productos son potencialmente seleccionables.
        // Podríamos añadir una columna 'tipo' a la tabla productos para un filtrado más preciso.
        setProductosHuevo(productos);
      } catch (err) {
        setErrorProductos(err as Error);
      } finally {
        setLoadingProductos(false);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const checkExistingClasificacion = async () => {
      if (selectedGalpon) {
        setLoadingDailyCheck(true);
        try {
          const fechaActual = dayjs().format('YYYY-MM-DD');
          const exists = await ProduccionService.checkDailyClasificacionExists(
            selectedGalpon.id,
            fechaActual
          );
          setHasDailyClasificacion(exists);
        } catch (err) {
          console.error('Error al verificar clasificación diaria existente:', err);
          setMessage({ type: 'error', text: 'Error al verificar clasificación diaria. Recarga la página.' });
        } finally {
          setLoadingDailyCheck(false);
        }
      } else {
        setHasDailyClasificacion(false);
        setLoadingDailyCheck(false);
      }
    };

    checkExistingClasificacion();
  }, [selectedGalpon]); // Re-run when selectedGalpon changes

  const handleAddEntry = () => {
    setEntries((prevEntries) => [
      ...prevEntries,
      { id: nextEntryId, producto_codigo: '', cantidad: '' },
    ]);
    setNextEntryId((prevId) => prevId + 1);
  };

  const handleDeleteEntry = (id: number) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const handleChangeEntry = (id: number, field: keyof ClasificacionEntry, value: string | number) => {
    setEntries((prevEntries) => {
      if (field === 'producto_codigo' && value !== '') {
        const isDuplicate = prevEntries.some(
          (entry) => entry.id !== id && entry.producto_codigo === value
        );
        if (isDuplicate) {
          setMessage({ type: 'error', text: 'Este tipo de huevo ya ha sido seleccionado en otra línea.' });
          // Optionally, do not update the producto_codigo for the current entry,
          // keeping its previous valid value or setting it to ''
          return prevEntries; // Prevent state update if duplicate
        } else {
          setMessage(null); // Clear message if it was a duplicate error
        }
      }

      return prevEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      );
    });
  };

  const totalCantidadHuevos = useMemo(() => {
    return entries.reduce((sum, entry) => sum + (Number(entry.cantidad) || 0), 0);
  }, [entries]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }

    const validEntries = entries.filter(
      (entry) => entry.producto_codigo !== '' && entry.cantidad !== '' && Number(entry.cantidad) > 0
    );

    if (validEntries.length === 0) {
      setMessage({ type: 'error', text: 'Por favor, añade al menos una entrada válida.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      let currentNumeroSecuencia = await ProduccionService.getNextNumeroSecuencia(
        selectedGalpon.id,
        fechaActual
      );

      for (const entry of validEntries) {
        await ProduccionService.addClasificacionEntry(
          selectedGalpon.id,
          fechaActual,
          currentNumeroSecuencia,
          Number(entry.producto_codigo),
          Number(entry.cantidad)
        );
        currentNumeroSecuencia++;
      }

      setMessage({ type: 'success', text: 'Clasificación registrada exitosamente.' });
      setEntries([{ id: 1, producto_codigo: '', cantidad: '' }]); // Reset form
      setNextEntryId(2);
      setHasDailyClasificacion(true); // Disable form after successful submission
    } catch (err: unknown) {
      console.error('Error al registrar clasificación:', err);
      const errorMsg = err instanceof Error ? err.message : 'Intenta de nuevo.';
      setMessage({ type: 'error', text: `Error al registrar clasificación: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGalpones || loadingProductos || loadingDailyCheck) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (hasDailyClasificacion) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Ya existe un registro de clasificación para el galpón {selectedGalpon?.nombre} para la fecha actual.
        Solo se permite un registro por día.
      </Alert>
    );
  }

  if (galponError) {
    return <Alert severity="error">Error al cargar galpones: {galponError.message}</Alert>;
  }

  if (errorProductos) {
    return <Alert severity="error">Error al cargar productos: {errorProductos.message}</Alert>;
  }

  if (!selectedGalpon) {
    return <Alert severity="info">Selecciona un galpón para registrar la clasificación.</Alert>;
  }

  return (
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth: 860, mx: 'auto', mt: 1.5, borderRadius: 'var(--ds-radius-md, 8px)' }}>
      <Typography variant="h6" gutterBottom>
        Registrar Clasificación de Huevos
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpón seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {entries.map((entry) => (
            <Grid container size={12} spacing={2} key={entry.id} alignItems="center">
              <Grid size={6}>
                <TextField
                  select
                  id={`tipo-huevo-${entry.id}`}
                  label="Tipo de Huevo"
                  value={entry.producto_codigo}
                  onChange={(e) => handleChangeEntry(entry.id, 'producto_codigo', Number(e.target.value))}
                  fullWidth
                  required
                >
                  {productosHuevo.map((producto) => (
                    <MenuItem key={producto.codigo} value={producto.codigo}>
                      {producto.descripcion}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={4}>
                <TextField
                  id={`cantidad-${entry.id}`}
                  label="Cantidad"
                  type="number"
                  value={entry.cantidad}
                  onChange={(e) => handleChangeEntry(entry.id, 'cantidad', Number(e.target.value))}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid size={2}>
                {entries.length > 1 && (
                  <IconButton onClick={() => handleDeleteEntry(entry.id)} color="error">
                    <Trash2 size={20} strokeWidth={1.75} aria-hidden />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Button
          startIcon={<Plus size={20} strokeWidth={1.75} aria-hidden />}
          onClick={handleAddEntry}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Añadir Línea
        </Button>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }} key={totalCantidadHuevos}>
          Total de Huevos: <span>{totalCantidadHuevos}</span>
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <span />}
        >
          {loading ? 'Registrando...' : 'Registrar Clasificación'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ClasificacionForm;
