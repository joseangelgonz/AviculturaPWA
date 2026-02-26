import { useState } from 'react';
import { Typography, Box, TextField, Button, Alert, Link, Paper, Stack } from '@mui/material';
import { ShieldCheck, TimerReset, ChartNoAxesCombined } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthService from '../services/AuthService';
import LogoIcon from '../components/LogoIcon';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.signIn(email, password);
      // Redirigir al usuario a la página principal después de iniciar sesión
      navigate('/');
    } catch {
      // Mensaje genérico para prevenir enumeración de correos electrónicos
      setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
      }}
    >
      <Box
        className="premium-fade-up"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 5,
          borderRight: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(155deg, #F8F5EE 0%, #F0ECE2 100%)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
            <LogoIcon size={36} sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
              Avicultura
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ maxWidth: 440, mb: 1.25 }}>
            Gestion avicola con precision diaria.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 460 }}>
            Operacion limpia, controles claros y trazabilidad centralizada para admin y operarios.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Box sx={{ px: 1.5, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" alignItems="center" spacing={0.7} sx={{ color: 'text.secondary' }}>
              <TimerReset size={14} strokeWidth={2} aria-hidden />
              <Typography variant="body2">Flujo</Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Compacto</Typography>
          </Box>
          <Box sx={{ px: 1.5, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" alignItems="center" spacing={0.7} sx={{ color: 'text.secondary' }}>
              <ShieldCheck size={14} strokeWidth={2} aria-hidden />
              <Typography variant="body2">Confiable</Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>WCAG AA</Typography>
          </Box>
          <Box sx={{ px: 1.5, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" alignItems="center" spacing={0.7} sx={{ color: 'text.secondary' }}>
              <ChartNoAxesCombined size={14} strokeWidth={2} aria-hidden />
              <Typography variant="body2">Datos</Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Precisos</Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        className="premium-fade-up premium-delay-2"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 5 },
        }}
      >
        <Paper sx={{ width: '100%', maxWidth: 420, p: { xs: 2.2, sm: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Iniciar sesion
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.25 }}>
            Accede a tu panel para registrar y supervisar operaciones.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              required
              fullWidth
              id="email"
              label="Correo electronico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 1.2 }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Contrasena"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 1.4 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mb: 1.6 }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            {error && (
              <Alert severity="error" sx={{ mb: 1.2 }}>
                {error}
              </Alert>
            )}
            <Link component={RouterLink} to="/signup" variant="body2">
              No tienes una cuenta? Registrate
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginScreen;
