import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import RegistroDiarioGalponService from '../services/RegistroDiarioGalponService';

interface CausaMortalidad {
  codigo: string;
  descripcion: string;
}

const MortalidadForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const [causaMortalidadCodigo, setCausaMortalidadCodigo] = useState<string>('');
  const [numeroAvesMuertas, setNumeroAvesMuertas] = useState<number | ''>('');
  const [causasMortalidad, setCausasMortalidad] = useState<CausaMortalidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCausas, setLoadingCausas] = useState(true);
  const [errorCausas, setErrorCausas] = useState<Error | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchCausas = async () => {
      try {
        setLoadingCausas(true);
        const causas = await RegistroDiarioGalponService.getCausasMortalidad();
        setCausasMortalidad(causas);
      } catch (err) {
        setErrorCausas(err as Error);
      } finally {
        setLoadingCausas(false);
      }
    };

    fetchCausas();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpon seleccionado.' });
      return;
    }

    const numeroAvesMuertasNum = Number(numeroAvesMuertas);
    if (
      causaMortalidadCodigo === ''
      || numeroAvesMuertas === ''
      || !Number.isFinite(numeroAvesMuertasNum)
      || numeroAvesMuertasNum <= 0
    ) {
      setMessage({ type: 'error', text: 'Selecciona una causa e ingresa un numero de aves mayor a 0.' });
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
          numero_aves_muertas: numeroAvesMuertasNum,
          causa_mortalidad_codigo: causaMortalidadCodigo,
        }
      );
      setMessage({ type: 'success', text: 'Mortalidad registrada exitosamente.' });
      setCausaMortalidadCodigo('');
      setNumeroAvesMuertas('');
    } catch (err: unknown) {
      console.error('Error al registrar mortalidad:', err);
      const errorMsg = err instanceof Error ? err.message : 'Intenta de nuevo.';
      setMessage({ type: 'error', text: `Error al registrar mortalidad: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGalpones || loadingCausas) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (galponError) {
    return <Alert severity="error">Error al cargar galpones: {galponError.message}</Alert>;
  }

  if (errorCausas) {
    return <Alert severity="error" variant="outlined">Error al cargar causas de mortalidad: {errorCausas.message}</Alert>;
  }

  if (!selectedGalpon) {
    return <Alert severity="info">Selecciona un galpon para registrar la mortalidad.</Alert>;
  }

  return (
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth: 560, mx: 'auto', mt: 1.5, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Mortalidad Diaria
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpon seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          select
          id="causa-mortalidad"
          label="Causa de Mortalidad"
          value={causaMortalidadCodigo}
          onChange={(e) => setCausaMortalidadCodigo(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="">
            Selecciona una causa
          </MenuItem>
          {causasMortalidad.map((causa) => (
            <MenuItem key={causa.codigo} value={causa.codigo}>
              {causa.descripcion}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="numero-aves-muertas"
          label="Numero de Aves Muertas"
          type="number"
          value={numeroAvesMuertas}
          onChange={(e) => setNumeroAvesMuertas(e.target.value === '' ? '' : Number(e.target.value))}
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
          Antes de confirmar, valida la causa y el número de aves. Una vez registres la mortalidad, no podrás modificarla desde este formulario.
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
          {loading ? 'Registrando...' : 'Registrar mortalidad'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MortalidadForm;
