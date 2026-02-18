import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import type { Producto } from '../models/Producto';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import { useFormSubmit } from '../hooks/useFormSubmit';
import ProduccionService from '../services/ProduccionService';
import ProductoService from '../services/ProductoService';
import SubmitButton from './SubmitButton';

interface ClasificacionEntry {
  id: number;
  producto_codigo: number | '';
  cantidad: number | '';
}

const ClasificacionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const { loading, message, setMessage, handleSubmit: submitWithLoading } = useFormSubmit();
  const [entries, setEntries] = useState<ClasificacionEntry[]>([{ id: 1, producto_codigo: '', cantidad: '' }]);
  const [productosHuevo, setProductosHuevo] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<Error | null>(null);
  const [nextEntryId, setNextEntryId] = useState(2);
  const [hasDailyClasificacion, setHasDailyClasificacion] = useState(false);
  const [loadingDailyCheck, setLoadingDailyCheck] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [minDate, setMinDate] = useState<string>('');
  const [maxDate, setMaxDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [loadingLastDate, setLoadingLastDate] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoadingProductos(true);
        const productos = await ProductoService.getAllProductos();
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
    const loadGalponData = async () => {
      if (!selectedGalpon) {
        setMinDate('');
        setSelectedDate('');
        setHasDailyClasificacion(false);
        setLoadingLastDate(false);
        setLoadingDailyCheck(false);
        return;
      }

      setLoadingLastDate(true);
      setLoadingDailyCheck(true);
      try {
        const lastDate = await ProduccionService.getLastProduccionDate(selectedGalpon.id);
        const fechaActual = dayjs().format('YYYY-MM-DD');
        let computedDate = '';

        if (lastDate) {
          const nextDay = dayjs(lastDate).add(1, 'day').format('YYYY-MM-DD');
          setMinDate(nextDay);
          computedDate = dayjs(nextDay).isAfter(dayjs(), 'day') ? '' : nextDay;
        } else {
          setMinDate(fechaActual);
          computedDate = fechaActual;
        }

        setSelectedDate(computedDate);
        setMaxDate(fechaActual);
        setLoadingLastDate(false);

        if (computedDate) {
          const exists = await ProduccionService.checkDailyClasificacionExists(
            selectedGalpon.id,
            computedDate
          );
          setHasDailyClasificacion(exists);
        } else {
          setHasDailyClasificacion(false);
        }
      } catch {
        setMessage({ type: 'error', text: 'Error al cargar datos. Recarga la página.' });
      } finally {
        setLoadingLastDate(false);
        setLoadingDailyCheck(false);
      }
    };

    loadGalponData();
  }, [selectedGalpon, setMessage]);

  // Re-check cuando el usuario cambia la fecha manualmente
  useEffect(() => {
    if (!selectedGalpon || !selectedDate) return;

    const checkExistingClasificacion = async () => {
      setLoadingDailyCheck(true);
      try {
        const exists = await ProduccionService.checkDailyClasificacionExists(
          selectedGalpon.id,
          selectedDate
        );
        setHasDailyClasificacion(exists);
      } catch {
        setMessage({ type: 'error', text: 'Error al verificar clasificación diaria. Recarga la página.' });
      } finally {
        setLoadingDailyCheck(false);
      }
    };

    checkExistingClasificacion();
  }, [selectedGalpon, selectedDate, setMessage]);

  const handleAddEntry = () => {
    setEntries((prevEntries) => [...prevEntries, { id: nextEntryId, producto_codigo: '', cantidad: '' }]);
    setNextEntryId((prevId) => prevId + 1);
  };

  const handleDeleteEntry = (id: number) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const handleChangeEntry = (
    id: number,
    field: keyof ClasificacionEntry,
    value: number | ''
  ) => {
    if (field === 'producto_codigo' && value !== '') {
      const isDuplicate = entries.some(
        (entry) => entry.id !== id && entry.producto_codigo === value
      );
      if (isDuplicate) {
        setMessage({ type: 'error', text: 'Este tipo de huevo ya fue seleccionado en otra línea.' });
        return;
      }
      setMessage(null);
    }

    setEntries((prevEntries) =>
      prevEntries.map((entry) => (
        entry.id === id ? { ...entry, [field]: value } : entry
      ))
    );
  };

  const totalCantidadHuevos = useMemo(
    () => entries.reduce((sum, entry) => sum + (Number(entry.cantidad) || 0), 0),
    [entries]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }

    if (!selectedDate || (minDate && selectedDate < minDate) || (maxDate && selectedDate > maxDate)) {
      setMessage({ type: 'error', text: 'Selecciona una fecha válida dentro del rango permitido.' });
      return;
    }

    const validEntries = entries.filter(
      (entry) => entry.producto_codigo !== '' && entry.cantidad !== '' && Number(entry.cantidad) > 0
    );
    if (validEntries.length === 0) {
      setMessage({ type: 'error', text: 'Agrega al menos una línea válida con cantidad mayor a 0.' });
      return;
    }

    const hasNonInteger = validEntries.some((entry) => !Number.isInteger(Number(entry.cantidad)));
    if (hasNonInteger) {
      setMessage({ type: 'error', text: 'Las cantidades deben ser números enteros.' });
      return;
    }

    await submitWithLoading(async () => {
      await ProduccionService.addClasificacionBatch(
        selectedGalpon.id,
        selectedDate,
        validEntries.map((entry) => ({
          producto_codigo: Number(entry.producto_codigo),
          cantidad: Number(entry.cantidad),
        }))
      );

      setMessage({ type: 'success', text: 'Clasificación registrada exitosamente.' });
      setEntries([{ id: 1, producto_codigo: '', cantidad: '' }]);
      setNextEntryId(2);
      setHasDailyClasificacion(true);
    }, 'No se pudo registrar la clasificación. Intenta de nuevo.');
  };

  if (loadingGalpones || loadingProductos || loadingDailyCheck || loadingLastDate) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (hasDailyClasificacion) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Ya existe un registro de clasificación para el galpón {selectedGalpon?.nombre} en la fecha {selectedDate}. Solo se permite un registro por día.
      </Alert>
    );
  }

  if (selectedGalpon && minDate && dayjs(minDate).isAfter(dayjs(), 'day')) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No hay fechas disponibles para registrar clasificación. El día siguiente al último registro ({dayjs(minDate).subtract(1, 'day').format('YYYY-MM-DD')}) es posterior a hoy.
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
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth: 860, mx: 'auto', mt: 1.5, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Clasificación de Huevos
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpón seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              id="fecha-clasificacion"
              label="Fecha de Clasificación"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              fullWidth
              required
              inputProps={{
                min: minDate,
                max: maxDate,
              }}
              InputLabelProps={{
                shrink: true,
              }}
              helperText={
                minDate
                  ? `Selecciona una fecha entre ${dayjs(minDate).format('DD/MM/YYYY')} y ${dayjs(maxDate).format('DD/MM/YYYY')}`
                  : 'Selecciona una fecha'
              }
              sx={{ mb: 2 }}
            />
          </Grid>
          {entries.map((entry) => (
            <Grid container size={12} spacing={2} key={entry.id} alignItems="center">
              <Grid size={6}>
                <TextField
                  select
                  id={`tipo-huevo-${entry.id}`}
                  label="Tipo de Huevo"
                  value={entry.producto_codigo}
                  onChange={(e) => handleChangeEntry(entry.id, 'producto_codigo', e.target.value === '' ? '' : Number(e.target.value))}
                  fullWidth
                  required
                >
                  <MenuItem value="">
                    Selecciona un tipo
                  </MenuItem>
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
                  onChange={(e) => handleChangeEntry(entry.id, 'cantidad', e.target.value === '' ? '' : Number(e.target.value))}
                  fullWidth
                  required
                  inputProps={{ min: 1, max: 100000, step: 1 }}
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

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Total de Huevos: <span>{totalCantidadHuevos}</span>
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Antes de confirmar, revisa todas las líneas y cantidades. Una vez registres la clasificación, no podrás modificarla desde este formulario.
        </Alert>
        <SubmitButton loading={loading} label="Registrar clasificación" />
      </Box>
    </Paper>
  );
};

export default ClasificacionForm;
