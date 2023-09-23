import { useRoutes } from 'react-router-dom';
import router from 'src/router';

import { SnackbarProvider } from 'notistack';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useAuth from 'src/hooks/useAuth';
import "src/theme/global.css"

import { CssBaseline } from '@mui/material';
import {es} from 'date-fns/locale'
import ThemeProvider from './theme/ThemeProvider';
import AppInit from './components/AppInit';

function App() {
  const content = useRoutes(router);
  const auth = useAuth();

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>

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
