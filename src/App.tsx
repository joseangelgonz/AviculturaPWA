import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, Box, CircularProgress, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AuthService from './services/AuthService';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import OperarioDashboardScreen from './screens/OperarioDashboardScreen';
import RecoleccionForm from './components/RecoleccionForm';
import AlimentacionForm from './components/AlimentacionForm';
import MortalidadForm from './components/MortalidadForm';
import ClasificacionForm from './components/ClasificacionForm';
import DashboardLayout from './components/DashboardLayout';
import RoleGuard from './components/RoleGuard';
import { AuthContext } from './AuthContext';
import { SelectedGalponProvider } from './components/SelectedGalponProvider';
import type { AuthState } from './AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import CortesScreen from './screens/CortesScreen';
import FincasScreen from './screens/FincasScreen';
import GalponesScreen from './screens/GalponesScreen';

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
  const userRole = auth.status === 'authenticated' ? auth.role : undefined;

  return (
    <AuthContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary level="page">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginScreen />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignUpScreen />} />
            <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={userRole === 'operario' ? (
                <SelectedGalponProvider>
                  <OperarioDashboardScreen />
                </SelectedGalponProvider>
              ) : (
                <DashboardScreen />
              )} />
              <Route path="/produccion" element={<Placeholder title="Producción" />} />
              <Route path="/galpones" element={<RoleGuard allowedRoles={['administrador']}><GalponesScreen /></RoleGuard>} />
              <Route path="/cortes" element={<RoleGuard allowedRoles={['administrador']}><CortesScreen /></RoleGuard>} />
              <Route path="/fincas" element={<RoleGuard allowedRoles={['administrador']}><FincasScreen /></RoleGuard>} />
              <Route path="/reportes" element={<RoleGuard allowedRoles={['administrador']}><Placeholder title="Reportes" /></RoleGuard>} />
              <Route path="/alertas" element={<RoleGuard allowedRoles={['administrador']}><Placeholder title="Alertas" /></RoleGuard>} />
              <Route path="/operario" element={<RoleGuard allowedRoles={['operario']}><SelectedGalponProvider><OperarioDashboardScreen /></SelectedGalponProvider></RoleGuard>}>
                <Route path="recoleccion" element={<RecoleccionForm />} />
                <Route path="alimentacion" element={<AlimentacionForm />} />
                <Route path="mortalidad" element={<MortalidadForm />} />
                <Route path="clasificacion" element={<ClasificacionForm />} />
              </Route>
            </Route>
          </Routes>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
