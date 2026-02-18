import React from 'react';
import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import type { Galpon } from '../models/Galpon';

interface FormShellProps {
  title: string;
  galponLabel: string;
  selectedGalpon: Galpon | null;
  loadingGalpones: boolean;
  galponError: Error | null;
  extraLoading?: boolean;
  extraError?: { message: string } | null;
  extraErrorLabel?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

const FormShell: React.FC<FormShellProps> = ({
  title,
  galponLabel,
  selectedGalpon,
  loadingGalpones,
  galponError,
  extraLoading = false,
  extraError = null,
  extraErrorLabel = 'Error al cargar datos',
  maxWidth = 560,
  children,
}) => {
  if (loadingGalpones || extraLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (galponError) {
    return <Alert severity="error">Error al cargar galpones: {galponError.message}</Alert>;
  }

  if (extraError) {
    return <Alert severity="error">{extraErrorLabel}: {extraError.message}</Alert>;
  }

  if (!selectedGalpon) {
    return <Alert severity="info">Selecciona un galpón para {galponLabel}.</Alert>;
  }

  return (
    <Paper className="premium-fade-up" sx={{ p: 2.5, maxWidth, mx: 'auto', mt: 1.5, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        Galpón seleccionado: {selectedGalpon.nombre} (ID: {selectedGalpon.id})
      </Typography>
      {children}
    </Paper>
  );
};

export default FormShell;
