import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, Box, CircularProgress, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AuthService from './services/AuthService';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import DashboardLayout from './components/DashboardLayout';
import { AuthContext } from './AuthContext';
import type { AuthState } from './AuthContext';

// --- Placeholder para rutas futuras ---
const Placeholder = ({ title }: { title: string }) => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <Typography color="text.secondary">Próximamente</Typography>
  </Box>
);

function App() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let listenerFired = false;

    async function resolveAuth(session: import('@supabase/supabase-js').Session | null) {
      if (session) {
        const role = await AuthService.getRole(session.user.id);
        if (!cancelled) setAuth({ status: 'authenticated', session, role });
      } else {
        if (!cancelled) setAuth({ status: 'unauthenticated' });
      }
    }

    // Escuchar cambios de autenticación (fires before getSession resolves)
    const unsubscribe = AuthService.onAuthStateChange((_event, session) => {
      listenerFired = true;
      resolveAuth(session);
    });

    // Obtener sesión inicial — skip if the listener already provided a value
    AuthService.getSession()
      .then((session) => {
        if (!listenerFired) resolveAuth(session);
      })
      .catch(() => {
        if (!listenerFired && !cancelled) setAuth({ status: 'unauthenticated' });
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (auth.status === 'loading') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const isAuthenticated = auth.status === 'authenticated';

  return (
    <AuthContext.Provider value={{ auth }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginScreen />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignUpScreen />} />
          <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/produccion" element={<Placeholder title="Producción" />} />
            <Route path="/galpones" element={<Placeholder title="Galpones" />} />
            <Route path="/cortes" element={<Placeholder title="Cortes" />} />
            <Route path="/fincas" element={<Placeholder title="Fincas" />} />
            <Route path="/reportes" element={<Placeholder title="Reportes" />} />
            <Route path="/alertas" element={<Placeholder title="Alertas" />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
