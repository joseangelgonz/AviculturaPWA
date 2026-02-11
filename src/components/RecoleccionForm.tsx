import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import RecoleccionService from '../services/RecoleccionService';
import dayjs from 'dayjs'; // Para manejar fechas

const RecoleccionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [nextNumeroSecuencia, setNextNumeroSecuencia] = useState<number | null>(null);
  const [loadingNextNumeroSecuencia, setLoadingNextNumeroSecuencia] = useState(true);
  const [totalHuevosRecoletados, setTotalHuevosRecoletados] = useState<number | null>(null);
  const [loadingTotalHuevos, setLoadingTotalHuevos] = useState(true);
  const [cantidadHuevos, setCantidadHuevos] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchRecoleccionData = async () => {
      if (selectedGalpon) {
        setLoadingNextNumeroSecuencia(true);
        setLoadingTotalHuevos(true);
        try {
          const fechaActual = dayjs().format('YYYY-MM-DD');
          
          // Fetch next sequence number
          const nextSeq = await RecoleccionService.getNextNumeroSecuencia(selectedGalpon.id, fechaActual);
          setNextNumeroSecuencia(nextSeq);

          // Fetch total collected eggs
          const totalHuevos = await RecoleccionService.getTotalHuevosRecoletados(selectedGalpon.id, fechaActual);
          setTotalHuevosRecoletados(totalHuevos);

        } catch (err) {
          console.error('Error al obtener datos de recolección:', err);
          setMessage({ type: 'error', text: 'Error al cargar los datos de recolección. Recarga la página.' });
        } finally {
          setLoadingNextNumeroSecuencia(false);
          setLoadingTotalHuevos(false);
        }
      } else {
        setNextNumeroSecuencia(null);
        setLoadingNextNumeroSecuencia(false);
        setTotalHuevosRecoletados(null);
        setLoadingTotalHuevos(false);
      }
    };
    fetchRecoleccionData();
  }, [selectedGalpon]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }
    if (cantidadHuevos === '' || nextNumeroSecuencia === null) {
      setMessage({ type: 'error', text: 'Por favor, completa la cantidad de huevos y asegúrate de que el momento de recolección esté cargado.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      await RecoleccionService.addRecoleccion(
        selectedGalpon.id,
        fechaActual,
        nextNumeroSecuencia, // Usa el número de secuencia obtenido automáticamente
        Number(cantidadHuevos)
      );
      setMessage({ type: 'success', text: 'Recolección registrada exitosamente.' });
      setCantidadHuevos('');
      // Después de registrar, vuelve a obtener el siguiente número de secuencia
      const newNextSeq = await RecoleccionService.getNextNumeroSecuencia(selectedGalpon.id, fechaActual);
      setNextNumeroSecuencia(newNextSeq);
      // Y también vuelve a obtener el total de huevos recolectados
      const newTotalHuevos = await RecoleccionService.getTotalHuevosRecoletados(selectedGalpon.id, fechaActual);
      setTotalHuevosRecoletados(newTotalHuevos);
    } catch (err: unknown) {
      console.error('Error al registrar recolección:', err);
      const errorMsg = err instanceof Error ? err.message : 'Intenta de nuevo.';
      setMessage({ type: 'error', text: `Error al registrar recolección: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGalpones || loadingNextNumeroSecuencia || loadingTotalHuevos) {
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
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth: 560, mx: 'auto', mt: 1.5, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Recolección de Huevos
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpón seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
          Momento de Recolección Actual: <strong>{nextNumeroSecuencia}</strong>
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 2 }} color="text.secondary">
          El sistema asigna automáticamente el siguiente momento de recolección para hoy.
        </Typography>
        {totalHuevosRecoletados !== null && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Total de huevos recolectados hoy: <strong>{totalHuevosRecoletados}</strong>
          </Alert>
        )}
        <TextField
          id="cantidad-huevos"
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
          startIcon={loading ? <CircularProgress size={20} /> : <span />}
        >
          {loading ? 'Registrando...' : 'Registrar Recolección'}
        </Button>
      </Box>
    </Paper>
  );
};

export default RecoleccionForm;
