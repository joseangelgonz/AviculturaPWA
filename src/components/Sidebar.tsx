import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import EggOutlined from '@mui/icons-material/EggOutlined';
import WarehouseOutlined from '@mui/icons-material/WarehouseOutlined';
import AgricultureOutlined from '@mui/icons-material/AgricultureOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Panel', icon: <DashboardOutlined />, path: '/' },
  { label: 'Producción', icon: <EggOutlined />, path: '/produccion' },
  { label: 'Galpones', icon: <WarehouseOutlined />, path: '/galpones' },
  { label: 'Cortes', icon: <AgricultureOutlined />, path: '/cortes' },
  { label: 'Fincas', icon: <BusinessOutlined />, path: '/fincas' },
  { label: 'Reportes', icon: <AssessmentOutlined />, path: '/reportes' },
  { label: 'Alertas', icon: <NotificationsOutlined />, path: '/alertas' },
];

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          AviculturaPWA
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, my: 1 }} />

      <List sx={{ flex: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleClick(item.path)}
              sx={{ minHeight: 44, px: 2, mb: 0.5 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                  color: selected ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: selected ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
