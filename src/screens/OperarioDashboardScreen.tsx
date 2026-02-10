import { Box, Typography } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

const OperarioDashboardScreen = () => {
  const location = useLocation();
  const isIndex = location.pathname === '/operario' || location.pathname === '/';

  return (
    <Box>
      {isIndex && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Panel del Operario
          </Typography>
          <Typography variant="body1">
            Bienvenido al panel del operario. Selecciona una opción del menú para registrar las actividades diarias de tus galpones.
          </Typography>
        </>
      )}
      <Outlet />
    </Box>
  );
};

export default OperarioDashboardScreen;
