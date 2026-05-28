import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
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
  fincaId: number | null;
  fincaNombre: string;
  totalHuevos: number;
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
  const map = new Map<string, ProductoProduccionRow>();

  for (const row of produccionRows) {
    const productoCodigo = row.producto_codigo;
    const productoNombre = row.productos?.descripcion ?? `Producto ${productoCodigo}`;
    const fincaId = row.galpones?.finca_id ?? null;
    const fincaNombre = row.galpones?.fincas?.nombre ?? (fincaId ? `Finca ${fincaId}` : 'Sin finca');
    const key = `${productoCodigo}-${fincaId ?? 'sin-finca'}`;
    const current = map.get(key) ?? {
      productoCodigo,
      productoNombre,
      fincaId,
      fincaNombre,
      totalHuevos: 0,
    };
    current.totalHuevos += row.cantidad ?? 0;
    map.set(key, current);
  }

  return Array.from(map.values())
    .sort((a, b) => {
      if (a.fincaNombre !== b.fincaNombre) {
        return a.fincaNombre.localeCompare(b.fincaNombre);
      }
      if (a.productoNombre !== b.productoNombre) {
        return a.productoNombre.localeCompare(b.productoNombre);
      }
      return a.productoCodigo - b.productoCodigo;
    });
};

interface ProductoMatrixRow {
  productoCodigo: number;
  productoNombre: string;
  valoresPorFinca: Record<string, number>;
  totalHuevos: number;
}

const buildProductoMatrix = (productoRows: ProductoProduccionRow[]) => {
  const fincaMap = new Map<string, { fincaId: number | null; fincaNombre: string }>();
  const productoMap = new Map<number, ProductoMatrixRow>();

  for (const row of productoRows) {
    const fincaKey = `${row.fincaId ?? 'sin-finca'}`;
    if (!fincaMap.has(fincaKey)) {
      fincaMap.set(fincaKey, {
        fincaId: row.fincaId,
        fincaNombre: row.fincaNombre,
      });
    }

    const current = productoMap.get(row.productoCodigo) ?? {
      productoCodigo: row.productoCodigo,
      productoNombre: row.productoNombre,
      valoresPorFinca: {},
      totalHuevos: 0,
    };

    current.valoresPorFinca[fincaKey] = row.totalHuevos;
    current.totalHuevos += row.totalHuevos;
    productoMap.set(row.productoCodigo, current);
  }

  const fincas = Array.from(fincaMap.values()).sort((a, b) => {
    if (a.fincaNombre !== b.fincaNombre) {
      return a.fincaNombre.localeCompare(b.fincaNombre);
    }
    return (a.fincaId ?? 0) - (b.fincaId ?? 0);
  });

  const productos = Array.from(productoMap.values()).sort((a, b) => {
    if (a.productoNombre !== b.productoNombre) {
      return a.productoNombre.localeCompare(b.productoNombre);
    }
    return a.productoCodigo - b.productoCodigo;
  });

  return { fincas, productos };
};

const FINCA_CARD_LAYOUT_THRESHOLD = 3;
const FINCA_MATRIX_TAB_THRESHOLD = 3;

const ProduccionScreen = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [rows, setRows] = useState<FincaProduccionRow[]>([]);
  const [galponRows, setGalponRows] = useState<GalponProduccionRow[]>([]);
  const [productoRows, setProductoRows] = useState<ProductoProduccionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matrixTab, setMatrixTab] = useState(0);

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
  const productoMatrix = useMemo(() => buildProductoMatrix(productoRows), [productoRows]);
  const useFincaCards = rows.length > FINCA_CARD_LAYOUT_THRESHOLD;
  const useMatrixTabs = productoMatrix.fincas.length > FINCA_MATRIX_TAB_THRESHOLD;

  useEffect(() => {
    setMatrixTab(0);
  }, [selectedDate, productoMatrix.fincas.length]);

  const productoMatrixTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const finca of productoMatrix.fincas) {
      const fincaKey = `${finca.fincaId ?? 'sin-finca'}`;
      totals[fincaKey] = productoMatrix.productos.reduce(
        (sum, producto) => sum + (producto.valoresPorFinca[fincaKey] ?? 0),
        0,
      );
    }
    return totals;
  }, [productoMatrix]);

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

      <Paper sx={{ borderRadius: 'var(--ds-radius-lg, 10px)', overflow: 'hidden', p: useFincaCards ? 2 : 0 }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ py: 2, px: 2, color: 'text.secondary' }}>
            No hay produccion registrada para la fecha seleccionada.
          </Typography>
        ) : useFincaCards ? (
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              {rows.map((row) => (
                <Grid key={row.fincaId} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {row.fincaNombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {row.fincaUbicacion || 'Sin ubicación'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Galpones con registro: {row.galponesConRegistro}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {row.totalHuevos} huevos
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
              Total general: {totalGeneral} huevos
            </Typography>
          </Stack>
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
              {rows.map((row) => (
                <TableRow key={row.fincaId} hover>
                  <TableCell>{row.fincaId}</TableCell>
                  <TableCell>{row.fincaNombre}</TableCell>
                  <TableCell>{row.fincaUbicacion || '-'}</TableCell>
                  <TableCell>{row.galponesConRegistro}</TableCell>
                  <TableCell align="right">{row.totalHuevos}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total general</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{totalGeneral}</TableCell>
              </TableRow>
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
                  <TableCell sx={{ fontWeight: 700 }}>Finca</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Galpon</TableCell>
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
                      <TableCell>{row.fincaNombre}</TableCell>
                      <TableCell>{row.galponNombre}</TableCell>
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
              Matriz por tipo de huevo y finca
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : productoMatrix.productos.length === 0 ? (
            <Typography sx={{ py: 2, px: 2, color: 'text.secondary' }}>
              No hay registros por tipo de huevo en la fecha seleccionada.
            </Typography>
          ) : useMatrixTabs ? (
            <Box sx={{ px: 1, pb: 1 }}>
              <Tabs
                value={matrixTab}
                onChange={(_event, value: number) => setMatrixTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Todas" />
                {productoMatrix.fincas.map((finca) => (
                  <Tab key={`${finca.fincaId ?? 'sin-finca'}`} label={finca.fincaNombre} />
                ))}
              </Tabs>
              {matrixTab === 0 ? (
                <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small" sx={{ minWidth: 640 + productoMatrix.fincas.length * 120 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper', minWidth: 160 }}>
                          Tipo
                        </TableCell>
                        {productoMatrix.fincas.map((finca) => (
                          <TableCell key={`${finca.fincaId ?? 'sin-finca'}`} sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 120 }} align="right">
                            {finca.fincaNombre}
                          </TableCell>
                        ))}
                        <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 120 }} align="right">
                          Total huevos
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productoMatrix.productos.map((row) => (
                        <TableRow key={row.productoCodigo} hover>
                          <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper', minWidth: 160 }}>
                            {row.productoNombre}
                          </TableCell>
                          {productoMatrix.fincas.map((finca) => {
                            const fincaKey = `${finca.fincaId ?? 'sin-finca'}`;
                            return (
                              <TableCell key={fincaKey} align="right">
                                {row.valoresPorFinca[fincaKey] ?? 0}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right">{row.totalHuevos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                (() => {
                  const finca = productoMatrix.fincas[matrixTab - 1];
                  const fincaKey = `${finca.fincaId ?? 'sin-finca'}`;
                  const fincaProductos = productoMatrix.productos
                    .map((row) => ({
                      productoCodigo: row.productoCodigo,
                      productoNombre: row.productoNombre,
                      cantidad: row.valoresPorFinca[fincaKey] ?? 0,
                    }))
                    .filter((row) => row.cantidad > 0);
                  const fincaTotal = productoMatrixTotals[fincaKey] ?? 0;
                  return (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Cantidad</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fincaProductos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2}>
                              <Typography sx={{ py: 1, color: 'text.secondary' }}>
                                Sin producción en esta finca para la fecha.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          fincaProductos.map((row) => (
                            <TableRow key={row.productoCodigo} hover>
                              <TableCell>{row.productoNombre}</TableCell>
                              <TableCell align="right">{row.cantidad}</TableCell>
                            </TableRow>
                          ))
                        )}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Total finca</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{fincaTotal}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  );
                })()
              )}
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <Table size="small" sx={{ minWidth: 640 + productoMatrix.fincas.length * 120 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper', minWidth: 160 }}>
                      Tipo
                    </TableCell>
                    {productoMatrix.fincas.map((finca) => (
                      <TableCell key={`${finca.fincaId ?? 'sin-finca'}`} sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 120 }} align="right">
                        {finca.fincaNombre}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 120 }} align="right">
                      Total huevos
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productoMatrix.productos.map((row) => (
                    <TableRow key={row.productoCodigo} hover>
                      <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper', minWidth: 160 }}>
                        {row.productoNombre}
                      </TableCell>
                      {productoMatrix.fincas.map((finca) => {
                        const fincaKey = `${finca.fincaId ?? 'sin-finca'}`;
                        return (
                          <TableCell key={fincaKey} align="right">
                            {row.valoresPorFinca[fincaKey] ?? 0}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">{row.totalHuevos}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>
                      Total finca
                    </TableCell>
                    {productoMatrix.fincas.map((finca) => {
                      const fincaKey = `${finca.fincaId ?? 'sin-finca'}`;
                      return (
                        <TableCell key={fincaKey} align="right" sx={{ fontWeight: 700 }}>
                          {productoMatrixTotals[fincaKey] ?? 0}
                        </TableCell>
                      );
                    })}
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totalGeneral}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default ProduccionScreen;
