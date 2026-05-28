import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { RefreshCw } from 'lucide-react';
import type { Finca } from '../models/Finca';
import type { Galpon } from '../models/Galpon';
import FincaService from '../services/FincaService';
import GalponService from '../services/GalponService';
import OperarioService, { type GalponAssignmentOwner, type OperarioProfile } from '../services/OperarioService';

const OperariosAsignacionesScreen = () => {
  const [operarios, setOperarios] = useState<OperarioProfile[]>([]);
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [selectedOperarioId, setSelectedOperarioId] = useState('');
  const [selectedFincaId, setSelectedFincaId] = useState('');
  const [assignedGalponIds, setAssignedGalponIds] = useState<Set<number>>(new Set());
  const [galponOwners, setGalponOwners] = useState<GalponAssignmentOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [operariosData, fincasData, galponesData, ownersData] = await Promise.all([
        OperarioService.getOperarios(),
        FincaService.getAllFincas(),
        GalponService.getAllGalpones(),
        OperarioService.getAllGalponAssignments(),
      ]);
      setOperarios(operariosData);
      setFincas(fincasData);
      setGalpones(galponesData);
      setGalponOwners(ownersData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar datos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBaseData();
  }, [loadBaseData]);

  const loadAssignments = useCallback(async () => {
    if (!selectedOperarioId) {
      setAssignedGalponIds(new Set());
      return;
    }
    setLoadingAssignments(true);
    setMessage(null);
    try {
      const assignments = await OperarioService.getOperarioAssignments(selectedOperarioId);
      const ids = new Set<number>(assignments.map((row) => row.galpon_id));
      setAssignedGalponIds(ids);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar asignaciones.';
      setError(message);
    } finally {
      setLoadingAssignments(false);
    }
  }, [selectedOperarioId]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const filteredGalpones = useMemo(() => {
    if (!selectedFincaId) return [];
    const fincaId = Number(selectedFincaId);
    return galpones.filter((galpon) => galpon.finca_id === fincaId);
  }, [galpones, selectedFincaId]);

  const selectedOperario = useMemo(
    () => operarios.find((item) => item.id === selectedOperarioId),
    [operarios, selectedOperarioId],
  );

  const selectedFinca = useMemo(
    () => fincas.find((item) => item.id === Number(selectedFincaId)),
    [fincas, selectedFincaId],
  );

  const galponOwnerById = useMemo(() => {
    const map = new Map<number, GalponAssignmentOwner>();
    for (const owner of galponOwners) {
      map.set(owner.galpon_id, owner);
    }
    return map;
  }, [galponOwners]);

  const isGalponLockedByOther = (galponId: number) => {
    if (!selectedOperarioId) return false;
    const owner = galponOwnerById.get(galponId);
    return owner != null && owner.operario_id !== selectedOperarioId;
  };

  const toggleGalpon = (galponId: number) => {
    if (isGalponLockedByOther(galponId)) return;
    setAssignedGalponIds((prev) => {
      const next = new Set(prev);
      if (next.has(galponId)) {
        next.delete(galponId);
      } else {
        next.add(galponId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedOperarioId || !selectedFincaId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const fincaId = Number(selectedFincaId);
      const desired = filteredGalpones
        .filter((galpon) => assignedGalponIds.has(galpon.id))
        .map((galpon) => galpon.id);
      await OperarioService.setAssignmentsForFinca(selectedOperarioId, fincaId, desired);
      setMessage('Asignaciones actualizadas.');
      const ownersData = await OperarioService.getAllGalponAssignments();
      setGalponOwners(ownersData);
      await loadAssignments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible guardar asignaciones.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const assignedInFinca = useMemo(() => {
    if (!selectedFincaId) return 0;
    const fincaId = Number(selectedFincaId);
    return galpones
      .filter((galpon) => galpon.finca_id === fincaId)
      .filter((galpon) => assignedGalponIds.has(galpon.id)).length;
  }, [galpones, selectedFincaId, assignedGalponIds]);

  const assignmentsSummary = useMemo(() => {
    if (!selectedOperarioId) return [];
    const map = new Map<number, { fincaId: number; fincaNombre: string; galpones: string[] }>();
    for (const galpon of galpones) {
      if (!assignedGalponIds.has(galpon.id)) continue;
      const finca = fincas.find((item) => item.id === galpon.finca_id);
      const fincaNombre = finca?.nombre ?? `Finca ${galpon.finca_id}`;
      const entry = map.get(galpon.finca_id) ?? {
        fincaId: galpon.finca_id,
        fincaNombre,
        galpones: [],
      };
      entry.galpones.push(galpon.nombre);
      map.set(galpon.finca_id, entry);
    }
    return Array.from(map.values()).sort((a, b) => a.fincaId - b.fincaId);
  }, [assignedGalponIds, galpones, fincas, selectedOperarioId]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, mb: 0.5 }}>
            Administracion
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Asignaciones de operarios
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshCw size={16} strokeWidth={1.85} aria-hidden />}
          onClick={() => void loadBaseData()}
          disabled={loading}
        >
          Recargar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack spacing={2}>
          <Paper sx={{ p: 2, borderRadius: 'var(--ds-radius-lg, 10px)' }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Operario"
                  value={selectedOperarioId}
                  onChange={(event) => setSelectedOperarioId(event.target.value)}
                  fullWidth
                  disabled={operarios.length === 0}
                >
                  {operarios.length === 0 ? (
                    <MenuItem value="">No hay operarios</MenuItem>
                  ) : (
                    operarios.map((operario) => (
                      <MenuItem key={operario.id} value={operario.id}>
                        {operario.email || operario.id}
                      </MenuItem>
                    ))
                  )}
                </TextField>
                <TextField
                  select
                  label="Finca"
                  value={selectedFincaId}
                  onChange={(event) => setSelectedFincaId(event.target.value)}
                  fullWidth
                  disabled={fincas.length === 0}
                >
                  {fincas.length === 0 ? (
                    <MenuItem value="">No hay fincas</MenuItem>
                  ) : (
                    fincas.map((finca) => (
                      <MenuItem key={finca.id} value={finca.id.toString()}>
                        {finca.nombre}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Operario seleccionado: {selectedOperario?.email || (selectedOperarioId ? selectedOperarioId : 'Ninguno')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Finca seleccionada: {selectedFinca?.nombre || (selectedFincaId ? `Finca ${selectedFincaId}` : 'Ninguna')}
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 'var(--ds-radius-lg, 10px)' }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Galpones disponibles
              </Typography>
              {loadingAssignments ? (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  {!selectedOperarioId || !selectedFincaId ? (
                    <Alert severity="info">
                      Selecciona un operario y una finca para configurar los galpones.
                    </Alert>
                  ) : filteredGalpones.length === 0 ? (
                    <Alert severity="warning">
                      No hay galpones disponibles para la finca seleccionada.
                    </Alert>
                  ) : (
                    <FormGroup>
                      {filteredGalpones.map((galpon) => {
                        const locked = isGalponLockedByOther(galpon.id);
                        const owner = galponOwnerById.get(galpon.id);
                        const ownerLabel = owner?.operario_email ?? owner?.operario_id;
                        return (
                          <FormControlLabel
                            key={galpon.id}
                            control={(
                              <Checkbox
                                checked={assignedGalponIds.has(galpon.id)}
                                onChange={() => toggleGalpon(galpon.id)}
                                disabled={saving || locked}
                              />
                            )}
                            label={locked
                              ? `${galpon.nombre} (ID ${galpon.id}) — asignado a ${ownerLabel}`
                              : `${galpon.nombre} (ID ${galpon.id})`}
                          />
                        );
                      })}
                    </FormGroup>
                  )}
                </>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={!selectedOperarioId || !selectedFincaId || saving || loadingAssignments}
                >
                  {saving ? 'Guardando...' : 'Guardar asignaciones'}
                </Button>
                {selectedFincaId && (
                  <Typography variant="body2" color="text.secondary">
                    Galpones asignados en esta finca: {assignedInFinca}
                  </Typography>
                )}
              </Stack>

              {message && (
                <Alert severity="success" variant="outlined">
                  {message}
                </Alert>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 'var(--ds-radius-lg, 10px)' }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Resumen de asignaciones actuales
              </Typography>
              {!selectedOperarioId ? (
                <Alert severity="info">Selecciona un operario para ver el resumen.</Alert>
              ) : assignmentsSummary.length === 0 ? (
                <Alert severity="warning">El operario no tiene galpones asignados.</Alert>
              ) : (
                assignmentsSummary.map((item) => (
                  <Box key={item.fincaId}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.fincaNombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.galpones.join(', ')}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Stack>
      )}
    </Box>
  );
};

export default OperariosAsignacionesScreen;
