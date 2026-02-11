import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F6F3ED',
      paper: '#FFFEFC',
    },
    primary: {
      main: '#4B5A28',
      light: '#778A47',
      dark: '#36401D',
      contrastText: '#FDFBF6',
    },
    secondary: {
      main: '#A8BB43',
      light: '#CDD98F',
      dark: '#7A8A2C',
    },
    success: {
      main: '#2F7A49',
    },
    error: {
      main: '#BA4E43',
    },
    warning: {
      main: '#A87821',
    },
    info: {
      main: '#356B8F',
    },
    text: {
      primary: '#1D1F1A',
      secondary: '#616359',
      disabled: '#9A9B91',
    },
    divider: '#E5DFD3',
  },
  shape: {
    borderRadius: 14,
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
        },
        '*': {
          boxSizing: 'border-box',
        },
        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#F6F3ED',
          backgroundImage: `
            radial-gradient(circle at 14% -10%, rgba(168, 187, 67, 0.16), transparent 44%),
            radial-gradient(circle at 92% 8%, rgba(75, 90, 40, 0.1), transparent 36%)
          `,
        },
        '::selection': {
          backgroundColor: alpha('#4B5A28', 0.22),
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E5DFD3',
          transition: 'border-color 180ms ease, box-shadow 180ms ease',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E5DFD3',
          boxShadow: '0 1px 0 rgba(29, 31, 26, 0.03), 0 12px 24px rgba(29, 31, 26, 0.03)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 18,
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
          color: '#1D1F1A',
          backgroundColor: alpha('#F6F3ED', 0.86),
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
        },
        sizeSmall: {
          minHeight: 32,
        },
        containedPrimary: {
          backgroundColor: '#4B5A28',
          '&:hover': {
            backgroundColor: '#3D4A22',
          },
        },
        outlined: {
          borderColor: '#D4CCBE',
          '&:hover': {
            borderColor: '#BFB6A3',
            backgroundColor: alpha('#4B5A28', 0.06),
            transform: 'translateY(-1px)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha('#4B5A28', 0.08),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#616359',
          '&:hover': {
            backgroundColor: alpha('#4B5A28', 0.08),
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
          '&.Mui-selected': {
            backgroundColor: alpha('#4B5A28', 0.14),
            '&:hover': {
              backgroundColor: alpha('#4B5A28', 0.18),
            },
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
            borderColor: '#4B5A28',
            borderWidth: 1.5,
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
          color: '#616359',
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
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E5DFD3',
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
