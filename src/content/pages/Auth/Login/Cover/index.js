import { useEffect } from 'react';
import { Link, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  // Tooltip,
  Typography,
  Container,
  // Alert,
  styled,
  Grid,
  useMediaQuery
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

import { gapi } from 'gapi-script';
import { auth0Config } from 'src/config';

import useAuth from 'src/hooks/useAuth';
import { CerdaLogin } from 'src/utils/assets';
import JWTLogin from '../LoginJWT';

const Content = styled(Box)(
  () => `
    display: flex;
    flex: 1;
    width: 100%;
`
);

// const MainContent = styled(Box)(
//   () => `
//   padding: 0 0 0 440px;
//   width: 100%;
//   display: flex;
//   align-items: center;
// `
// );

function LoginCover() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isRowBased = useMediaQuery('(min-width: 500px)');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/sp');
    }
    const initClient = () => {
      gapi.client.init({
        client_id: auth0Config.client_id,
        scope: ''
      });
    };
    gapi.load('client:auth2', initClient);
  }, []);

  return (
    <>
      <Helmet>
        <title>Inicio Sesion</title>
      </Helmet>
      <Content textAlign="center" sx={{background:"#CDEDFF"}}>
        <Container
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column'
          }}
          maxWidth="lg"
        >
          <Card
            sx={{
              p: 4,
              my: 8,
              width: isRowBased?"70vw":"90vw"
            }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 4
              }}
            >
              Sistema Porcino
            </Typography>
            <Grid container justifyContent="space-between">
             <Grid item xs={11} sm={11} md={5}>
                <img
                  src={CerdaLogin}
                  style={{ width: isRowBased? 400:50 }}
                  alt="cerda-login"
                />
              </Grid>
              <Grid item xs={11} sm={11} md={5}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 1,
                      color:"#656565"
                    }}
                  >
                    Iniciar Sesión
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    fontWeight="normal"
                    sx={{
                      mt:3,
                      mb: 3
                    }}
                  >
                    ¡Bienvenido!
                    Ingrese sus credenciales
                  </Typography>
                </Box>
                <JWTLogin />
                <Link component={RouterLink} to="/account/register/classic" style={{textTransform:"none"}}>
                  <b>¿No tiene cuenta? Regístrate</b>
                </Link>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Content>
    </>
  );
}

export default LoginCover;
