import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import certifyAxios from 'src/utils/spAxios';

import { maternidadQueryAPI } from 'src/utils/apiUrls';
import Results from './Results';

const tituloPagina = "Maternidad"

function ServicioListado() {
    const [itemListado, setItemListado] = useState([])
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);

    const isMountedRef = useRefMounted();
    const { enqueueSnackbar } = useSnackbar();
    const {user} = useAuth();
    const navigate = useNavigate();

    const defaultObj = {
        "codigo": "",
        "estado": "",
        "pageNumber": 1,
        "maxResults": 10,
        "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
      setLoading(true)
        try {
          const response = await certifyAxios.post(maternidadQueryAPI, reqObj);
          if (isMountedRef.current) {
            if(response.data.list.length === 0 && response.data.total > 0) {
              const lastPage = Math.ceil(response.data.total / reqObj.maxResults);
              reqObj.pageNumber = lastPage;
              setPageNumber(lastPage - 1);
              getListado(reqObj);
            }
            else {
              setItemListado(response.data.list);
              setNumberOfResults(response.data.total);
            }
          }
          setLoading(false)
        } catch (err) {
          setItemListado([])
          setLoading(false)
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
        const reqObj = defaultObj;
        getListado(reqObj);
      }, [getListado]);
    
    const onPageParamsChange = (reqObj) => {
      if(reqObj.maxResults &&  pageSize !== reqObj.maxResults){
        setPageSize(reqObj.maxResults) // "limit" en Results.js
      }
      getListado(reqObj)
    }    
    
    // edit
    const navigateToDetalle = (id, nombre) => {
      console.log(id, nombre);
      navigate('/sp/porcicultor/manejo/maternidad/lote-detalle', {state:{loteId: id, loteNombre:nombre }});
    };

    return(
        <>
            <Helmet>
                <title>{tituloPagina}</title>
            </Helmet>
            <PageTitleWrapper>
                <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                    <Typography variant="h3" gutterBottom>
                        {tituloPagina}
                    </Typography>
                    <Typography>
                      Esta fase se realiza por lotes de Servicio que han culminado con un parto
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
                            onPageParamsChange={onPageParamsChange}
                            numberOfResults={numberOfResults}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            navigateToDetalle={navigateToDetalle}
                            granjaId={user.granjaId}
                            loading={loading}
                        />
                </Grid>
            </Grid>
        </>
    )
    
}

export default ServicioListado;