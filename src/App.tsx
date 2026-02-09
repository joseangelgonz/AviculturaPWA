import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, Box, CircularProgress, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AuthService from './services/AuthService';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import DashboardLayout from './components/DashboardLayout';
import RoleGuard from './components/RoleGuard';
import { AuthContext } from './AuthContext';
import type { AuthState } from './AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// --- Placeholder para rutas futuras ---
const Placeholder = ({ title }: { title: string }) => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <Typography color="text.secondary">Próximamente</Typography>
  </Box>
);

function App() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

  const signOut = useCallback(async () => {
    await AuthService.signOut();
  }, []);

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

    // Escuchar cambios de autenticación (fires before getUser resolves)
    const unsubscribe = AuthService.onAuthStateChange((_event, session) => {
      listenerFired = true;
      resolveAuth(session);
    });

    // Verificar usuario con el servidor (getUser valida el token server-side,
    // a diferencia de getSession que solo lee localStorage)
    AuthService.getUser()
      .then(async (user) => {
        if (listenerFired || cancelled) return;
        if (!user) {
          setAuth({ status: 'unauthenticated' });
          return;
        }
        // Token válido — leer sesión local para obtener el objeto Session completo
        const session = await AuthService.getSession();
        if (!listenerFired && !cancelled) resolveAuth(session);
      })
      .catch(() => {
        if (!listenerFired && !cancelled) setAuth({ status: 'unauthenticated' });
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const contextValue = useMemo(() => ({ auth, signOut }), [auth, signOut]);

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
    <AuthContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary level="page">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginScreen />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignUpScreen />} />
            <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/produccion" element={<Placeholder title="Producción" />} />
              <Route path="/galpones" element={<Placeholder title="Galpones" />} />
              <Route path="/cortes" element={<Placeholder title="Cortes" />} />
              <Route path="/fincas" element={<RoleGuard allowedRoles={['administrador']}><Placeholder title="Fincas" /></RoleGuard>} />
              <Route path="/reportes" element={<RoleGuard allowedRoles={['administrador']}><Placeholder title="Reportes" /></RoleGuard>} />
              <Route path="/alertas" element={<RoleGuard allowedRoles={['administrador']}><Placeholder title="Alertas" /></RoleGuard>} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
