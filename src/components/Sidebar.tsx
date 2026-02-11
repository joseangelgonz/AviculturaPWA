import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import {
  LayoutDashboard,
  Egg,
  Warehouse,
  Layers,
  Landmark,
  BarChart3,
  BellRing,
  Package,
  Wheat,
  HeartCrack,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import type { UserRole } from '../models/Usuario';

interface NavItem {
  label: string;
  path: string;
  Icon: LucideIcon;
  roles: readonly UserRole[];
}

const ALL_ROLES: readonly UserRole[] = ['administrador', 'operario'];
const ADMIN_ONLY: readonly UserRole[] = ['administrador'];
const OPERARIO_ONLY: readonly UserRole[] = ['operario'];

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Panel', path: '/', Icon: LayoutDashboard, roles: ALL_ROLES },
  { label: 'Producción', path: '/produccion', Icon: Egg, roles: ADMIN_ONLY },
  { label: 'Galpones', path: '/galpones', Icon: Warehouse, roles: ADMIN_ONLY },
  { label: 'Cortes', path: '/cortes', Icon: Layers, roles: ADMIN_ONLY },
  { label: 'Fincas', path: '/fincas', Icon: Landmark, roles: ADMIN_ONLY },
  { label: 'Reportes', path: '/reportes', Icon: BarChart3, roles: ADMIN_ONLY },
  { label: 'Alertas', path: '/alertas', Icon: BellRing, roles: ADMIN_ONLY },
  { label: 'Recolección', path: '/operario/recoleccion', Icon: Package, roles: OPERARIO_ONLY },
  { label: 'Alimentación', path: '/operario/alimentacion', Icon: Wheat, roles: OPERARIO_ONLY },
  { label: 'Mortalidad', path: '/operario/mortalidad', Icon: HeartCrack, roles: OPERARIO_ONLY },
  { label: 'Clasificación', path: '/operario/clasificacion', Icon: Tags, roles: OPERARIO_ONLY },
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
    <Box className="premium-fade-up premium-delay-1" sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1.25 }}>
      <Box sx={{ px: 2.25, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '8px',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '-0.01em',
          }}
        >
          A
        </Box>
        <Box sx={{ minWidth: 0 }}>
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
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            Control Center
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 1.75, my: 1 }} />

      <List sx={{ flex: 1, px: 1 }}>
        <Typography
          variant="body2"
          sx={{
            px: 1.5,
            pt: 0.5,
            pb: 0.75,
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: '0.69rem',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          Navegación
        </Typography>
        {visibleItems.map((item) => {
          const selected = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleClick(item.path)}
              sx={{ minHeight: 42, px: 1.5, mb: 0.5 }}
            >
              <ListItemIcon
                sx={{
                  mr: 1.2,
                  justifyContent: 'center',
                  color: selected ? 'primary.main' : 'text.secondary',
                }}
              >
                <item.Icon size={18} strokeWidth={1.85} aria-hidden />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.84rem',
                  fontWeight: selected ? 650 : 500,
                }}
              />
              {selected && (
                <Chip
                  size="small"
                  label=""
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'primary.main',
                    '& .MuiChip-label': { px: 0 },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2, pb: 1.25 }}>
        <Divider sx={{ mb: 1.25 }} />
        <Chip
          size="small"
          label={userRole === 'administrador' ? 'Acceso completo' : 'Acceso operativo'}
          variant="outlined"
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            bgcolor: 'rgba(255,255,255,0.32)',
            width: '100%',
            justifyContent: 'flex-start',
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>
    </Box>
  );
};

export default Sidebar;
