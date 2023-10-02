import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Button, Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { cerdaDeleteAPI, cerdaDescartarAPI, cerdaQueryAPI } from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import Results from './Results';

const tituloPagina = "Cerdas"
const itemSingular = "Cerda"

function LineasGeneticasListado() {
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
          const response = await certifyAxios.post(cerdaQueryAPI, reqObj);
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

    // delete
    const deleteItemById = async (id, afterDelete) => {
      try {
        const reqObj = {
          id
        }
        const response = await certifyAxios.post(cerdaDeleteAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          enqueueSnackbar(response.data.userMsg?? "Se ha eliminado satisfactoriamente", {variant:"success"})
        }
      } catch (error) {
        console.error(error)
        showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
      }
      afterDelete()
    }
    
    // descartar
    const descartarById = async (reqObj, afterDelete) => {
      try {
        const response = await certifyAxios.post(cerdaDescartarAPI, reqObj);
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


    // redirect add 
    const navigateToNuevo = () => {
      navigate('/sp/porcicultor/porcinos/cerdas/nuevo');
    };

    // redirect edit
    const navigateToDetalle = (id) => {
      navigate('/sp/porcicultor/porcinos/cerdas/detalle', {state:{cerdaId: id}});
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
                </Grid>
                <Grid item>
                    <Button
                    sx={{
                        mt: { xs: 2, sm: 0 }
                    }}
                    onClick={navigateToNuevo}
                    variant="contained"
                    startIcon={<AddTwoToneIcon fontSize="small" />}
                    >
                        Agregar {itemSingular}
                    </Button>
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
                            deleteById={deleteItemById}
                            navigateToDetalle={navigateToDetalle}
                            granjaId={user.granjaId}
                            loading={loading}
                            descartarById={descartarById}
                        />
                </Grid>
            </Grid>
        </>
    )
    
}

export default LineasGeneticasListado;