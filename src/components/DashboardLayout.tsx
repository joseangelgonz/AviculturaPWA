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
import LogoIcon from './LogoIcon';
import { useAuth } from '../AuthContext';

const DRAWER_WIDTH = 272;
const DRAWER_WIDTH_COLLAPSED = 56;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel',
  '/produccion': 'Produccion',
  '/asignaciones': 'Asignaciones',
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const { auth, signOut } = useAuth();

  const desktopDrawerWidth = sidebarExpanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

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
          width: '100%',
          ml: 0,
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        <Toolbar
          sx={{
            minHeight: 60,
            px: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minWidth: 0,
              }}
            >
              <LogoIcon size={32} sx={{ color: 'primary.main' }} />
              <Box
                sx={{
                  minWidth: 0,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'text.primary',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.1,
                  }}
                >
                  Avicultura
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
                >
                  Control Center
                </Typography>
              </Box>
            </Box>
            <IconButton
              color="inherit"
              aria-label="Abrir menú de navegación"
              onClick={() => setMobileOpen(true)}
              edge="start"
              sx={{
                ml: 1,
                mr: 2,
                display: { xs: 'inline-flex', md: 'none' },
                color: 'text.primary',
                width: 40,
                minWidth: 40,
                height: 40,
                minHeight: 40,
                padding: 0,
                borderRadius: 'var(--ds-radius-sm, 6px)',
                '& .MuiTouchRipple-root': {
                  borderRadius: 'var(--ds-radius-sm, 6px)',
                },
              }}
            >
              <Menu size={24} strokeWidth={1.75} aria-hidden />
            </IconButton>
            <Typography
              variant="body2"
              noWrap
              sx={{
                flexGrow: 1,
                fontSize: '0.86rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
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
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ root: { keepMounted: true } }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            mt: '64px',
            height: 'calc(100% - 64px)',
          },
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
            width: desktopDrawerWidth,
            overflowX: 'hidden',
            top: 64,
            height: 'calc(100% - 64px)',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
          },
        }}
        slotProps={{
          paper: {
            onMouseEnter: () => setSidebarExpanded(true),
            onMouseLeave: () => {
              setSidebarExpanded(false);
            },
          },
        }}
      >
        <Sidebar
          collapsed={!sidebarExpanded}
          onNavigate={() => {
            setMobileOpen(false);
            setSidebarExpanded(false);
          }}
        />
      </Drawer>

      <Box
        component="main"
        className="premium-fade-up"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH_COLLAPSED}px)` },
          ml: { md: `${DRAWER_WIDTH_COLLAPSED}px` },
          pt: '64px',
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
