import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Button, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { controlCerdasQueryAPI, controlCerdasRegisterAPI } from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import { resultCodeOk } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import AddControlMasivoModal from './AddControlMasivoModal';
import Results from './Results';

const tituloPagina = "Alimentación Cerdas"

function ControlCerdasListado() {
    const [itemListado, setItemListado] = useState([])
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const [openMasivo, setOpenMasivo] = useState(false);

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
    
    const getListado = useCallback(async (reqObj) => {
      setLoading(true)
        try {
          const response = await certifyAxios.post(controlCerdasQueryAPI, reqObj);
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
    
    // modal control masivo
    const closeControlModal = () => {
      setOpenMasivo(false);
    };
  
    // agregar api
    const agregarControl = async (reqObj) => {
      try {
        const response = await certifyAxios.post(controlCerdasRegisterAPI, reqObj);
        if (response.data?.resultCode === resultCodeOk) {
          const reqObj = defaultObj;
          getListado(reqObj);
          successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
        }
        closeControlModal();
      } catch (error) {
        console.error(error);
        showUserErrors(error, 'No se ha podido agregar. Inténtelo de nuevo');
      }
    };
    
      
    // add or edit
    const navigateToDetalle = (id) => {
      navigate('/sp/porcicultor/alimentacion/cerdas/detalle', {state:{cerdaId: id}});
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
                    onClick={() => {setOpenMasivo(true)}}
                    variant="contained"
                    startIcon={<AddTwoToneIcon fontSize="small" />}
                    >
                      Control por Estado 
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
            {openMasivo && <AddControlMasivoModal
            open={openMasivo}
            modalClose={closeControlModal}
            handleAction={agregarControl}
            granjaId={user.granjaId}
            />}
        </>
    )
    
}

export default ControlCerdasListado;