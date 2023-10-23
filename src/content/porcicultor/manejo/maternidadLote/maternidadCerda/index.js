import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { mLechonDeleteAPI, mLechonDescartarAPI, mLechonRegisterAPI, maternidadFindByIdAPI, maternidadTerminarAPI, maternidadUpdateAPI, pesosDesteteRegisterAPI } from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { Tab, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import BackdropLoading from 'src/components/BackdropLoading';
import CircularLoading from 'src/components/CircularLoading';
import DataView from 'src/components/Form/DataView';
import DatePickerReadOnly from 'src/components/Form/DatePickerReadOnly';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';
import { lechonEstado, resultCodeOk } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import AddCompraModal from './AddCompraModal';
import DeleteCompraModal from './DeleteCompraModal';
import TerminarMaternidadModal from './TerminarMaternidadModal';


const mainUrl = '/sp/porcicultor/manejo/maternidad';
const loteUrl = '/sp/porcicultor/manejo/maternidad/lote-detalle';

const desteteTemp = {
  lechonId: 0,
  pesoDestete: 0
}

function EditMaternidad() {
  const [item, setItem] = useState(undefined);
  const [editActive, setEditActive] = useState(false);
  const [editPesos, setEditPesos] = useState(false)
  const [compraModal, setCompraModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false)
  const [openDescartar, setOpenDescartar] = useState(false)
  const [lechonesList, setLechonesList] = useState([]);  
  const [pesosList, setPesosList] = useState([]);  
  const [currentItem, setCurrentItem] = useState({})
  const [loading, setLoading] = useState(false);
  const [locationState, setLocationState] = useState({});
  const [showAction, setShowAction] = useState(true);
  const [showTerminar, setShowTerminar] = useState(false);
  const [terminarMatModal, setTerminarMatModal] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();

  // get cerda by id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(maternidadFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setLechonesList(response.data.lechonList || [])
            getPesosList(response.data.lechonList || [])
            if(response.data.estado === "Finalizado"){
              setShowAction(false)
            }
            if(response?.data?.lechonesVivos > 0 && response.data.fechaDestete === null){
              setShowTerminar(true)
            } else {
              setShowTerminar(false)
            }
          }
        }
      } catch (err) {
        console.error(err);
        setItem({});
        setLechonesList([])
        if (err.response) {
          console.log(err.response);
        } else {
          console.error('Servicio encontró un error');
        }
        errorMessage('El servicio ha encontrado un error')
      }
    },
    [isMountedRef]
  );

  useEffect(() => {
    if (location.state.maternidadId !== -1) {
      // id de navigate
      setLocationState({
        loteId: location.state.loteId,
        loteNombre: location.state.loteNombre
      });
      const request = {
        id: location.state.maternidadId,
        granjaId: user.granjaId
      };
      getItemById(request);
    } else {
      setItem({});
    }

  }, [getItemById]);

  const getPesosList = (list = []) => {
    let pesos = []
    list.forEach(e => {
        const temp = {...desteteTemp}
        temp.lechonId = e.id
        if(e.estado === lechonEstado.muerto){
          temp.pesoDestete = 0.0
        } else if(e.pesoDestete !== null && e.pesoDestete !== 0.0){
          temp.pesoDestete = e.pesoDestete
        }
        pesos = pesos.concat(temp)
    })

    setPesosList(pesos)
  };

  const getPesoPromNacimiento = () => {
     if(lechonesList && lechonesList.length > 0){
      let pesos = 0;
      let lechones = 0;
      lechonesList.forEach(e => {
        if(e.estado !== lechonEstado.muerto){
          pesos += e.pesoNacimiento
          lechones += 1
        }
      })

      return (pesos/lechones).toFixed(2)
     }
     return 0;
  };
  
  

  const resetStates = (edit = false) => {
     if(edit){
       setEditActive(false)
     }
     setLoading(false)
  };

  // edit
  const editItemById = async (reqObj, resetForm) => {
   try {
      setLoading(true)
      const response = await certifyAxios.post(maternidadUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        await getItemById({id: reqObj.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
        resetStates(true)

      }
    } catch (error) {
      resetStates(true)
      resetForm()
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
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
      setLoading(true)
      const response = await certifyAxios.post(mLechonRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        closeCompraModal()
        await getItemById({id: item.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
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
      setLoading(true)
      closeDeleteModal();
      const reqObj = {
        id: currentItem.id,
        loteCerdaMaternidadId: item.id
      }
      const response = await certifyAxios.post(mLechonDeleteAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        await getItemById({id: item.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha eliminado satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
      showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
    }
  };

  // open close modal descartar
  const openDescartarModal = (item) => {
    setCurrentItem(item)
      setOpenDescartar(true)      
  }

  const closeDescartarModal = () => {
    setCurrentItem({})
    setOpenDescartar(false)
  }

  // descartar 
  const descartarItem = async () => {
    // llamada
    try {
      setLoading(true)
      closeDescartarModal()
      const reqObj = {
        id: currentItem.id,
        loteCerdaMaternidadId: item.id
      }
      const response = await certifyAxios.post(mLechonDescartarAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        await getItemById({id: item.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha descartado satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
      showUserErrors(error, "No se ha podido descartar. Inténtelo de nuevo")
    }
  };

  // open close modal descartar

  const closeTerminarModal = () => {
    setTerminarMatModal(false)
  }

  // descartar 
  const terminarMaternidad = async (reqObj) => {
    // llamada
    try {
      setLoading(true)
      const response = await certifyAxios.post(maternidadTerminarAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        closeTerminarModal()
        await getItemById({id: item.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha terminado satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
      showUserErrors(error, "No se ha podido terminar. Inténtelo de nuevo")
    }
  };

  // descartar 
  const registerPesos = async () => {
    // llamada
    const reqObj = {
      id: item?.id,
      pesoLechones: pesosList
    }
    setLoading(true)
    try {
      const response = await certifyAxios.post(pesosDesteteRegisterAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        await getItemById({id: item.id, granjaId: user.granjaId})
        setEditPesos(false)
        successMessage(response.data.userMsg?? "Se han registrado los pesos")
        setLoading(false)
      }
    } catch (error) {
      setEditPesos(false)
      setLoading(false)
      console.error(error)
      showUserErrors(error, "No se ha podido terminar. Inténtelo de nuevo")
    } 
  };

  const cambiarValor = (valor, idx) => {
    let pesosTemp = [...pesosList]
    pesosTemp[idx].pesoDestete = valor
    setPesosList(pesosTemp)
  };
  
  
  // return
  const navigateToMain = () => {
    navigate(mainUrl);
  };

  const navigateToLoteList = () => {
    navigate(loteUrl, {
      state: {
        loteId: locationState.loteId,
        loteNombre: locationState.loteNombre
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Maternidad Cerda</title>
      </Helmet>
      <PageTitleWrapper>
        <Grid container alignItems="center">
          <Grid item xs={12} md={12} sm={12} mb={2}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" onClick={navigateToMain} sx={{cursor: "pointer"}}>
                Listado de Maternidades
              </Link>
              <Link
                underline="hover"
                color="inherit"
                onClick={navigateToLoteList}
                sx={{cursor: "pointer"}}
              >
                Maternidad del Lote
              </Link>
              <Typography color="text.primary">Detalle de Cerda</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid item xs={2} md={0.5} sm={0.5}>
            <IconButton size="small" onClick={navigateToLoteList}>
              <KeyboardArrowLeftRoundedIcon />
            </IconButton>
          </Grid>
          <Grid item xs={10} md={6} sm={6} alignItems="left">
            {/* Titulo */}
            <Typography variant="h3" component="h3" gutterBottom>
              Detalle Maternidad de Cerda
            </Typography>
          </Grid>
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
        {item === undefined && <CircularLoading />}
        <BackdropLoading open={loading}/>
        {item !== undefined && (
          <>
            {showAction && showTerminar && (
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
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    setTerminarMatModal(true);
                  }}
                >
                  Terminar maternidad
                </Button>
              </Grid>
            )}
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title="Maternidad">
                <Formik
                  enableReinitialize
                  initialValues={{
                    camadaCodigo:
                      (item && item?.camada && item?.camada?.codigo) || '',
                    lechonesMuertos: (item && item.lechonesMuertos) || 0,
                    numCorralMaternidad:
                      (item && item.numCorralMaternidad) || -1
                  }}
                  validationSchema={Yup.object().shape({
                    camadaCodigo: Yup.string().required(
                      'El código es requerido'
                    ),
                    numCorralMaternidad: Yup.number()
                      .min(0, 'El corral es requerido')
                      .required('El corral es requerido')
                  })}
                  onSubmit={async (values, { resetForm }) => {
                    setLoading(true);
                    const request = {
                      camadaCodigo: values.camadaCodigo,
                      lechonesMuertos: values.lechonesMuertos,
                      numCorralMaternidad: values.numCorralMaternidad
                    };
                    if (editActive) {
                      request.id = item.id;
                      editItemById(request, resetForm);
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
                    <form noValidate onSubmit={handleSubmit} style={{marginTop: 1, paddingTop:0}}>
                      {/* Form and table */}

                      <Grid
                        container
                        justifyContent="center"
                        spacing={2}
                        mb={0}
                        pt={0}
                        mt={0}
                      >
                        {/* Form */}
                        <SubtitleForm subtitle="Datos generales" list>
                          {!editActive && (
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
                                variant="text"
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setEditActive(true);
                                }}
                                startIcon={<CreateRoundedIcon fontSize="small" />}
                              >
                                Editar
                              </Button>
                            </Grid>
                          )}
                          {editActive && (
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              mb={.2}
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
                                  resetForm({
                                    camadaCodigo:
                                      (item && item?.camada && item?.camada?.codigo) || '',
                                    lechonesMuertos: (item && item.lechonesMuertos) || 0,
                                    numCorralMaternidad:
                                      (item && item.numCorralMaternidad) || -1
                                  });
                                  setLechonesList(
                                    item?.lechonList || []
                                  );
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                startIcon={
                                  loading ? (
                                    <CircularProgress
                                      size="1rem"
                                      color="white"
                                    />
                                  ) : null
                                }
                                disabled={!isValid || !dirty || isSubmitting}
                                variant="contained"
                                size="small"
                                color="primary"
                              >
                                Guardar
                              </Button>
                            </Grid>
                          )}
                        </SubtitleForm>
                        <Grid
                          container
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          spacing={4}
                        >
                          {/* Fecha */}
                          <Grid item xs={12} sm={12} md={4}>
                              <DataView
                              label="Código Cerda"
                              text={(item?.cerda && item?.cerda?.codigo) || ''}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={4}>
                            <DataView
                              label="Fecha parto"
                              text={item?.fechaParto && formatDate(item.fechaParto) || ''}
                            />  
                          </Grid>
                          <Grid item xs={12} sm={12} md={4}>
                            <DataView
                              label="Total Lechones"
                              text={item?.totalLechones || 0}
                            /> 
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          spacing={4}
                        >
                          <Grid item xs={12} sm={12} md={4}>
                            {!editActive && 
                            <DataView
                              label="Camada Código"
                              text={values.camadaCodigo || "-"}
                            /> 
                            }
                            {editActive && <InputForm
                              inputName="camadaCodigo"
                              value={values.camadaCodigo}
                              label="Camada Código"
                              handleChange={handleChange}
                              errors={errors}
                              touched={touched}
                              handleBlur={handleBlur}
                              disabled={!editActive}
                            />}
                          </Grid>
                          <Grid item xs={12} sm={12} md={4}>
                            {(!showAction || !editActive) && 
                            <DataView
                              label="Número Corral"
                              text={values.numCorralMaternidad !== -1? values.numCorralMaternidad : "-"}
                            /> 
                            }
                            {showAction && editActive && <SelectForm
                              key="numCorralMaternidad"
                              label="Número Corral"
                              name="numCorralMaternidad"
                              value={values.numCorralMaternidad}
                              onChange={handleChange}
                              errors={errors}
                              disabled={!editActive}
                              touched={touched}
                              number
                            >
                              {[1, 2, 3, 5].map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </SelectForm>}
                          </Grid>
                          <Grid item xs={12} sm={12} md={4}>
                            {(!showAction || !editActive) && 
                            <DataView
                              label="Lechones Nacidos Muertos"
                              text={values.lechonesMuertos || 0}
                            /> 
                            }
                            {showAction && editActive && <InputForm
                              inputName="lechonesMuertos"
                              value={values.lechonesMuertos}
                              label="Lechones Nacidos Muertos"
                              handleChange={handleChange}
                              errors={errors}
                              touched={touched}
                              handleBlur={handleBlur}
                              disabled={!editActive}
                              type="number"
                              inputProps={{ min: '0' }}
                            />}
                          </Grid>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                </Formik>

                {/* List */}
                <Divider className="divider-form" />
                {item !== undefined && (
                  <Grid container justifyContent="center" spacing={2}>
                    <SubtitleForm subtitle="Lechones Nacidos Vivos" list>
                      {showAction && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={openCompraModal}
                        >
                          Agregar lechón
                        </Button>
                      )}
                      {(!showAction && !editPesos) && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => {setEditPesos(true)}}
                        >
                          Modificar pesos destete
                        </Button>
                      )}
                      {editPesos && (
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
                                  setEditPesos(false);
                                  getPesosList(item?.lechonList)
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={registerPesos}
                                startIcon={
                                  loading ? (
                                    <CircularProgress
                                      size="1rem"
                                      color="white"
                                    />
                                  ) : null
                                }
                                disabled={loading}
                                variant="contained"
                                size="small"
                                color="primary"
                              >
                                Guardar Cambios
                              </Button>
                            </Grid>
                          )}
                    </SubtitleForm>
                    <Grid item xs={12} sm={12} md={10}>
                      <Box
                        p={2}
                        display="flex"
                        alignItems="normal"
                        flexDirection="row"
                        justifyContent="space-between"
                        mr={2}
                      >
                        <Box>
                          <Typography component="span" variant="subtitle1">
                            Lechones nacidos vivos:
                          </Typography>{' '}
                          <b>{lechonesList.length || 0}</b>
                          <br/>
                          <Typography component="span" variant="subtitle1">
                            Lechones muertos en lactancia:
                          </Typography>{' '}
                          <b>{item?.lechonesMuertosLactancia || 0}</b>
                        </Box>
                        <Divider orientation="vertical" sx={{background:"#00000082"}}flexItem />
                        <Box>
                          <Typography component="span" variant="subtitle1">
                            Promedio peso nacimiento:
                          </Typography>{' '}
                          <b>{item && getPesoPromNacimiento()}</b>
                          <br/>
                          <Typography component="span" variant="subtitle1">
                            Promedio peso destete:
                          </Typography>{' '}
                          <b>{item?.pesoPromedioCamada || 0}</b>
                        </Box>
                      </Box>
                      <Divider />
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Código Lechón</TableCell>
                              <TableCell align="center">
                                Peso Nacimiento (kg)
                              </TableCell>
                              <TableCell align="center">
                                Peso destete (kg)
                              </TableCell>
                              <TableCell align="center">
                                Estado de Vida
                              </TableCell>
                              <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lechonesList?.length !== 0 &&
                              lechonesList.map((element, idx) => {
                                return (
                                  <TableRow hover key={idx}>
                                    <TableCell align="center">
                                      {element?.codigo ?? '0'}
                                    </TableCell>
                                    <TableCell align="center">
                                      {element?.pesoNacimiento ?? '0'}
                                    </TableCell>
                                    <TableCell align="center">
                                      {editPesos && element.estado !== lechonEstado.muerto &&
                                      <TextField
                                      id={`peso-lechon-${idx}`}
                                      label=""
                                      variant='standard'
                                      value={pesosList[idx].pesoDestete}
                                      type='number'
                                      inputProps={{ min: '0' }}
                                      onChange={(e) => cambiarValor(e.target.value, idx)}
                                    />

                                    }
                                      {!editPesos 
                                      && (element?.pesoDestete ?? '-')}
                                      {/* {element.estado === lechonEstado.muerto && '-'} */}
                                    </TableCell>
                                    <TableCell align="center">
                                      {element.estado === lechonEstado.muerto
                                        ? 'Muerto'
                                        : 'Vivo'}
                                    </TableCell>
                                    <TableCell align="center">
                                      {!(element.estado === 'Muerto') && 
                                          <Tooltip title="Descartar lechón">
                                            <IconButton
                                              sx={{ borderRadius: 30 }}
                                              onClick={() => {
                                                openDescartarModal(element);
                                              }}
                                            >
                                              <HighlightOffRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                        }
                                            {(showAction && !(element.estado === 'Muerto')) && (
                                          <Tooltip title="Remover lechón">
                                            <IconButton
                                              color="error"
                                              sx={{ borderRadius: 30 }}
                                              onClick={() => {
                                                openDeleteModal(element);
                                              }}
                                            >
                                              <DeleteRoundedIcon />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {lechonesList?.length === 0 && (
                        <Box p={2}>
                          <Typography
                            sx={{
                              py: 2
                            }}
                            variant="h4"
                            fontWeight="normal"
                            color="text.secondary"
                            align="center"
                          >
                            Sin lechones registrados. <br/> Agregue un lechón para iniciar con la lactancia de la cerda.
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                )}
              </Tab>
              <Tab eventKey={2} title="Destete">
                <form noValidate>
                  <Grid container
                          justifyContent="normal"
                          spacing={3}
                          mb={3}
                          mt={3}>
                    <SubtitleForm subtitle="Fecha de Destete"/>
                    <Grid container item xs={12} sm={12} md={12} spacing={3}>
                      <Grid item xs={12} sm={12} md={4}>
                        <DatePickerReadOnly
                              value={
                                item?.fechaIniDestete || null
                              }
                              label="Fecha inicial recomendada"
                              inputName="fechaIniDestete"
                            />
                      </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                        <DatePickerReadOnly
                              value={
                                item?.fechaFinDestete || null
                              }
                              label="Fecha final recomendada"
                              inputName="fechaFinDestete"
                            />
                      </Grid>
                      <Grid container item xs={12} sm={12} md={12} spacing={3}>
                      <Grid item xs={12} sm={12} md={4}>
                         <DatePickerReadOnly
                              value={
                                item?.fechaDestete || null
                              }
                              label="Fecha real"
                              inputName="fechaDestete"
                            />
                      </Grid>
                        </Grid>
                    </Grid>
                  </Grid>
                </form>
              </Tab>
            </Tabs>
          </>
        )}
      </DialogContent>
      {compraModal && (
        <AddCompraModal
          open={compraModal}
          modalClose={closeCompraModal}
          handleAction={agregarCompra}
          maternidadId={item.id}
        />
      )}
      {openDelete && (
        <DeleteCompraModal
          openConfirmDelete={openDelete}
          closeConfirmDelete={closeDeleteModal}
          title="Eliminar Lechón"
          itemName={`eliminar el lechón ${
            currentItem?.codigo || ''
          }. Este lechón se eliminará permantentemente, al confirmar.`}
          handleDeleteCompleted={deleteItem}
        />
      )}
      {openDescartar && (
        <DeleteCompraModal
          openConfirmDelete={openDescartar}
          closeConfirmDelete={closeDescartarModal}
          title="Descartar Lechón"
          itemName={` descartar el lechón ${
            currentItem?.codigo || ''
          }. Este lechón pasará a Muerto, al confirmar`}
          handleDeleteCompleted={descartarItem}
        />
      )}
      {terminarMatModal && (
        <TerminarMaternidadModal
          open={terminarMatModal}
          modalClose={closeTerminarModal}
          maternidadId={item.id}
          handleAction={terminarMaternidad}
        />
      )}
    </>
  );
}

export default EditMaternidad;
