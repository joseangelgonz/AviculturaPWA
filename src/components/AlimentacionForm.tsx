import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ListSubheader,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Alimento } from '../models/Alimento';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import AlimentoService from '../services/AlimentoService';
import RegistroDiarioGalponService from '../services/RegistroDiarioGalponService';

const AlimentacionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [productoAlimentoCodigo, setProductoAlimentoCodigo] = useState<number | ''>('');
  const [cantidadBultos, setCantidadBultos] = useState<number | ''>('');
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<Error | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        setLoadingProductos(true);
        const alimentosData = await AlimentoService.getAllAlimentos();
        setAlimentos(alimentosData);
      } catch (err) {
        setErrorProductos(err as Error);
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchAlimentos();
  }, []);

  const alimentosPorFabricante = useMemo(() => {
    const grouped = new Map<string, Alimento[]>();
    for (const alimento of alimentos) {
      const group = grouped.get(alimento.fabricanteNombre) ?? [];
      group.push(alimento);
      grouped.set(alimento.fabricanteNombre, group);
    }
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [alimentos]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpon seleccionado.' });
      return;
    }

    const cantidadBultosNum = Number(cantidadBultos);
    if (
      productoAlimentoCodigo === ''
      || cantidadBultos === ''
      || !Number.isFinite(cantidadBultosNum)
      || cantidadBultosNum <= 0
    ) {
      setMessage({ type: 'error', text: 'Selecciona un alimento e ingresa una cantidad de bultos mayor a 0.' });
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
          cantidad_alimento_bultos: cantidadBultosNum,
        }
      );
      setMessage({ type: 'success', text: 'Alimentacion registrada exitosamente.' });
      setProductoAlimentoCodigo('');
      setCantidadBultos('');
    } catch (err: unknown) {
      console.error('Error al registrar alimentacion:', err);
      const errorMsg = err instanceof Error ? err.message : 'Intenta de nuevo.';
      setMessage({ type: 'error', text: `Error al registrar alimentacion: ${errorMsg}` });
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
    return <Alert severity="error">Error al cargar alimentos: {errorProductos.message}</Alert>;
  }

  if (!selectedGalpon) {
    return <Alert severity="info">Selecciona un galpon para registrar la alimentacion.</Alert>;
  }

  return (
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth: 560, mx: 'auto', mt: 1.5, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Alimentacion Diaria
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpon seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          select
          id="tipo-alimento"
          label="Tipo de Alimento"
          value={productoAlimentoCodigo}
          onChange={(e) => setProductoAlimentoCodigo(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="">
            Selecciona un alimento
          </MenuItem>
          {alimentosPorFabricante.map(([fabricanteNombre, alimentosDelFabricante]) => ([
            <ListSubheader key={`fab-${fabricanteNombre}`}>
              {fabricanteNombre}
            </ListSubheader>,
            ...alimentosDelFabricante.map((alimento) => (
              <MenuItem key={alimento.codigo} value={alimento.codigo}>
                {alimento.descripcion}
              </MenuItem>
            )),
          ]))}
        </TextField>
        <TextField
          id="cantidad-bultos"
          label="Cantidad de Bultos"
          type="number"
          value={cantidadBultos}
          onChange={(e) => setCantidadBultos(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 0.01, step: 0.01 }}
        />
        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          {'Antes de confirmar, revisa el tipo de alimento y la cantidad de bultos. Una vez registrada, no podr\u00e1s modificar el registro desde este formulario.'}
        </Alert>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Registrando...' : 'Registrar alimentaci\u00f3n'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AlimentacionForm;

