import React, { useEffect, useState } from 'react';
import { Alert, Box, MenuItem, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import { useFormSubmit } from '../hooks/useFormSubmit';
import RegistroDiarioGalponService from '../services/RegistroDiarioGalponService';
import FormShell from './FormShell';
import SubmitButton from './SubmitButton';

interface CausaMortalidad {
  codigo: string;
  descripcion: string;
}

const MortalidadForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const { loading, message, setMessage, handleSubmit: submitWithLoading } = useFormSubmit();
  const [causaMortalidadCodigo, setCausaMortalidadCodigo] = useState<string>('');
  const [numeroAvesMuertas, setNumeroAvesMuertas] = useState<number | ''>('');
  const [causasMortalidad, setCausasMortalidad] = useState<CausaMortalidad[]>([]);
  const [loadingCausas, setLoadingCausas] = useState(true);
  const [errorCausas, setErrorCausas] = useState<Error | null>(null);

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
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
      return;
    }

    const numeroAvesMuertasNum = Number(numeroAvesMuertas);
    if (
      causaMortalidadCodigo === ''
      || numeroAvesMuertas === ''
      || !Number.isFinite(numeroAvesMuertasNum)
      || numeroAvesMuertasNum <= 0
      || !Number.isInteger(numeroAvesMuertasNum)
    ) {
      setMessage({ type: 'error', text: 'Selecciona una causa e ingresa un número entero de aves mayor a 0.' });
      return;
    }

    await submitWithLoading(async () => {
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
    }, 'No se pudo registrar la mortalidad. Intenta de nuevo.');
  };

  return (
    <FormShell
      title="Registrar Mortalidad Diaria"
      galponLabel="registrar la mortalidad"
      selectedGalpon={selectedGalpon}
      loadingGalpones={loadingGalpones}
      galponError={galponError}
      extraLoading={loadingCausas}
      extraError={errorCausas}
      extraErrorLabel="Error al cargar causas de mortalidad"
    >
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
          label="Número de Aves Muertas"
          type="number"
          value={numeroAvesMuertas}
          onChange={(e) => setNumeroAvesMuertas(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 1, max: 10000, step: 1 }}
        />
        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Antes de confirmar, valida la causa y el número de aves. Una vez registres la mortalidad, no podrás modificarla desde este formulario.
        </Alert>
        <SubmitButton loading={loading} label="Registrar mortalidad" />
      </Box>
    </FormShell>
  );
};

export default MortalidadForm;
