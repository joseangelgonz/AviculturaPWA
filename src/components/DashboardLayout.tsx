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
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
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
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
        open
      >
        <Sidebar />
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: '56px',
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
