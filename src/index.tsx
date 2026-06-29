import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, Theme, ThemeProvider, createTheme } from '@mui/material/styles';
import { LicenseManager } from 'ag-grid-enterprise';
import { SnackbarProvider } from 'notistack';
import ReactDOM from 'react-dom';

import App from './views/App';

import 'ag-grid-enterprise/styles/ag-grid.css';
import 'ag-grid-enterprise/styles/ag-theme-alpine.css';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

LicenseManager.setLicenseKey('I_<3_SCHOOL_NDEwMjMzMzIwMDAwMA==afc05c982fa05a2578eb9cab60c42d78');

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563EB', contrastText: '#ffffff' },
    secondary: { main: '#18181B', contrastText: '#ffffff' },
    success: { main: '#047857' },
    error: { main: '#b91c1c' },
    background: {
      default: '#FAFAFA',
      paper: '#ffffff',
    },
    text: {
      primary: '#09090B',
      secondary: '#3F3F46',
    },
  },
  typography: {
    fontFamily: `'Noto Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    button: {
      fontWeight: 800,
      textTransform: 'none',
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 38,
          borderRadius: 10,
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
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
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: 12,
          lineHeight: 1.4,
        },
      },
    },
  },
});

ReactDOM.render(
  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </SnackbarProvider>,
  document.getElementById('root'),
);
