import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { sanitarioReemplazoQueryAPI, sanitarioServicioQueryAPI } from 'src/utils/apiUrls';
import certifyAxios from 'src/utils/spAxios';

import { Tab, Tabs } from 'react-bootstrap';
import { errorMessage } from 'src/utils/notifications';
import Results from './Results';
import ResultsReemplazo from './ResultsReemplazo';

const tituloPagina = "Control Sanitario de Cerdas"

function LineasGeneticasListado() {
    const [itemListado, setItemListado] = useState([])
    const [itemListadoReemp, setItemListadoReemp] = useState([])
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [numberOfResultsReemp, setNumberOfResultsReemp] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageSizeReemp, setPageSizeReemp] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [pageNumberReemp, setPageNumberReemp] = useState(0);
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState(1);

    const isMountedRef = useRefMounted();
    const {user} = useAuth();
    const navigate = useNavigate();

    const defaultObj = {
        "codigo": "",
        "estado": "",
        "pageNumber": 1,
        "maxResults": 10,
        "granjaId": user.granjaId
    }

    const defaultObjReemp = {
      "codigo": "",
      "estado": "",
      "pageNumber": 1,
      "maxResults": 10,
      "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
      setLoading(true)
        try {
          const response = await certifyAxios.post(sanitarioServicioQueryAPI, reqObj);
          if (isMountedRef.current) {
            if(response.status === 200){
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
              const reqObjReemp = defaultObjReemp;
              await getListadoReemp(reqObjReemp)
            }
            setLoading(false)
          }
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

    const getListadoReemp = async (reqObj) => {
        try {
          setLoading(true)
          const response = await certifyAxios.post(sanitarioReemplazoQueryAPI, reqObj);
          if (isMountedRef.current) {
            if(response.data.list.length === 0 && response.data.total > 0) {
              const lastPage = Math.ceil(response.data.total / reqObj.maxResults);
              reqObj.pageNumber = lastPage;
              setPageNumberReemp(lastPage - 1);
              getListadoReemp(reqObj);
            }
            else {
              setItemListadoReemp(response.data.list);
              setNumberOfResultsReemp(response.data.total);
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
    }

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

    const onPageParamsChangeReemp = (reqObj) => {
      if(reqObj.maxResults &&  pageSizeReemp !== reqObj.maxResults){
        setPageSizeReemp(reqObj.maxResults) // "limit" en Results.js
      }
      getListadoReemp(reqObj)
    }   
    
    const changeTab = (k) => {
      setPageNumber(0)
      setKey(k)
    }

    // add or edit
    const navigateToDetalle = (id) => {
      navigate('/sp/porcicultor/sanidad/cerdas/lote-detalle', {state:{loteId: id}});
    };

    const navigateToDetalleReemp = (id) => {
      navigate('/sp/porcicultor/sanidad/cerdas/reemplazo-detalle', {state:{cerdaId: id}});
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
                <Tabs id="controlled-tab-example"
                    activeKey={key}
                    onSelect={(k) => changeTab(k)}>
                <Tab eventKey={1} title="Lotes de Servicio">
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
                </Tab>  
                <Tab eventKey={2} title="Cerdas de Reemplazo">
                  <ResultsReemplazo
                    itemListado={itemListadoReemp} 
                    getListado={getListadoReemp}
                    onPageParamsChange={onPageParamsChangeReemp}
                    numberOfResults={numberOfResultsReemp}
                    pageNumber={pageNumberReemp}
                    setPageNumber={setPageNumberReemp}
                    navigateToDetalle={navigateToDetalleReemp}
                    granjaId={user.granjaId}
                    loading={loading}
                  />
                </Tab>
                </Tabs>  
                        
                </Grid>
            </Grid>
        </>
    )
    
}

export default LineasGeneticasListado;