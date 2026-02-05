import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import { ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AuthService from './services/AuthService';
import type { Session } from '@supabase/supabase-js';

// Un tema básico de Material-UI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión inicial
    AuthService.getSession()
      .then((session) => {
        setSession(session);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setLoading(false); // Ensure loading is set to false even on error
      });

    // 2. Escuchar cambios de autenticación
    const unsubscribe = AuthService.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        setLoading(false);
      }
    });

    // 3. Limpiar la suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <LoginScreen />} />
        <Route path="/signup" element={session ? <Navigate to="/" /> : <SignUpScreen />} />
        <Route
          path="/"
          element={session ? <HomeScreen /> : <Navigate to="/login" />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
