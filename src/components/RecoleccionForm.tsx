import React, { useEffect, useState } from 'react';
import { Alert, Box, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import { useFormSubmit } from '../hooks/useFormSubmit';
import RecoleccionService from '../services/RecoleccionService';
import FormShell from './FormShell';
import SubmitButton from './SubmitButton';

const RecoleccionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const { loading, message, setMessage, handleSubmit: submitWithLoading } = useFormSubmit();
  const [nextNumeroSecuencia, setNextNumeroSecuencia] = useState<number | null>(null);
  const [loadingRecoleccionData, setLoadingRecoleccionData] = useState(true);
  const [totalHuevosRecolectados, setTotalHuevosRecolectados] = useState<number | null>(null);
  const [cantidadHuevos, setCantidadHuevos] = useState<number | ''>('');

  useEffect(() => {
    const fetchRecoleccionData = async () => {
      if (!selectedGalpon) {
        setNextNumeroSecuencia(null);
        setTotalHuevosRecolectados(null);
        setLoadingRecoleccionData(false);
        return;
      }

      setLoadingRecoleccionData(true);
      try {
        const fechaActual = dayjs().format('YYYY-MM-DD');
        const [nextSeq, totalHuevos] = await Promise.all([
          RecoleccionService.getNextNumeroSecuencia(selectedGalpon.id, fechaActual),
          RecoleccionService.getTotalHuevosRecoletados(selectedGalpon.id, fechaActual),
        ]);
        setNextNumeroSecuencia(nextSeq);
        setTotalHuevosRecolectados(totalHuevos);
      } catch {
        setMessage({ type: 'error', text: 'Error al cargar los datos de recolección. Recarga la página.' });
      } finally {
        setLoadingRecoleccionData(false);
      }
    };

    fetchRecoleccionData();
  }, [selectedGalpon, setMessage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }

    const cantidadHuevosNum = Number(cantidadHuevos);
    if (
      cantidadHuevos === ''
      || !Number.isFinite(cantidadHuevosNum)
      || cantidadHuevosNum <= 0
      || !Number.isInteger(cantidadHuevosNum)
      || nextNumeroSecuencia === null
    ) {
      setMessage({
        type: 'error',
        text: 'Ingresa una cantidad entera válida mayor a 0 y espera a que se cargue el momento de recolección.',
      });
      return;
    }

    await submitWithLoading(async () => {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      await RecoleccionService.addRecoleccion(
        selectedGalpon.id,
        fechaActual,
        nextNumeroSecuencia,
        cantidadHuevosNum
      );

      setMessage({ type: 'success', text: 'Recolección registrada exitosamente.' });
      setCantidadHuevos('');

      try {
        const [newNextSeq, newTotalHuevos] = await Promise.all([
          RecoleccionService.getNextNumeroSecuencia(selectedGalpon.id, fechaActual),
          RecoleccionService.getTotalHuevosRecoletados(selectedGalpon.id, fechaActual),
        ]);
        setNextNumeroSecuencia(newNextSeq);
        setTotalHuevosRecolectados(newTotalHuevos);
      } catch {
        setNextNumeroSecuencia((prev) => (prev != null ? prev + 1 : null));
      }
    }, 'No se pudo registrar la recolección. Intenta de nuevo.');
  };

  return (
    <FormShell
      title="Registrar Recolección de Huevos"
      galponLabel="registrar la recolección"
      selectedGalpon={selectedGalpon}
      loadingGalpones={loadingGalpones}
      galponError={galponError}
      extraLoading={loadingRecoleccionData}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
          Momento de Recolección actual: <strong>{nextNumeroSecuencia}</strong>
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 2 }} color="text.secondary">
          El sistema asigna automáticamente el siguiente momento de recolección para hoy.
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
          inputProps={{ min: 1, max: 100000, step: 1 }}
        />
        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Antes de confirmar, revisa la cantidad. Una vez registres la recolección, no podrás modificarla desde este formulario.
        </Alert>
        <SubmitButton loading={loading} label="Registrar recolección" disabled={nextNumeroSecuencia === null} />
      </Box>
    </FormShell>
  );
};

export default RecoleccionForm;
