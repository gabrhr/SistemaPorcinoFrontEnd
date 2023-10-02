import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Button, Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import { servicioQueryAPI, servicioRegisterAPI } from 'src/utils/apiUrls';
import AddModal from './AddModal';
import Results from './Results';

const tituloPagina = "Sevicio y Gestación"
const itemSingular = "Servicio"

function ServicioListado() {
    const [itemListado, setItemListado] = useState([])
    const [openAdd, setOpenAdd] = useState(false);
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

    // add
    const addItem = async (reqObj) => {
      try {
        const response = await certifyAxios.post(servicioRegisterAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          enqueueSnackbar(response.data.userMsg?? "Se agregó satisfactoriamente", {variant:"success"})
        }
        addModalOpenHandle()
      } catch (error) {
        addModalOpenHandle()
        showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
      }
    }

    const addModalOpenHandle = () => {
       setOpenAdd(!openAdd)
    };
    
    
    // edit
    const navigateToDetalle = (id, nombre) => {
      console.log(id, nombre);
      navigate('/sp/porcicultor/manejo/servicio/lote-detalle', {state:{loteId: id, loteNombre:nombre }});
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
                      Esta fase se realiza por lotes
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                    sx={{
                        mt: { xs: 2, sm: 0 }
                    }}
                    onClick={() => {setOpenAdd(true)}}
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
                            navigateToDetalle={navigateToDetalle}
                            granjaId={user.granjaId}
                            loading={loading}
                        />
                </Grid>
            </Grid>
            {openAdd && 
              <AddModal
                openConfirmModal={openAdd}
                closeConfirmModal={addModalOpenHandle}
                title={`Nuevo ${itemSingular}`}
                handleCompleted={addItem}
                granjaId={user.granjaId}
              />}
        </>
    )
    
}

export default ServicioListado;