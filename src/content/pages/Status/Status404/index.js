import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  styled
} from '@mui/material';
import { Helmet } from 'react-helmet-async';


const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    overflow: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
);


function Status404() {

  return (
    <>
      <Helmet>
        <title>Página No Existe</title>
      </Helmet>
      <MainContent>
        <Container maxWidth="md">
          <Box textAlign="center">
            <img alt="404" height={180} src="/static/images/status/500.svg" />
            <Typography
              variant="h2"
              sx={{
                my: 2
              }}
            >
              La página no existe
            </Typography>
          </Box>
          <Container maxWidth="sm">
            <Card
              sx={{
                textAlign: 'center',
                mt: 3,
                p: 4
              }}
            >
              <Typography
                  variant="h4"
                  color="text.secondary"
                  fontWeight="normal"
                  sx={{
                    mb: 4
                  }}
                >
                  La página que se busca no ha sido encontrada
                </Typography>
              <Button href="/overview" variant="outlined">
                Volver al inicio
              </Button>
            </Card>
          </Container>
        </Container>
      </MainContent>
    </>
  );
}

export default Status404;
