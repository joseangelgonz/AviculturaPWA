import { Container, Typography, Box } from '@mui/material';

const HomeScreen = () => {
  return (
    <Container>
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido a AviculturaPWA
        </Typography>
        <Typography>
          Contenido de la aplicación principal.
        </Typography>
        {/* Aquí irán los dashboards de admin y operario */}
      </Box>
    </Container>
  );
};

export default HomeScreen;
