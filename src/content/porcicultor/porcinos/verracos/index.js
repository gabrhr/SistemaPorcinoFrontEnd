import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Button, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { lineaQueryAllAPI, verracoDeleteAPI, verracoQueryAPI, verracoRegisterAPI, verracoUpdateAPI } from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import { errorMessage, successMessage } from 'src/utils/notifications';
import AddEditModal from './AddEditModal';
import Results from './Results';

const tituloPagina = "Verracos"
const itemSingular = "Verraco"

function VerracosListado() {
    const [itemListado, setItemListado] = useState([])
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const [openAdd, setOpenAdd] = useState(false)
    const [lineas, setLineas] = useState(undefined);

    const isMountedRef = useRefMounted();
    const {user} = useAuth();

    const defaultObj = {
        "codigo": "",
        "pageNumber": 1,
        "maxResults": 10,
        "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
        try {
          const response = await certifyAxios.post(verracoQueryAPI, reqObj);
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
        setLoading(true)
        getListado(reqObj);
        getLineas()
      }, [getListado]);
    
      const onPageParamsChange = (reqObj) => {
        if(reqObj.maxResults &&  pageSize !== reqObj.maxResults){
          setPageSize(reqObj.maxResults) // "limit" en Results.js
        }
        getListado(reqObj)
      }
    
    // add
    const addItem = async (reqObj, afterAction) => {
      try {
        const response = await certifyAxios.post(verracoRegisterAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
        }
        addModalOpenHandle()
        afterAction()
      } catch (error) {
        showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
      }
    }
    
    // edit
    const editItemById = async (reqObj, afterAction) => {
      try {
        const response = await certifyAxios.post(verracoUpdateAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
        }
        afterAction()
      } catch (error) {
        showUserErrors(error, "No se ha podido modificar. Inténtelo de nuevo")
      }
    }
    
    // delete
    const deleteItemById = async (id, afterDelete) => {
      try {
        const reqObj = {
          id
        }
        const response = await certifyAxios.post(verracoDeleteAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          successMessage(response.data.userMsg?? "Se ha eliminado satisfactoriamente")
        }
      } catch (error) {
        showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
      }
      afterDelete()
    }

    // list lineas  
    const getLineas = async () => {
      const reqObj = {
          granjaId: user.granjaId
      }
      try {
        const response = await certifyAxios.post(lineaQueryAllAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          setLineas(response?.data?.list || [])
        }
      } catch (error) {
        console.error(error)
        setLineas([])
      }
    }
    
    // modal add
    const addModalOpenHandle = () => {
      setOpenAdd(!openAdd)
    }

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
                      Porcino dedicados a la reproducción
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                    sx={{
                        mt: { xs: 2, sm: 0 }
                    }}
                    onClick={addModalOpenHandle}
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
                            editById={editItemById}
                            granjaId={user.granjaId}
                            loading={loading}
                            lineas={lineas}
                        />
                </Grid>
            </Grid>

            {/* Modal Add */}
            {openAdd && 
            <AddEditModal
              openConfirmModal={openAdd}
              closeConfirmModal={addModalOpenHandle}
              title={`Nuevo ${itemSingular}`}
              item= {null}
              handleCompleted={addItem}
              granjaId={user.granjaId}
              lineas={lineas}
            />}
        </>
    )
    
}

export default VerracosListado;