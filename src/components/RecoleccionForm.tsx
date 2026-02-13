import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import RecoleccionService from '../services/RecoleccionService';

const RecoleccionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [nextNumeroSecuencia, setNextNumeroSecuencia] = useState<number | null>(null);
  const [loadingNextNumeroSecuencia, setLoadingNextNumeroSecuencia] = useState(true);
  const [totalHuevosRecolectados, setTotalHuevosRecolectados] = useState<number | null>(null);
  const [loadingTotalHuevos, setLoadingTotalHuevos] = useState(true);
  const [cantidadHuevos, setCantidadHuevos] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchRecoleccionData = async () => {
      if (!selectedGalpon) {
        setNextNumeroSecuencia(null);
        setLoadingNextNumeroSecuencia(false);
        setTotalHuevosRecolectados(null);
        setLoadingTotalHuevos(false);
        return;
      }

      setLoadingNextNumeroSecuencia(true);
      setLoadingTotalHuevos(true);
      try {
        const fechaActual = dayjs().format('YYYY-MM-DD');
        const nextSeq = await RecoleccionService.getNextNumeroSecuencia(selectedGalpon.id, fechaActual);
        setNextNumeroSecuencia(nextSeq);

        const totalHuevos = await RecoleccionService.getTotalHuevosRecoletados(selectedGalpon.id, fechaActual);
        setTotalHuevosRecolectados(totalHuevos);
      } catch (err) {
        console.error('Error al obtener datos de recoleccion:', err);
        setMessage({ type: 'error', text: 'Error al cargar los datos de recoleccion. Recarga la pagina.' });
      } finally {
        setLoadingNextNumeroSecuencia(false);
        setLoadingTotalHuevos(false);
      }
    };

    fetchRecoleccionData();
  }, [selectedGalpon]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpon seleccionado.' });
      return;
    }

    const cantidadHuevosNum = Number(cantidadHuevos);
    if (
      cantidadHuevos === ''
      || !Number.isFinite(cantidadHuevosNum)
      || cantidadHuevosNum <= 0
      || nextNumeroSecuencia === null
    ) {
      setMessage({
        type: 'error',
        text: 'Ingresa una cantidad valida mayor a 0 y espera a que se cargue el momento de recoleccion.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      await RecoleccionService.addRecoleccion(
        selectedGalpon.id,
        fechaActual,
        nextNumeroSecuencia,
        cantidadHuevosNum
      );

      setMessage({ type: 'success', text: 'Recoleccion registrada exitosamente.' });
      setCantidadHuevos('');

      const [newNextSeq, newTotalHuevos] = await Promise.all([
        RecoleccionService.getNextNumeroSecuencia(selectedGalpon.id, fechaActual),
        RecoleccionService.getTotalHuevosRecoletados(selectedGalpon.id, fechaActual),
      ]);
      setNextNumeroSecuencia(newNextSeq);
      setTotalHuevosRecolectados(newTotalHuevos);
    } catch (err: unknown) {
      console.error('Error al registrar recoleccion:', err);
      const errorMsg = err instanceof Error ? err.message : 'Intenta de nuevo.';
      setMessage({ type: 'error', text: `Error al registrar recoleccion: ${errorMsg}` });
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
    return <Alert severity="info">Selecciona un galpon para registrar la recoleccion.</Alert>;
  }

  return (
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth: 560, mx: 'auto', mt: 1.5, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Recoleccion de Huevos
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpon seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
          Momento de Recoleccion actual: <strong>{nextNumeroSecuencia}</strong>
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 2 }} color="text.secondary">
          El sistema asigna automaticamente el siguiente momento de recoleccion para hoy.
        </Typography>
        {totalHuevosRecolectados !== null && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Total de huevos recolectados hoy: <strong>{totalHuevosRecolectados}</strong>
          </Alert>
        )}
        <TextField
          id="cantidad-huevos"
          label="Cantidad de Huevos"
          type="number"
          value={cantidadHuevos}
          onChange={(e) => setCantidadHuevos(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 1, step: 1 }}
        />
        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Antes de confirmar, revisa la cantidad. Una vez registres la recolección, no podrás modificarla desde este formulario.
        </Alert>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || nextNumeroSecuencia === null}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Registrando...' : 'Registrar recolección'}
        </Button>
      </Box>
    </Paper>
  );
};

export default RecoleccionForm;
