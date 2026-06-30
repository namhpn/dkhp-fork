import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { LicenseManager } from 'ag-grid-enterprise';
import { SnackbarProvider } from 'notistack';
import ReactDOM from 'react-dom';

import App from './views/App';
import muiTheme from './theme/muiTheme';

import 'ag-grid-enterprise/styles/ag-grid.css';
import 'ag-grid-enterprise/styles/ag-theme-alpine.css';


LicenseManager.setLicenseKey('I_<3_SCHOOL_NDEwMjMzMzIwMDAwMA==afc05c982fa05a2578eb9cab60c42d78');

ReactDOM.render(
  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </SnackbarProvider>,
  document.getElementById('root'),
);
