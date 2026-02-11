import { useState } from 'react';
import { Typography, Box, TextField, Button, Alert, Link, Paper } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthService from '../services/AuthService';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra mayúscula.';
    if (!/[a-z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra minúscula.';
    if (!/[0-9]/.test(pwd)) return 'La contraseña debe incluir al menos un número.';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await AuthService.signUp(email, password);
      setSuccess('¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta.');
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds
    } catch {
      // Mensaje genérico para prevenir enumeración de correos electrónicos
      setError('No se pudo completar el registro. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="premium-fade-up"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 2, sm: 3, md: 5 },
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: { xs: 2.2, sm: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Crear cuenta
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.25 }}>
          Configura acceso para gestionar la operacion con permisos seguros.
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
            autoComplete="new-password"
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
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
          {error && (
            <Alert severity="error" sx={{ mb: 1.2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 1.2 }}>
              {success}
            </Alert>
          )}
          <Link component={RouterLink} to="/login" variant="body2">
            Ya tienes una cuenta? Inicia sesion
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUpScreen;
