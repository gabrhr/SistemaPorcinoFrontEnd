import { useRoutes } from 'react-router-dom';
import router from 'src/router';

import "bootstrap/dist/css/bootstrap.min.css";
import { SnackbarProvider } from 'notistack';
import useAuth from 'src/hooks/useAuth';
import "src/theme/global.css";

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { CssBaseline } from '@mui/material';
import { es } from 'date-fns/locale';
import AppInit from './components/AppInit';
import ThemeProvider from './theme/ThemeProvider';

function App() {
  const content = useRoutes(router);
  const auth = useAuth();

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={es}>

        <SnackbarProvider
          maxSnack={6}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          >
          <CssBaseline />
          {auth.isInitialized ? content : <AppInit />}
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;
