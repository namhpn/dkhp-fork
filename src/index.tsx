import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';

import App from './views/App';
import muiTheme from './theme/muiTheme';

// Self-hosted fonts (were a render-blocking Google Fonts stylesheet). Only the
// latin + vietnamese subsets are pulled in; each weight matches what the theme uses.
import '@fontsource/be-vietnam-pro/latin-500.css';
import '@fontsource/be-vietnam-pro/vietnamese-500.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/be-vietnam-pro/latin-700.css';
import '@fontsource/be-vietnam-pro/vietnamese-700.css';
import '@fontsource/be-vietnam-pro/latin-800.css';
import '@fontsource/be-vietnam-pro/vietnamese-800.css';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/vietnamese-400.css';
import '@fontsource/noto-sans/latin-500.css';
import '@fontsource/noto-sans/vietnamese-500.css';
import '@fontsource/noto-sans/latin-600.css';
import '@fontsource/noto-sans/vietnamese-600.css';
import '@fontsource/noto-sans/latin-700.css';
import '@fontsource/noto-sans/vietnamese-700.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </SnackbarProvider>,
);
