import { Box, Typography } from '@mui/material';

const OperarioDashboardScreen = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Panel del Operario
      </Typography>
      <Typography variant="body1">
        Bienvenido al panel del operario. Aquí podrás registrar las actividades diarias de tus galpones.
      </Typography>
      {/* Futuros componentes para selección de galpón y formularios de tareas */}
    </Box>
  );
};

export default OperarioDashboardScreen;
