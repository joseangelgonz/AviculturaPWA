import { createTheme, alpha } from '@mui/material/styles';

const BRAND = {
  primary: '#4B5A28',
  primaryLight: '#778A47',
  primaryDark: '#36401D',
  secondary: '#A8BB43',
  bgDefault: '#F6F3ED',
  bgPaper: '#FFFEFC',
  textPrimary: '#1D1F1A',
  textSecondary: '#616359',
  textDisabled: '#9A9B91',
  divider: '#E5DFD3',
};

const ACTION = {
  hover: alpha(BRAND.primary, 0.08),
  selected: alpha(BRAND.primary, 0.14),
  pressed: alpha(BRAND.primary, 0.18),
  focusRing: alpha(BRAND.primary, 0.24),
  disabledBg: '#ECE5D8',
};

const SEMANTIC = {
  success: {
    main: '#2F7A49',
    dark: '#24603A',
    surface: alpha('#2F7A49', 0.12),
    border: alpha('#2F7A49', 0.24),
  },
  warning: {
    main: '#A87821',
    dark: '#845D18',
    surface: alpha('#A87821', 0.14),
    border: alpha('#A87821', 0.26),
  },
  error: {
    main: '#BA4E43',
    dark: '#973B32',
    surface: alpha('#BA4E43', 0.12),
    border: alpha('#BA4E43', 0.26),
  },
  info: {
    main: '#356B8F',
    dark: '#285270',
    surface: alpha('#356B8F', 0.12),
    border: alpha('#356B8F', 0.24),
  },
};

const theme = createTheme({
  spacing: 4,
  palette: {
    mode: 'light',
    background: {
      default: BRAND.bgDefault,
      paper: BRAND.bgPaper,
    },
    primary: {
      main: BRAND.primary,
      light: BRAND.primaryLight,
      dark: BRAND.primaryDark,
      contrastText: '#FDFBF6',
    },
    secondary: {
      main: BRAND.secondary,
      light: '#CDD98F',
      dark: '#7A8A2C',
    },
    success: {
      main: SEMANTIC.success.main,
      dark: SEMANTIC.success.dark,
    },
    error: {
      main: SEMANTIC.error.main,
      dark: SEMANTIC.error.dark,
    },
    warning: {
      main: SEMANTIC.warning.main,
      dark: SEMANTIC.warning.dark,
    },
    info: {
      main: SEMANTIC.info.main,
      dark: SEMANTIC.info.dark,
    },
    text: {
      primary: BRAND.textPrimary,
      secondary: BRAND.textSecondary,
      disabled: BRAND.textDisabled,
    },
    divider: BRAND.divider,
    action: {
      active: '#4A4B43',
      hover: ACTION.hover,
      selected: ACTION.selected,
      disabled: BRAND.textDisabled,
      disabledBackground: ACTION.disabledBg,
      focus: ACTION.focusRing,
      hoverOpacity: 0.08,
      selectedOpacity: 0.14,
      disabledOpacity: 0.38,
      activatedOpacity: 0.18,
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Public Sans", "Inter", "Segoe UI", "Helvetica Neue", "Arial", sans-serif',
    h3: {
      fontSize: '1.9rem',
      lineHeight: 1.16,
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.65rem',
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontSize: '1.25rem',
      lineHeight: 1.25,
      fontWeight: 650,
      letterSpacing: '-0.015em',
    },
    h6: {
      fontSize: '0.9rem',
      lineHeight: 1.3,
      fontWeight: 650,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontSize: '0.95rem',
      lineHeight: 1.45,
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light',
          '--ds-space-1': '4px',
          '--ds-space-2': '8px',
          '--ds-space-3': '12px',
          '--ds-space-4': '16px',
          '--ds-space-5': '24px',
          '--ds-space-6': '32px',
          '--ds-radius-sm': '6px',
          '--ds-radius-md': '8px',
          '--ds-radius-lg': '10px',
          '--ds-action-hover': ACTION.hover,
          '--ds-action-selected': ACTION.selected,
          '--ds-action-pressed': ACTION.pressed,
          '--ds-action-focus-ring': ACTION.focusRing,
          '--ds-action-disabled-bg': ACTION.disabledBg,
          '--ds-success-surface': SEMANTIC.success.surface,
          '--ds-warning-surface': SEMANTIC.warning.surface,
          '--ds-error-surface': SEMANTIC.error.surface,
          '--ds-info-surface': SEMANTIC.info.surface,
        },
        '*': {
          boxSizing: 'border-box',
        },
        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundColor: BRAND.bgDefault,
          backgroundImage: `
            radial-gradient(circle at 14% -10%, rgba(168, 187, 67, 0.16), transparent 44%),
            radial-gradient(circle at 92% 8%, rgba(75, 90, 40, 0.1), transparent 36%)
          `,
        },
        '::selection': {
          backgroundColor: alpha(BRAND.primary, 0.22),
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${BRAND.divider}`,
          borderRadius: 'var(--ds-radius-md, 8px)',
          transition: 'border-color 180ms ease, box-shadow 180ms ease',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${BRAND.divider}`,
          borderRadius: 'var(--ds-radius-lg, 10px)',
          boxShadow: '0 1px 0 rgba(29, 31, 26, 0.03), 0 12px 24px rgba(29, 31, 26, 0.03)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 18,
          minWidth: 0,
          overflow: 'hidden',
          '&:last-child': {
            paddingBottom: 18,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #F9F7F2 0%, #F4F1EA 100%)',
          borderRight: '1px solid #DED7CB',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: {
          color: BRAND.textPrimary,
          backgroundColor: alpha(BRAND.bgDefault, 0.86),
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #E0DACA',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 60,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 14,
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease',
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 3px ${ACTION.focusRing}`,
          },
        },
        sizeSmall: {
          minHeight: 32,
        },
        containedPrimary: {
          backgroundColor: BRAND.primary,
          '&:hover': {
            backgroundColor: '#3D4A22',
          },
        },
        containedError: {
          backgroundColor: SEMANTIC.error.main,
          color: '#FFF8F7',
          '&:hover': {
            backgroundColor: SEMANTIC.error.dark,
          },
        },
        outlined: {
          borderColor: '#D4CCBE',
          '&:hover': {
            borderColor: '#BFB6A3',
            backgroundColor: alpha(BRAND.primary, 0.06),
            transform: 'translateY(-1px)',
          },
        },
        outlinedError: {
          borderColor: SEMANTIC.error.border,
          color: SEMANTIC.error.main,
          '&:hover': {
            borderColor: SEMANTIC.error.main,
            backgroundColor: SEMANTIC.error.surface,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: ACTION.hover,
          },
        },
        textError: {
          color: SEMANTIC.error.main,
          '&:hover': {
            backgroundColor: SEMANTIC.error.surface,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: BRAND.textSecondary,
          '&:hover': {
            backgroundColor: ACTION.hover,
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 3px ${ACTION.focusRing}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '3px 8px',
          minHeight: 40,
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: ACTION.hover,
          },
          '&.Mui-selected': {
            backgroundColor: ACTION.selected,
            '&:hover': {
              backgroundColor: ACTION.pressed,
            },
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 3px ${ACTION.focusRing}`,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 34,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFCF7',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BFB6A3',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.primary,
            borderWidth: 1.5,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${ACTION.focusRing}`,
          },
        },
        input: {
          paddingTop: 10,
          paddingBottom: 10,
        },
        notchedOutline: {
          borderColor: '#D9D1C4',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: BRAND.textSecondary,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 6,
          marginBlock: 2,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        outlinedSuccess: {
          backgroundColor: SEMANTIC.success.surface,
          borderColor: SEMANTIC.success.border,
        },
        outlinedWarning: {
          backgroundColor: SEMANTIC.warning.surface,
          borderColor: SEMANTIC.warning.border,
        },
        outlinedError: {
          backgroundColor: SEMANTIC.error.surface,
          borderColor: SEMANTIC.error.border,
        },
        outlinedInfo: {
          backgroundColor: SEMANTIC.info.surface,
          borderColor: SEMANTIC.info.border,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BRAND.divider,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rounded: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
