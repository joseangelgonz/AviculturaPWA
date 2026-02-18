import React from 'react';
import { Button, CircularProgress } from '@mui/material';

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  label,
  loadingLabel = 'Registrando...',
  disabled = false,
}) => (
  <Button
    type="submit"
    variant="contained"
    color="primary"
    fullWidth
    sx={{ mt: 3, mb: 2 }}
    disabled={loading || disabled}
    startIcon={loading ? <CircularProgress size={20} /> : undefined}
  >
    {loading ? loadingLabel : label}
  </Button>
);

export default SubmitButton;
