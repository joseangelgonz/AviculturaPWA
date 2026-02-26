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
  collapsed?: boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ collapsed = false, onNavigate }: SidebarProps) => {
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
    <Box
      className="premium-fade-up premium-delay-1"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        py: collapsed ? 1 : 1,
        px: collapsed ? 0 : undefined,
      }}
    >
      <List
        disablePadding
        dense
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          py: 0,
          px: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          '& > *': { flex: '0 0 auto' },
        }}
      >
        {visibleItems.map((item) => {
          const selected = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleClick(item.path)}
              disableGutters
              sx={{
                margin: 0,
                marginBottom: 4,
                minHeight: 36,
                maxHeight: 36,
                height: 36,
                py: 1,
                px: collapsed ? 0.75 : 1.5,
                justifyContent: 'flex-start',
                borderRadius: 'var(--ds-radius-md, 8px)',
                mx: 1,
                flexShrink: 0,
                width: 'auto',
                '&.Mui-selected': {
                  bgcolor: collapsed ? 'transparent' : 'action.selected',
                },
                '&.Mui-selected:hover': {
                  bgcolor: collapsed ? 'transparent' : 'action.selected',
                },
                ...(collapsed && {
                  '&.Mui-selected .MuiListItemIcon-root': {
                    bgcolor: 'action.selected',
                    borderRadius: 'var(--ds-radius-md, 8px)',
                  },
                  '&.Mui-selected:hover .MuiListItemIcon-root': {
                    bgcolor: 'action.selected',
                  },
                }),
              }}
              title={collapsed ? item.label : undefined}
            >
              <ListItemIcon
                sx={{
                  mr: collapsed ? 0 : 1.2,
                  justifyContent: 'center',
                  minWidth: collapsed ? 40 : 36,
                  width: collapsed ? 40 : 36,
                  height: collapsed ? 36 : 'auto',
                  display: collapsed ? 'grid' : undefined,
                  placeItems: collapsed ? 'center' : undefined,
                  color: selected ? 'primary.main' : 'text.secondary',
                  '& > svg': { fontSize: 20 },
                }}
              >
                <item.Icon size={20} strokeWidth={1.85} aria-hidden />
              </ListItemIcon>
              {!collapsed && (
                <>
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
                </>
              )}
            </ListItemButton>
          );
        })}
      </List>

      {!collapsed && (
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
      )}
    </Box>
  );
};

export default Sidebar;
