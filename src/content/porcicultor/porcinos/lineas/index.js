import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Button, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { lineaDeleteAPI, lineaQueryAPI, lineaRegisterAPI, lineaUpdateAPI } from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import { successMessage } from 'src/utils/notifications';
import AddEditModal from './AddEditModal';
import Results from './Results';

const tituloPagina = "Líneas genéticas"
const itemSingular = "Línea genética"

function LineasGeneticasListado() {
    const [itemListado, setItemListado] = useState(undefined)
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const [openAdd, setOpenAdd] = useState(false)
    
    const isMountedRef = useRefMounted();
    const {user} = useAuth();

    const defaultObj = {
        "nombre": "",
        "pageNumber": 1,
        "maxResults": 10,
        "granjaId": user.granjaId
    }
    
    const getListado = useCallback(async (reqObj) => {
        setLoading(true)
        try {
          const response = await certifyAxios.post(lineaQueryAPI, reqObj);
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
          showUserErrors(err)
          setLoading(false)
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
    const addItem = async (reqObj, afterAction) => {
      try {
        const response = await certifyAxios.post(lineaRegisterAPI, reqObj);
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
        const response = await certifyAxios.post(lineaUpdateAPI, reqObj);
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
        const response = await certifyAxios.post(lineaDeleteAPI, reqObj);
        if(response.data?.resultCode === resultCodeOk){
          getListado(defaultObj)
          successMessage(response.data.userMsg?? "Se ha eliminado satisfactoriamente")
        }
      } catch (error) {
        showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
      }
      afterDelete()
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
                        />
                </Grid>
            </Grid>

            {/* Modal Add */}
            <AddEditModal
              openConfirmModal={openAdd}
              closeConfirmModal={addModalOpenHandle}
              title={`Nueva ${itemSingular}`}
              item= {null}
              handleCompleted={addItem}
              granjaId={user.granjaId}
            />
        </>
    )
    
}

export default LineasGeneticasListado;