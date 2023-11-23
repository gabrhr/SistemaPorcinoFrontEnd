import { useTheme } from '@emotion/react';
import { DialogContent, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import BackdropLoading from 'src/components/BackdropLoading';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { estGeneralAPI } from 'src/utils/apiUrls';
import { errorMessage } from 'src/utils/notifications';
import certifyAxios from 'src/utils/spAxios';
import CerdaEstados from './CerdasEstados';
import LechonesEstados from './LechonesEstados';

function EstadisticasGranja() {
  
  const [general, setGeneral] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMountedRef = useRefMounted();
  const {user} = useAuth();

  const getGeneral = useCallback(async (reqObj) => {
    setLoading(true)
      try {
        const response = await certifyAxios.post(estGeneralAPI, reqObj);
        if (isMountedRef.current) {
          if(response.data) {
            setGeneral(response.data)
          } else {
            setGeneral({})
          }
        }
        setLoading(false)
      } catch (err) {
        setGeneral({})
        setLoading(false)
        errorMessage("El servicio ha encontrado un error")
      }
  }, [isMountedRef])

  useEffect(() => {
      const reqObj = {
        "granjaId": user.granjaId
      };
      getGeneral(reqObj);
    }, [getGeneral]);

  return (<>
    <Helmet>
      <title>Calendario</title>
    </Helmet>
    <PageTitleWrapper>
      <Grid container alignItems="center">
        <Grid item xs={10} md={6} sm={6} alignItems="left">
          <Typography variant="h3" component="h3" gutterBottom>
            Estadísticas
          </Typography>
        </Grid>
      </Grid>
    </PageTitleWrapper>
    <DialogContent
      sx={{
        py: theme.spacing(3),
        px: theme.spacing(4),
        mx: theme.spacing(4),
        mb: theme.spacing(3),
        background: 'white',
        borderRadius: 2
      }}
    >
      <BackdropLoading open={loading}/>
      <Grid
        sx={{
          px: 4,
          mb: 3
        }}
        container
        direction="row"
        justifyContent="center"
      >
        <Grid item xs={12}>
          <Tabs defaultActiveKey={1} id="estadisticas-tab">
            <Tab eventKey={1} title="General">
                <Grid container item xs={12} sm={12} md={12} spacing={2} mb={2} pt={2}>
                  <Grid item xs={12} sm={12} md={6}>
                    <CerdaEstados general={general}/>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <LechonesEstados general={general}/>
                  </Grid>
                </Grid>
            </Tab>
            <Tab eventKey={2} title="Cerdas">
                b
            </Tab>
            <Tab eventKey={3} title="Lechones">
                a
            </Tab>
          </Tabs>
        </Grid>
      </Grid>
    </DialogContent>
  </>);
}

export default EstadisticasGranja;
