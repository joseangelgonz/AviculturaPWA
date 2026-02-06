import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../AuthContext';
import AuthService from '../services/AuthService';

const DRAWER_WIDTH = 260;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Nuevo estado para controlar el colapso en desktop
  const { auth } = useAuth();

  const userEmail =
    auth.status === 'authenticated' ? auth.session.user.email : '';

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: isSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: isSidebarOpen ? `${DRAWER_WIDTH}px` : '0px' },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          {/* Nuevo botón para alternar el sidebar en desktop */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            edge="start"
            sx={{ mr: 2, display: { xs: 'none', md: 'block' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, fontSize: '1rem', fontWeight: 600 }}
          >
            AviculturaPWA
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
            {userEmail}
          </Typography>
          <Button
            size="small"
            startIcon={<LogoutOutlined />}
            onClick={handleSignOut}
            sx={{ color: 'text.secondary' }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar: temporal en móvil */}
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

      {/* Sidebar: permanente en escritorio */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: isSidebarOpen ? DRAWER_WIDTH : 0,
            overflowX: 'hidden', // Oculta el scrollbar cuando está colapsado
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          },
        }}
      >
        {isSidebarOpen && <Sidebar />}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: isSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: isSidebarOpen ? `${DRAWER_WIDTH}px` : '0px' },
          pt: '56px',
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
