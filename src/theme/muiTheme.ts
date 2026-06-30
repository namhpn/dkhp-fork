import { createTheme } from '@mui/material/styles';

/**
 * MUI theme aligned with Monochrome Precision tokens.
 * All values reference CSS custom properties where possible.
 */
const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1a1a1a',
      contrastText: '#ffffff',
    },
    success: {
      main: '#047857',
    },
    error: {
      main: '#b91c1c',
    },
    warning: {
      main: '#b45309',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
    },
    divider: '#ebebeb',
    action: {
      disabledBackground: 'rgba(0, 0, 0, 0.06)',
      disabled: 'rgba(0, 0, 0, 0.26)',
    },
  },
  typography: {
    fontFamily: `'Noto Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    h1: {
      fontFamily: `'Be Vietnam Pro', 'Noto Sans', ui-sans-serif, system-ui, sans-serif`,
      fontWeight: 800,
    },
    h2: {
      fontFamily: `'Be Vietnam Pro', 'Noto Sans', ui-sans-serif, system-ui, sans-serif`,
      fontWeight: 800,
    },
    h3: {
      fontFamily: `'Be Vietnam Pro', 'Noto Sans', ui-sans-serif, system-ui, sans-serif`,
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 38,
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#dcdcdc',
        },
        sizeSmall: {
          minHeight: 30,
          fontSize: '0.82rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#ffffff',
          '&.Mui-focused': {
            outline: '3px solid rgba(37, 99, 235, 0.32)',
            outlineOffset: 2,
          },
          '&.Mui-disabled': {
            backgroundColor: '#f4f4f4',
          },
        },
        input: {
          '&[readonly]': {
            backgroundColor: '#f4f4f4',
            cursor: 'default',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#dcdcdc',
          '&.Mui-checked': {
            color: '#2563eb',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1rem',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: 12,
          lineHeight: 1.4,
          borderRadius: 8,
          padding: '6px 10px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        standardError: {
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
        },
        standardWarning: {
          backgroundColor: '#fffbeb',
          color: '#b45309',
        },
        standardSuccess: {
          backgroundColor: '#ecfdf5',
          color: '#047857',
        },
        standardInfo: {
          backgroundColor: '#eff6ff',
          color: '#2563eb',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f9f9f9',
          color: '#1a1a1a',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 4,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default muiTheme;
