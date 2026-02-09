import React, { useState } from 'react';
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
import RecoleccionService from '../services/RecoleccionService';
import dayjs from 'dayjs'; // Para manejar fechas

const RecoleccionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [numeroSecuencia, setNumeroSecuencia] = useState<number | string>('');
  const [cantidadHuevos, setCantidadHuevos] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }
    if (numeroSecuencia === '' || cantidadHuevos === '') {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      await RecoleccionService.addRecoleccion(
        selectedGalpon.id,
        fechaActual,
        Number(numeroSecuencia),
        Number(cantidadHuevos)
      );
      setMessage({ type: 'success', text: 'Recolección registrada exitosamente.' });
      setNumeroSecuencia('');
      setCantidadHuevos('');
    } catch (err) {
      console.error('Error al registrar recolección:', err);
      setMessage({ type: 'error', text: 'Error al registrar recolección. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGalpones) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (galponError) {
    return <Alert severity="error">Error al cargar galpones: {galponError.message}</Alert>;
  }

  if (!selectedGalpon) {
    return <Alert severity="info">Selecciona un galpón para registrar la recolección.</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Recolección de Huevos
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpón seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          select
          label="Momento de Recolección"
          value={numeroSecuencia}
          onChange={(e) => setNumeroSecuencia(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value={1}>1ra Recolección</MenuItem>
          <MenuItem value={2}>2da Recolección</MenuItem>
          <MenuItem value={3}>3ra Recolección</MenuItem>
          <MenuItem value={4}>4ta Recolección</MenuItem>
        </TextField>
        <TextField
          label="Cantidad de Huevos"
          type="number"
          value={cantidadHuevos}
          onChange={(e) => setCantidadHuevos(e.target.value)}
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
          {loading ? 'Registrando...' : 'Registrar Recolección'}
        </Button>
      </Box>
    </Paper>
  );
};

export default RecoleccionForm;
