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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
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
    } catch (err) {
      console.error('Error al registrar clasificación:', err);
      setMessage({ type: 'error', text: 'Error al registrar clasificación. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGalpones || loadingProductos) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
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
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
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
                    <DeleteIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddEntry}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Añadir Línea
        </Button>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Total de Huevos: {totalCantidadHuevos}
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
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Registrando...' : 'Registrar Clasificación'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ClasificacionForm;
