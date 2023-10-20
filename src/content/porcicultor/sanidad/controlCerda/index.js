import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { loteDeleteAPI, servicioQueryAPI } from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import { Tab, Tabs } from 'react-bootstrap';
import { errorMessage, successMessage } from 'src/utils/notifications';
import Results from './Results';

const tituloPagina = "Control Sanitario de Cerdas"

function LineasGeneticasListado() {
    const [itemListado, setItemListado] = useState([])
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);

    const isMountedRef = useRefMounted();
    const {user} = useAuth();
    const navigate = useNavigate();

    const defaultObj = {
        "codigo": "",
        "tipo": "",
        "pageNumber": 1,
        "maxResults": 10,
        "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
      setLoading(true)
        try {
          const response = await certifyAxios.post(servicioQueryAPI, reqObj);
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
          errorMessage("El servicio ha encontrado un error")
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
        const response = await certifyAxios.post(loteDeleteAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          successMessage(response.data.userMsg?? "Se ha eliminado satisfactoriamente")
        }
      } catch (error) {
        console.error(error)
        showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
      }
      afterDelete()
    }
    
    // add or edit
    const navigateToDetalle = (id) => {
      navigate('/sp/porcicultor/sanidad/cerdas/lote-detalle', {state:{loteId: id}});
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
                <Tabs defaultActiveKey={1} id="uncontrolled-tab-sanitario">
                <Tab eventKey={1} title="Lotes de Servicio">
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
                  />
                </Tab>  
                {/* <Tab eventKey={2} title="Cerdas de Reemplazo">
                  <ResultsReemplazo
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
                  />
                </Tab>   */}
                </Tabs>  
                        
                </Grid>
            </Grid>
        </>
    )
    
}

export default LineasGeneticasListado;