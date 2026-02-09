import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
  level?: 'page' | 'section';
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Futuro: enviar a servicio de telemetría
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { level = 'page', fallbackMessage } = this.props;

    if (level === 'section') {
      return (
        <Alert severity="error" variant="outlined" sx={{ m: 2 }}>
          {fallbackMessage ?? 'Ocurrió un error al cargar esta sección.'}
          <Button size="small" onClick={this.handleReset} sx={{ ml: 1 }}>
            Reintentar
          </Button>
        </Alert>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Algo salió mal
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {fallbackMessage ?? 'Ocurrió un error inesperado. Intenta recargar la página.'}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </Box>
    );
  }
}

export default ErrorBoundary;
