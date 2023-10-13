import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Breadcrumbs, Grid, IconButton, Link, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import { maternidadLoteQueryAPI, servicioFalloRegisterAPI } from 'src/utils/apiUrls';
import { errorMessage, successMessage } from 'src/utils/notifications';
import Results from './Results';

const tituloPagina = "Detalle de Servicio del Lote"

const mainUrl = "/sp/porcicultor/manejo/servicio"

function LineasGeneticasListado() {
    const [itemListado, setItemListado] = useState([])
    const [itemName, setItemName] = useState(null)
    const [loteInfo, setLoteInfo] = useState(null)
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [loading, setLoading] = useState(false);

    const isMountedRef = useRefMounted();
    const {user} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const defaultObj = {
        "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
      setLoading(true)
        try {
          const response = await certifyAxios.post(maternidadLoteQueryAPI, reqObj);
          if (isMountedRef.current) {
              setItemListado(response.data.list);
              setLoteInfo(response.data.lote)
              setNumberOfResults(response.data.total);
          }
          setLoading(false)
        } catch (err) {
          
          if (err.response) {
            console.log(err.response);
          } else if (err.request) {
            console.error(err.request);
          } else {
            console.error('Servicio encontró un error');
          }
          errorMessage("El servicio ha encontrado un error")
        }
    }, [isMountedRef])

    useEffect(() => {
      if (location && location.state && location.state.loteId !== -1) {
        let reqObj = defaultObj;
        reqObj.loteId = location.state.loteId
        setItemName(location?.state?.loteNombre || "")
        getListado(reqObj);
      } else {
        setItemListado([])
      }        
    }, [getListado]);
    

    // registrar fallo
    const registerFalloById = async (reqObj, afterDelete) => {
      try {
        const response = await certifyAxios.post(servicioFalloRegisterAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          defaultObj.loteId = loteInfo.id
          getListado(defaultObj)
          successMessage(response.data.userMsg?? "Se ha registrado fallo satisfactoriamente")
        }
      } catch (error) {
        showUserErrors(error, "No se ha podido agregar fallo. Inténtelo de nuevo")
      }
      afterDelete()
    }
    
    // add or edit
    const navigateToDetalle = (id) => {
      navigate('/sp/porcicultor/manejo/maternidad/lote-detalle/cerda-maternidad', {
        state:{
          maternidadId: id, 
          loteId: location.state.loteId, 
          loteNombre: itemName
        }
      });
    };

    const navigateToMain = () => {
      navigate(mainUrl);
    };

    return(
        <>
            <Helmet>
                <title>{tituloPagina}</title>
            </Helmet>
            <PageTitleWrapper>
                <Grid container alignItems="center">
                <Grid item xs={12} md={12} sm={12} mb={2}>
                  <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" onClick={navigateToMain}>
                      Listado de Maternidades
                    </Link>
                    <Typography color="text.primary">Maternidad del Lote</Typography>
                  </Breadcrumbs>
                </Grid>
                <Grid item xs={2} md={0.5} sm={0.5}>
                    <IconButton size="small" onClick={navigateToMain}>
                      <KeyboardArrowLeftRoundedIcon />
                    </IconButton>
                  </Grid>
                <Grid item>
                    <Typography variant="h3" gutterBottom>
                        {tituloPagina}
                        {` ${itemName || ""}`}
                    </Typography>
                </Grid>
                {/* Lote info cuadro */}
                {loteInfo?.totalCerdas}
                </Grid>
            </PageTitleWrapper>
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
                        <Results
                            itemListado={itemListado} 
                            getListado={getListado}
                            numberOfResults={numberOfResults}
                            registerFalloById={registerFalloById}
                            navigateToDetalle={navigateToDetalle}
                            granjaId={user.granjaId}
                            loading={loading}
                        />
                </Grid>
            </Grid>
        </>
    )
    
}

export default LineasGeneticasListado;