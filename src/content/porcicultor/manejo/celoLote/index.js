import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Breadcrumbs, Grid, IconButton, Link, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { celoLoteQueryAPI, cerdaCeloDescartarAPI } from 'src/utils/apiUrls';
import Results from './Results';

const tituloPagina = "Detalle de Celo del Lote"

const mainUrl = "/sp/porcicultor/manejo/celo"

function LineasGeneticasListado() {
    const [itemListado, setItemListado] = useState([])
    const [itemName, setItemName] = useState(null)
    const [statusHeaderCerda, setStatusHeaderCerda] = useState(true)
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [loading, setLoading] = useState(false);

    const isMountedRef = useRefMounted();
    const { enqueueSnackbar } = useSnackbar();
    const {user} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const defaultObj = {
        "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
      setLoading(true)
        try {
          const response = await certifyAxios.post(celoLoteQueryAPI, reqObj);
          if (isMountedRef.current) {
              setItemListado(response.data.list);
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
          enqueueSnackbar("El servicio ha encontrado un error", {variant:"error"})
        }
    }, [isMountedRef])

    useEffect(() => {
      if (location?.state?.loteId !== -1) {
        let reqObj = defaultObj;
        reqObj.loteId = location.state.loteId
        setItemName(location?.state?.loteNombre || "")
        setStatusHeaderCerda(location?.state?.disableStatusCerda || false)
        getListado(reqObj);
      } else {
        setItemListado([])
      }        
    }, [getListado]);
    

    // descartar cerda en etapa celo
    const descartarById = async (loteCerdaCeloId, reqObj, afterDelete) => {
      try {

        const reqObjCelo = {
          fechaDescarte: reqObj.fechaDescarte,
          motivo: reqObj.motivo,
          loteCerdaCeloId
        }

        const response = await certifyAxios.post(cerdaCeloDescartarAPI, reqObjCelo);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          enqueueSnackbar("La cerda ha sido descartada", {variant:"success"})
        }
      } catch (error) {
        console.error(error)
        showUserErrors(error, "No se ha podido descartar. Inténtelo de nuevo")
      }
      afterDelete()
    }

    
    // add or edit de cerda
    const navigateToDetalle = (id) => {
      navigate('/sp/porcicultor/manejo/celo/lote-detalle/cerda-celo', {
        state:{
          celoId: id, 
          loteId: location.state.loteId, 
          loteNombre: itemName, 
          disableStatusCerda: statusHeaderCerda 
        }
      });
    };

    // return
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
                      Listado de Celos
                    </Link>
                    <Typography color="text.primary">Celo del Lote</Typography>
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
                            descartarById={descartarById}
                            navigateToDetalle={navigateToDetalle}
                            granjaId={user.granjaId}
                            loading={loading}
                            statusHeaderCerda={statusHeaderCerda}
                        />
                </Grid>
            </Grid>
        </>
    )
    
}

export default LineasGeneticasListado;