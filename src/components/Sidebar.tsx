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
import TakeoutDiningOutlined from '@mui/icons-material/TakeoutDiningOutlined';
import EggAltOutlined from '@mui/icons-material/EggAltOutlined';
import BloodtypeOutlined from '@mui/icons-material/BloodtypeOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import type { UserRole } from '../models/Usuario';
import type { SvgIconComponent } from '@mui/icons-material';

interface NavItem {
  label: string;
  path: string;
  Icon: SvgIconComponent;
  roles: readonly UserRole[];
}

const ALL_ROLES: readonly UserRole[] = ['administrador', 'operario'];
const ADMIN_ONLY: readonly UserRole[] = ['administrador'];
const OPERARIO_ONLY: readonly UserRole[] = ['operario'];

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Panel', path: '/', Icon: DashboardOutlined, roles: ALL_ROLES },
  { label: 'Producción', path: '/produccion', Icon: EggOutlined, roles: ADMIN_ONLY },
  { label: 'Galpones', path: '/galpones', Icon: WarehouseOutlined, roles: ADMIN_ONLY },
  { label: 'Cortes', path: '/cortes', Icon: AgricultureOutlined, roles: ADMIN_ONLY },
  { label: 'Fincas', path: '/fincas', Icon: BusinessOutlined, roles: ADMIN_ONLY },
  { label: 'Reportes', path: '/reportes', Icon: AssessmentOutlined, roles: ADMIN_ONLY },
  { label: 'Alertas', path: '/alertas', Icon: NotificationsOutlined, roles: ADMIN_ONLY },
  { label: 'Recolección', path: '/operario/recoleccion', Icon: EggAltOutlined, roles: OPERARIO_ONLY },
  { label: 'Alimentación', path: '/operario/alimentacion', Icon: TakeoutDiningOutlined, roles: OPERARIO_ONLY },
  { label: 'Mortalidad', path: '/operario/mortalidad', Icon: BloodtypeOutlined, roles: OPERARIO_ONLY },
  { label: 'Clasificación', path: '/operario/clasificacion', Icon: CategoryOutlined, roles: OPERARIO_ONLY },
];

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  const userRole: UserRole =
    auth.status === 'authenticated' ? auth.role : 'operario';

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleClick = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
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
        {visibleItems.map((item) => {
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
                <item.Icon />
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
