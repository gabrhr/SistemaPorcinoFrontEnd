import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useCallback, useEffect, useRef, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { alimentoFindByIdAPI, alimentoRegisterAPI, alimentoUpdateAPI, compraDeleteAPI, compraRegisterAPI } from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import CerdaEstadoChip from 'src/components/CerdaEstadoChip';
import DataView from 'src/components/Form/DataView';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';
import { listCategoriasAlimento, resultCodeOk } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import AddCompraModal from './AddCompraModal';
import DeleteCompraModal from './DeleteCompraModal';

const categorias = listCategoriasAlimento()

function AddEditAlimento() {
  const [item, setItem] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
  const [editActive, setEditActive] = useState(false);
  const [compraModal, setCompraModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false)
  const [comprasList, setComprasList] = useState([]);  
  const [currentItem, setCurrentItem] = useState({})
  const [indexCompraDelete, setIndexCompraDelete] = useState(999);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();
  const formLote = useRef();

  // get cerda by id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(alimentoFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setComprasList(response.data.compraAlimentoList || [])
            getIndex(response.data)
          }
        }
      } catch (err) {
        console.error(err);
        setItem({});
        setComprasList([])
        if (err.response) {
          console.log(err.response);
        } else {
          console.error('Servicio encontró un error');
        }
        errorMessage('El servicio ha encontrado un error');
      }
    },
    [isMountedRef]
  );

  useEffect(() => {
    if (location.state.alimentoId !== -1) {
      // id de navigate
      setEditMode(true);
      const request = {
        id: location.state.alimentoId
      };
      getItemById(request);
    } else {
      setEditActive(true)
      setItem({});
    }

  }, [getItemById]);


  const resetStates = (edit = false) => {
     if(edit){
       setEditActive(false)
     }
     setLoading(false)
  };
  
  

  // add
  const addItem = async (reqObj) => {
    try {
      const response = await certifyAxios.post(alimentoRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
      }
      navigateToMain()
      resetStates()
    } catch (error) {
      resetStates()
      console.error(error);
      showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
    }
  };

  // edit
  const editItemById = async (reqObj, resetForm) => {
   try {
      const response = await certifyAxios.post(alimentoUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({id: reqObj.id})
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
        resetStates(true)

      }
    } catch (error) {
      resetStates(true)
      resetForm()
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
  };

  // return
  const navigateToMain = () => {
    navigate(-1);
  };

  // agregar alimento
  // open close modal
  const openCompraModal = () => {
      setCompraModal(true)      
  }

  const closeCompraModal = () => {
    setCompraModal(false)      
  }

  // agregar api
  const agregarCompra = async (reqObj) => {
    try {
      const response = await certifyAxios.post(compraRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({id: item.id})
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
      }
      closeCompraModal()
    } catch (error) {
      console.error(error);
      showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
    }
  };
  

  // eliminar compra

  // open close modal
  const openDeleteModal = (item) => {
    setCurrentItem(item)
      setOpenDelete(true)      
  }

  const closeDeleteModal = () => {
    setCurrentItem({})
    setOpenDelete(false)
  }

  // eliminar 
  const deleteItem = async () => {
    // llamada
    try {
      const reqObj = {
        id: currentItem.id
      }
      const response = await certifyAxios.post(compraDeleteAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        getItemById({id: item.id})
        closeDeleteModal()
        successMessage(response.data.userMsg?? "Se ha eliminado satisfactoriamente")
      }
    } catch (error) {
      closeDeleteModal()
      console.error(error)
      showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
    }
  };
  
  
  // validar todo 
  const validateForm = () => {
    if(loading) return true
    if(formLote && formLote.current && !formLote?.current?.isValid)
    {
      return true
    }
     return false
  };

  // get delete show index   
  const getIndex = (e) => {
    if(e?.compraAlimentoList && e?.compraAlimentoList?.length > 0){
      const temp = [...e.compraAlimentoList]
      if(e.cantidadActual && e.cantidadTotal){
        let cantidadSobrante = e.cantidadActual
        if(cantidadSobrante){
          let index =999
          for (let i = 0; i < temp.length; i++) {
            cantidadSobrante -=  (temp[i].cantidad || 0)
            if (cantidadSobrante <0) {
              index = i  
              break
            }
          }
          setIndexCompraDelete(index)
        }
      }
    }

  };
  
  

  return (
    <>
      <Helmet>
        <title>Detalle Alimento</title>
      </Helmet>
      <PageTitleWrapper>
                <Grid container alignItems="center">
                  <Grid item xs={2} md={0.5} sm={0.5}>
                    <IconButton size="small" onClick={navigateToMain}>
                      <KeyboardArrowLeftRoundedIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={10} md={6} sm={6} alignItems="left">
                    {/* Titulo */}
                    <Typography variant="h3" component="h3" gutterBottom>
                      {!editMode ? 'Agregar alimento' : 'Detalle alimento'}
                    </Typography>
                  </Grid>
                  {/* Solo para agregar */}
                  {!editMode && (
                    <Grid
                      item
                      xs={12}
                      sm={5}
                      md={5.5}
                      sx={{
                        display: 'flex',
                        [theme.breakpoints.up('sm')]: {
                          justifyContent: 'flex-end'
                        },
                        [theme.breakpoints.down('sm')]: {
                          justifyContent: 'center'
                        }
                      }}
                    >
                      <Button
                        color="error"
                        size="small"
                        variant="outlined"
                        sx={{
                          mr: 2
                        }}
                        onClick={() => {
                            navigateToMain();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if(formLote?.current){
                            formLote.current.handleSubmit()
                          }
                        }}
                        startIcon={
                          loading ? <CircularProgress size="1rem"  color='white'/> : null
                        }
                        disabled={validateForm()}
                        variant="contained"
                        size="small"
                        color="primary"
                      >
                        Guardar Cambios
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </PageTitleWrapper>
        {/* Form and table */}
        <DialogContent
                sx={{
                  py: theme.spacing(3),
                  mb: theme.spacing(3),
                  px: theme.spacing(6),
                  mx: theme.spacing(4),
                  background: 'white',
                  borderRadius: 2
                }}
              >
        
        <>
        {item !== undefined && <Formik
         innerRef={formLote}
         enableReinitialize
          initialValues={{
            nombre: (editMode && item && item.nombre) || '',
            categoria: (editMode && item && item.categoria) || "none",
            descripcion: (editMode && item && item.descripcion) || "",
            consumoRecomendado: (editMode && item && item.consumoRecomendado) || 0,
          }}
          validationSchema={Yup.object().shape({
            nombre: Yup.string().required('El nombre es requerido'),
            categoria: Yup.string().matches(/^(?!none\b)/i, 'Seleccionar una categoría').required('La categoría es obligatoria'),
            descripcion: Yup.string().required('La descripción es requerida'),
            consumoRecomendado: Yup.number().min(0, 'El consumo es requerido').required('El consumo es requerido')
          })}
          onSubmit={async (values, {resetForm}) => {
            setLoading(true)
            const request = {
              nombre: values.nombre,
              categoria: values.categoria,
              descripcion: values.descripcion,
              consumoRecomendado: values.consumoRecomendado,
              granjaId: user.granjaId
            };
            if (editMode && editActive) {
              request.id = item.id;
              editItemById(request);
            } else {
              addItem(request, resetForm);
            }
          }}
        >
          {({
            errors,
            touched,
            handleBlur,
            handleChange,
            values,
            handleSubmit,
            isValid,
            dirty,
            isSubmitting,
            resetForm
          }) => (
            <form noValidate onSubmit={handleSubmit}>
              
              {/* Form and table */}
                
                <Grid container justifyContent="center" spacing={3} mb={3}>
                  {/* Form */}
                  <SubtitleForm subtitle='Datos generales' list>
                    {(editMode && !editActive) && (
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        sx={{
                          display: 'flex',
                          [theme.breakpoints.up('sm')]: {
                            justifyContent: 'flex-end'
                          },
                          [theme.breakpoints.down('sm')]: {
                            justifyContent: 'center'
                          }
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => {
                            setEditActive(true);
                          }}
                        >
                          Editar
                        </Button>
                      </Grid>
                    )}
                    {(editMode && editActive) && ( 
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      sx={{
                        display: 'flex',
                        [theme.breakpoints.up('sm')]: {
                          justifyContent: 'flex-end'
                        },
                        [theme.breakpoints.down('sm')]: {
                          justifyContent: 'center'
                        }
                      }}
                    >
                      <Button
                        color="error"
                        size="small"
                        variant="outlined"
                        sx={{
                          mr: 2
                        }}
                        onClick={() => {
                            setEditActive(false);
                            resetForm()
                            setComprasList(item.compraAlimentoList || [])
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        startIcon={
                          loading ? <CircularProgress size="1rem"  color='white'/> : null
                        }
                        disabled={(!isValid || !dirty) || isSubmitting}
                        variant="contained"
                        size="small"
                        color="primary"
                      >
                        Guardar Cambios
                      </Button>
                    </Grid>
                    )}
                  </SubtitleForm>
                  <Grid container item xs={12} sm={12} md={12} spacing={4}>
                    {/* Nombre */}
                    <Grid item xs={12} sm={12} md={4}>
                      <InputForm
                        inputName="nombre"
                        value={values.nombre}
                        label="Nombre"
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        handleBlur={handleBlur}
                        disabled={!editActive}
                      />
                    </Grid>
                   {/* Categoria */}
                   <Grid item xs={12} sm={12} md={4}>
                      <SelectForm
                      key="categoria"
                      label="Categoría"
                      name="categoria"
                      value={values.categoria}
                      onChange={handleChange}
                      handleBlur={handleBlur}
                      errors={errors}
                      disabled={!editActive}
                      touched={touched}
                      >
                        {categorias.map((e) => (
                          <MenuItem key={e.value} value={e.value}>
                            {e.text}
                          </MenuItem>
                        ))}
                      </SelectForm>
                    </Grid>
                    {/* Consumo diario */}
                   <Grid item xs={12} sm={12} md={4}>
                   <InputForm
                      inputName="consumoRecomendado"
                      value={values.consumoRecomendado}
                      label="Consumo diario recomendado (kg)"
                      placeholder="Consumo diario"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      type='number'
                      inputProps={{ min: '0' }}
                      disabled={!editActive}
                    />
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} sm={12} md={12} spacing={4}>
                  <Grid item xs={12} sm={12} md={12}>
                  <InputForm
                        inputName="descripcion"
                        value={values.descripcion}
                        label="Descripción"
                        placeholder='Breve descripción del alimento'
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        handleBlur={handleBlur}
                        disabled={!editActive}
                        multiline
                        />
                        </Grid>
                  </Grid>
                </Grid>
            </form>
          )}
        </Formik>}
        {/* List */}
        <Divider className='divider-form'/>
        {editMode && (item !== undefined) && 
        <Grid container justifyContent="center" spacing={2}>
          <SubtitleForm subtitle='Consumo de alimento' />
          <Grid container item xs={12} sm={12} md={12} spacing={4}>
            <Grid item xs={12} sm={12} md={4}>
            <DataView label='Cantidad consumidad (kg)' 
            text={(item?.cantidadTotal && item?.cantidadActual && item.cantidadTotal - item.cantidadActual)?? "No se ha consumido"}
            />
           </Grid> 
           <Grid item xs={12} sm={12} md={4}>
            <DataView label='Cantidad actual (kg)' 
            text={(item?.cantidadActual)?? "0"}
            />
           </Grid> 
           <Grid item xs={12} sm={12} md={4}>
            <DataView label='Gasto Total' 
            text={(item?.gastoTotal)?? "0"}
            />
           </Grid> 
           </Grid> 
          <SubtitleForm subtitle='Listado de compras' list>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={openCompraModal}
                      >
                        Agregar compra
                      </Button>
                  </SubtitleForm>
                  <Grid item xs={12} sm={12} md={10}>
                    <Box
                      p={2}
                      display="flex"
                      alignItems="normal"
                      flexDirection="column"
                      justifyContent="space-between"
                      mr={2}
                    >
                      <Box>
                        <Typography component="span" variant="subtitle1">
                          Total de compras:
                        </Typography>{' '}
                        <b>{comprasList.length || 0}</b> 
                      </Box>
                      <Box>
                        <Typography component="span" variant="subtitle1">
                          Total de cantidad (kg):
                        </Typography>{' '}
                        <b>{item?.cantidadTotal || 0}</b> 
                      </Box>
                    </Box>
                    <Divider />
                    <TableContainer>
                      <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Fecha de Compra</TableCell>
                          <TableCell align='center'>Cantidad (kg)</TableCell>
                          <TableCell align='center'>Precio Unitario</TableCell>
                          <TableCell align='center'>Precio Total</TableCell>
                          <TableCell align='center'>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                          {comprasList?.length !== 0 &&
                            comprasList.map((element, idx) => {
                              return (
                              <TableRow hover key={idx}>
                                <TableCell>
                                  {element?.fechaCompra && formatDate(element.fechaCompra) || ""}
                                </TableCell>
                                <TableCell align='center'>
                              <CerdaEstadoChip estado={element?.cantidad ?? '0'} />
                            </TableCell>
                                <TableCell align='center'>
                                  {element?.precioUnitario?? "0"}
                                </TableCell>
                                <TableCell align='center'>
                                  {(element && element.precioUnitario && element.cantidad) && 
                                  element.precioUnitario*element.cantidad || 0}
                                </TableCell>
                                
                                <TableCell align='center'>
                                  {idx < indexCompraDelete && <Tooltip title="Remover compra">
                                    <IconButton color="error" 
                                        sx={{borderRadius:30}}
                                        onClick={()=> {openDeleteModal(element)}}
                                        >
                                        <DeleteRoundedIcon/>                          
                                    </IconButton>
                                    </Tooltip>}
                                </TableCell>
                              </TableRow>
                              )
                            })
                          }
                      </TableBody>
                      </Table>
                    </TableContainer>
                    {comprasList?.length === 0  &&
                      <Box p={2}>
                        <Typography
                          sx={{
                            py: 2
                          }}
                          variant="h3"
                          fontWeight="normal"
                          color="text.secondary"
                          align="center"
                        >
                          Sin compras registradas
                        </Typography>
                      </Box>
                    }
                  </Grid>
        </Grid>
      }
        </>
        </DialogContent>
      {compraModal && <AddCompraModal
      open ={compraModal}
      modalClose={closeCompraModal}
      handleAction={agregarCompra}
      alimentoId ={item.id}
      />}
      {openDelete && <DeleteCompraModal
      openConfirmDelete={openDelete}
      closeConfirmDelete={closeDeleteModal}
      title="Eliminar Compra"
      itemName={` la compra realizada el ${currentItem?.fechaCompra? formatDate(currentItem?.fechaCompra) : "" }`}
      handleDeleteCompleted={deleteItem}
    />
      }
    </>
  );
}

export default AddEditAlimento;
