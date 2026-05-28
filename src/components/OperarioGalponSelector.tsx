import { useMemo, useState } from 'react';
import { Alert, Chip, MenuItem, Stack, TextField } from '@mui/material';
import type { Galpon } from '../models/Galpon';

interface OperarioGalponSelectorProps {
  assignedGalpones: Galpon[];
  selectedGalpon: Galpon | null;
  onSelectGalpon: (galpon: Galpon | null) => void;
}

const OperarioGalponSelector = ({
  assignedGalpones,
  selectedGalpon,
  onSelectGalpon,
}: OperarioGalponSelectorProps) => {
  const fincaMap = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string }>();
    for (const galpon of assignedGalpones) {
      if (galpon.fincas?.nombre) {
        map.set(galpon.finca_id, { id: galpon.finca_id, nombre: galpon.fincas.nombre });
      }
    }
    return map;
  }, [assignedGalpones]);

  const assignedFincaIds = useMemo(
    () => Array.from(new Set(assignedGalpones.map((galpon) => galpon.finca_id))),
    [assignedGalpones],
  );

  const defaultFincaId = useMemo(() => {
    if (selectedGalpon) return selectedGalpon.finca_id.toString();
    if (assignedFincaIds.length > 0) return assignedFincaIds[0].toString();
    return '';
  }, [selectedGalpon, assignedFincaIds]);

  const [fincaOverride, setFincaOverride] = useState<string | null>(null);
  const selectedFincaId = fincaOverride ?? defaultFincaId;

  const filteredGalpones = useMemo(() => {
    if (!selectedFincaId) return [];
    const fincaId = Number(selectedFincaId);
    return assignedGalpones.filter((galpon) => galpon.finca_id === fincaId);
  }, [assignedGalpones, selectedFincaId]);

  const selectedFincaLabel = selectedFincaId
    ? (fincaMap.get(Number(selectedFincaId))?.nombre ?? `Finca ${selectedFincaId}`)
    : '';

  if (assignedGalpones.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        No hay galpon asignado actualmente.
      </Alert>
    );
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
      <TextField
        select
        label="Finca"
        value={selectedFincaId}
        onChange={(event) => setFincaOverride(event.target.value)}
        sx={{ minWidth: 220 }}
        disabled={assignedFincaIds.length === 0}
      >
        {assignedFincaIds.map((id) => {
          const finca = fincaMap.get(id);
          const label = finca ? finca.nombre : `Finca ${id}`;
          return (
            <MenuItem key={id} value={id.toString()}>
              {label}
            </MenuItem>
          );
        })}
      </TextField>
      <TextField
        select
        label="Galpon"
        value={selectedGalpon?.id ? selectedGalpon.id.toString() : ''}
        onChange={(event) => {
          const galponId = Number(event.target.value);
          const galpon = assignedGalpones.find((item) => item.id === galponId) ?? null;
          onSelectGalpon(galpon);
        }}
        sx={{ minWidth: 240 }}
        disabled={!selectedFincaId || filteredGalpones.length === 0}
      >
        {filteredGalpones.map((galpon) => (
          <MenuItem key={galpon.id} value={galpon.id.toString()}>
            {galpon.nombre}
          </MenuItem>
        ))}
      </TextField>
      {selectedGalpon && (
        <Chip
          label={`Activo: ${selectedFincaLabel} · ${selectedGalpon.nombre}`}
          variant="outlined"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        />
      )}
    </Stack>
  );
};

export default OperarioGalponSelector;
