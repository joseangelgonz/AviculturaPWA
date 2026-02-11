import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Menu, LogOut } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../AuthContext';

const DRAWER_WIDTH = 272;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel',
  '/produccion': 'Produccion',
  '/galpones': 'Galpones',
  '/cortes': 'Cortes',
  '/fincas': 'Fincas',
  '/reportes': 'Reportes',
  '/alertas': 'Alertas',
  '/operario': 'Panel Operario',
  '/operario/recoleccion': 'Registro de Recoleccion',
  '/operario/alimentacion': 'Registro de Alimentacion',
  '/operario/mortalidad': 'Registro de Mortalidad',
  '/operario/clasificacion': 'Registro de Clasificacion',
};

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const { auth, signOut } = useAuth();

  const userEmail =
    auth.status === 'authenticated' ? auth.session.user.email : '';
  const roleLabel =
    auth.status === 'authenticated' && auth.role === 'administrador'
      ? 'Admin'
      : 'Operario';
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Avicultura';

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      // Auth state listener en App.tsx maneja la redirección
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: isSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: isSidebarOpen ? `${DRAWER_WIDTH}px` : '0px' },
          boxShadow: 'none',
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        <Toolbar sx={{ minHeight: 60, px: { xs: 1.5, sm: 2.5 } }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <Menu size={24} strokeWidth={1.75} aria-hidden />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            edge="start"
            sx={{ mr: 2, display: { xs: 'none', md: 'block' }, color: 'text.primary' }}
          >
            <Menu size={24} strokeWidth={1.75} aria-hidden />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, fontSize: '0.86rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'text.secondary' }}
          >
            {pageTitle}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: 'rgba(75, 90, 40, 0.1)',
                color: 'primary.dark',
                border: 'none',
                fontWeight: 700,
              }}
            />
            {userEmail && (
              <Chip
                label={userEmail}
                size="small"
                variant="outlined"
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  maxWidth: 220,
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
              />
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<LogOut size={18} strokeWidth={1.75} aria-hidden />}
              onClick={handleSignOut}
              disabled={signingOut}
              sx={{ color: 'text.primary' }}
            >
              {signingOut ? 'Cerrando...' : 'Salir'}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ root: { keepMounted: true } }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: isSidebarOpen ? DRAWER_WIDTH : 0,
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
          },
        }}
      >
        {isSidebarOpen && <Sidebar />}
      </Drawer>

      <Box
        component="main"
        className="premium-fade-up"
        sx={{
          flexGrow: 1,
          width: { md: isSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: isSidebarOpen ? `${DRAWER_WIDTH}px` : '0px' },
          pt: '60px',
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2.25 }, maxWidth: 1440, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
