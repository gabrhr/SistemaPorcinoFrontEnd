import { useRoutes } from 'react-router-dom';
import router from 'src/router';

import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from 'src/hooks/useAuth';
import "src/theme/global.css";

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { CssBaseline } from '@mui/material';
import { esES } from '@mui/x-date-pickers/locales';
import "dayjs/locale/es";
import AppInit from './components/AppInit';
import ThemeProvider from './theme/ThemeProvider';

function App() {
  const content = useRoutes(router);
  const auth = useAuth();

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
          <CssBaseline />
          {auth.isInitialized ? content : <AppInit />}
          <ToastContainer
            position="top-right"
            autoClose={7000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            theme="dark"
            className="text-toast"
          />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;
