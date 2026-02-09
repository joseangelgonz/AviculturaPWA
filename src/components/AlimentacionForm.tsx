import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import RegistroDiarioGalponService from '../services/RegistroDiarioGalponService';
import ProductoService from '../services/ProductoService'; // Importar ProductoService
import type { Producto } from '../models/Producto';
import dayjs from 'dayjs';

const AlimentacionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [productoAlimentoCodigo, setProductoAlimentoCodigo] = useState<number | ''>('');
  const [cantidadBultos, setCantidadBultos] = useState<number | ''>('');
  const [productosAlimento, setProductosAlimento] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<Error | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoadingProductos(true);
        const productos = await ProductoService.getAllProductos();
        // Filtrar productos que puedan ser considerados alimento si hay una manera de identificarlo
        // Por ahora, asumimos que todos los productos pueden ser seleccionados como alimento.
        setProductosAlimento(productos);
      } catch (err) {
        setErrorProductos(err as Error);
      } finally {
        setLoadingProductos(false);
      }
    };
    fetchProductos();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }
    if (productoAlimentoCodigo === '' || cantidadBultos === '') {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      await RegistroDiarioGalponService.upsertRegistroDiario(
        selectedGalpon.id,
        fechaActual,
        {
          producto_alimento_codigo: Number(productoAlimentoCodigo),
          cantidad_alimento_bultos: Number(cantidadBultos),
        }
      );
      setMessage({ type: 'success', text: 'Alimentación registrada exitosamente.' });
      setProductoAlimentoCodigo('');
      setCantidadBultos('');
    } catch (err) {
      console.error('Error al registrar alimentación:', err);
      setMessage({ type: 'error', text: 'Error al registrar alimentación. Intenta de nuevo.' });
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
    return <Alert severity="info">Selecciona un galpón para registrar la alimentación.</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Alimentación Diaria
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpón seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          select
          label="Tipo de Alimento"
          value={productoAlimentoCodigo}
          onChange={(e) => setProductoAlimentoCodigo(Number(e.target.value))}
          fullWidth
          margin="normal"
          required
        >
          {productosAlimento.map((producto) => (
            <MenuItem key={producto.codigo} value={producto.codigo}>
              {producto.descripcion}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Cantidad de Bultos"
          type="number"
          value={cantidadBultos}
          onChange={(e) => setCantidadBultos(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 0 }}
        />
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
          {loading ? 'Registrando...' : 'Registrar Alimentación'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AlimentacionForm;
