import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import type { Finca } from '../models/Finca';
import FincaService from '../services/FincaService';
import ProduccionService from '../services/ProduccionService';

interface FincaProduccionRow {
  fincaId: number;
  fincaNombre: string;
  fincaUbicacion: string | null;
  totalHuevos: number;
  galponesConRegistro: number;
}

interface GalponProduccionRow {
  galponId: number;
  galponNombre: string;
  fincaId: number | null;
  fincaNombre: string;
  totalHuevos: number;
}

interface ProductoProduccionRow {
  productoCodigo: number;
  productoNombre: string;
  totalHuevos: number;
  galponesConRegistro: number;
}

interface ProduccionDetalleRow {
  cantidad: number;
  galpon_id: number;
  producto_codigo: number;
  galpones: {
    finca_id: number;
    nombre: string;
    fincas: { id: number; nombre: string; ubicacion: string | null } | null;
  } | null;
  productos: { codigo: number; descripcion: string | null } | null;
}

const buildRows = (
  fincas: Finca[],
  produccionRows: ProduccionDetalleRow[],
): FincaProduccionRow[] => {
  const map = new Map<number, FincaProduccionRow & { galponIds: Set<number> }>();

  for (const row of produccionRows) {
    const fincaId = row.galpones?.finca_id;
    if (!fincaId) continue;
    const fincaInfo = row.galpones?.fincas;
    const current = map.get(fincaId) ?? {
      fincaId,
      fincaNombre: fincaInfo?.nombre ?? `Finca ${fincaId}`,
      fincaUbicacion: fincaInfo?.ubicacion ?? null,
      totalHuevos: 0,
      galponesConRegistro: 0,
      galponIds: new Set<number>(),
    };
    current.totalHuevos += row.cantidad ?? 0;
    if (Number.isFinite(row.galpon_id)) {
      current.galponIds.add(row.galpon_id);
    }
    map.set(fincaId, current);
  }

  const rows: FincaProduccionRow[] = fincas.map((finca) => {
    const existing = map.get(finca.id);
    if (!existing) {
      return {
        fincaId: finca.id,
        fincaNombre: finca.nombre,
        fincaUbicacion: finca.ubicacion ?? null,
        totalHuevos: 0,
        galponesConRegistro: 0,
      };
    }
    return {
      fincaId: finca.id,
      fincaNombre: finca.nombre,
      fincaUbicacion: finca.ubicacion ?? existing.fincaUbicacion,
      totalHuevos: existing.totalHuevos,
      galponesConRegistro: existing.galponIds.size,
    };
  });

  // In case there are production rows for fincas no longer present in the list.
  for (const value of map.values()) {
    if (!fincas.some((finca) => finca.id === value.fincaId)) {
      rows.push({
        fincaId: value.fincaId,
        fincaNombre: value.fincaNombre,
        fincaUbicacion: value.fincaUbicacion,
        totalHuevos: value.totalHuevos,
        galponesConRegistro: value.galponIds.size,
      });
    }
  }

  return rows.sort((a, b) => a.fincaId - b.fincaId);
};

const buildGalponRows = (produccionRows: ProduccionDetalleRow[]): GalponProduccionRow[] => {
  const map = new Map<number, GalponProduccionRow>();

  for (const row of produccionRows) {
    const galponId = row.galpon_id;
    const fincaId = row.galpones?.finca_id ?? null;
    const fincaNombre = row.galpones?.fincas?.nombre ?? (fincaId ? `Finca ${fincaId}` : 'Sin finca');
    const galponNombre = row.galpones?.nombre ?? `Galpon ${galponId}`;
    const current = map.get(galponId) ?? {
      galponId,
      galponNombre,
      fincaId,
      fincaNombre,
      totalHuevos: 0,
    };
    current.totalHuevos += row.cantidad ?? 0;
    map.set(galponId, current);
  }

  return Array.from(map.values()).sort((a, b) => a.galponId - b.galponId);
};

const buildProductoRows = (produccionRows: ProduccionDetalleRow[]): ProductoProduccionRow[] => {
  const map = new Map<number, ProductoProduccionRow & { galponIds: Set<number> }>();

  for (const row of produccionRows) {
    const productoCodigo = row.producto_codigo;
    const productoNombre = row.productos?.descripcion ?? `Producto ${productoCodigo}`;
    const current = map.get(productoCodigo) ?? {
      productoCodigo,
      productoNombre,
      totalHuevos: 0,
      galponesConRegistro: 0,
      galponIds: new Set<number>(),
    };
    current.totalHuevos += row.cantidad ?? 0;
    if (Number.isFinite(row.galpon_id)) {
      current.galponIds.add(row.galpon_id);
    }
    map.set(productoCodigo, current);
  }

  return Array.from(map.values())
    .map((item) => ({
      productoCodigo: item.productoCodigo,
      productoNombre: item.productoNombre,
      totalHuevos: item.totalHuevos,
      galponesConRegistro: item.galponIds.size,
    }))
    .sort((a, b) => a.productoCodigo - b.productoCodigo);
};

const ProduccionScreen = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [rows, setRows] = useState<FincaProduccionRow[]>([]);
  const [galponRows, setGalponRows] = useState<GalponProduccionRow[]>([]);
  const [productoRows, setProductoRows] = useState<ProductoProduccionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fincasData, produccionData] = await Promise.all([
        FincaService.getAllFincas(),
        ProduccionService.getProduccionDiariaDetalle(selectedDate),
      ]);
      setRows(buildRows(fincasData, produccionData));
      setGalponRows(buildGalponRows(produccionData));
      setProductoRows(buildProductoRows(produccionData));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible cargar la produccion diaria.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalGeneral = useMemo(
    () => rows.reduce((sum, row) => sum + row.totalHuevos, 0),
    [rows],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, mb: 0.5 }}>
            Administracion
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Produccion diaria
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            label="Fecha"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} strokeWidth={1.85} aria-hidden />}
            onClick={() => void loadData()}
            disabled={loading}
          >
            Recargar
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 'var(--ds-radius-lg, 10px)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Finca</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ubicacion</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Galpones con registro</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Total huevos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography sx={{ py: 2, color: 'text.secondary' }}>
                      No hay produccion registrada para la fecha seleccionada.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.fincaId} hover>
                    <TableCell>{row.fincaId}</TableCell>
                    <TableCell>{row.fincaNombre}</TableCell>
                    <TableCell>{row.fincaUbicacion || '-'}</TableCell>
                    <TableCell>{row.galponesConRegistro}</TableCell>
                    <TableCell align="right">{row.totalHuevos}</TableCell>
                  </TableRow>
                ))
              )}
              {rows.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total general</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{totalGeneral}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Paper sx={{ borderRadius: 'var(--ds-radius-lg, 10px)', overflow: 'hidden' }}>
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Desglose por galpon
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Galpon</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Finca</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Total huevos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {galponRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography sx={{ py: 2, color: 'text.secondary' }}>
                        No hay registros por galpon en la fecha seleccionada.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  galponRows.map((row) => (
                    <TableRow key={row.galponId} hover>
                      <TableCell>{row.galponNombre}</TableCell>
                      <TableCell>{row.fincaNombre}</TableCell>
                      <TableCell align="right">{row.totalHuevos}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper sx={{ borderRadius: 'var(--ds-radius-lg, 10px)', overflow: 'hidden' }}>
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Desglose por tipo de huevo
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Galpones con registro</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Total huevos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productoRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography sx={{ py: 2, color: 'text.secondary' }}>
                        No hay registros por tipo de huevo en la fecha seleccionada.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  productoRows.map((row) => (
                    <TableRow key={row.productoCodigo} hover>
                      <TableCell>{row.productoNombre}</TableCell>
                      <TableCell>{row.galponesConRegistro}</TableCell>
                      <TableCell align="right">{row.totalHuevos}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default ProduccionScreen;
