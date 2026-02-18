import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, ListSubheader, MenuItem, TextField } from '@mui/material';
import dayjs from 'dayjs';
import type { Alimento } from '../models/Alimento';
import { useSelectedGalpon } from '../hooks/useSelectedGalpon';
import { useFormSubmit } from '../hooks/useFormSubmit';
import AlimentoService from '../services/AlimentoService';
import RegistroDiarioGalponService from '../services/RegistroDiarioGalponService';
import FormShell from './FormShell';
import SubmitButton from './SubmitButton';

const AlimentacionForm = () => {
  const { selectedGalpon, loading: loadingGalpones, error: galponError } = useSelectedGalpon();
  const { loading, message, setMessage, handleSubmit: submitWithLoading } = useFormSubmit();
  const [productoAlimentoCodigo, setProductoAlimentoCodigo] = useState<number | ''>('');
  const [cantidadBultos, setCantidadBultos] = useState<number | ''>('');
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<Error | null>(null);

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
      const group = grouped.get(alimento.fabricante_nombre) ?? [];
      group.push(alimento);
      grouped.set(alimento.fabricante_nombre, group);
    }
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [alimentos]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedGalpon) {
      setMessage({ type: 'error', text: 'No hay galpón seleccionado.' });
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

    await submitWithLoading(async () => {
      const fechaActual = dayjs().format('YYYY-MM-DD');
      await RegistroDiarioGalponService.upsertRegistroDiario(
        selectedGalpon.id,
        fechaActual,
        {
          producto_alimento_codigo: Number(productoAlimentoCodigo),
          cantidad_alimento_bultos: cantidadBultosNum,
        }
      );
      setMessage({ type: 'success', text: 'Alimentación registrada exitosamente.' });
      setProductoAlimentoCodigo('');
      setCantidadBultos('');
    }, 'No se pudo registrar la alimentación. Intenta de nuevo.');
  };

  return (
    <FormShell
      title="Registrar Alimentación Diaria"
      galponLabel="registrar la alimentación"
      selectedGalpon={selectedGalpon}
      loadingGalpones={loadingGalpones}
      galponError={galponError}
      extraLoading={loadingProductos}
      extraError={errorProductos}
      extraErrorLabel="Error al cargar alimentos"
    >
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
          {alimentosPorFabricante.flatMap(([fabricanteNombre, alimentosDelFabricante]) => [
            <ListSubheader key={`fab-${fabricanteNombre}`}>
              {fabricanteNombre}
            </ListSubheader>,
            ...alimentosDelFabricante.map((alimento) => (
              <MenuItem key={alimento.codigo} value={alimento.codigo}>
                {alimento.descripcion}
              </MenuItem>
            )),
          ])}
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
          inputProps={{ min: 0.01, max: 9999, step: 0.01 }}
        />
        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Antes de confirmar, revisa el tipo de alimento y la cantidad de bultos. Una vez registrada, no podrás modificar el registro desde este formulario.
        </Alert>
        <SubmitButton loading={loading} label="Registrar alimentación" />
      </Box>
    </FormShell>
  );
};

export default AlimentacionForm;
