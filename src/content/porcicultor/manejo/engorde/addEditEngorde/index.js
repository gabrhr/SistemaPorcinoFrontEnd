import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
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
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import DataView from 'src/components/Form/DataView';
import DatePickerReadOnly from 'src/components/Form/DatePickerReadOnly';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { ceboTerminarAPI, engordeFindByIdAPI, engordeRegisterAPI, engordeUpdateAPI, pesosRegisterAPI, preceboTerminarAPI } from 'src/utils/apiUrls';
import { engordeEstado, resultCodeOk } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';
import AddCamadaModal from './AddCamadaModal';
import TerminarEtapaModal from './TerminarEtapaModal';

function AddEditLote() {
  const [item, setItem] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
  const [editActive, setEditActive] = useState(false);
  const [showAction, setShowAction] = useState(true)
  const [showEditCamada, setShowEditCamada] = useState(true)
  const [cerdaModal, setCerdaModal] = useState(false);
  const [preceboModal, setPreceboModal] = useState(false);
  const [ceboModal, setCeboModal] = useState(false);
  const [removeList, setRemoveList] = useState([]);
  const [cerdasLote, setCerdasLote] = useState([]);  
  const [loading, setLoading] = useState(false);
  const [editPesos, setEditPesos] = useState(false);
  const [editPesosCebo, setEditPesosCebo] = useState(false);
  const [pesosList, setPesosList] = useState([]);  
  const [pesosListCebo, setPesosListCebo] = useState([]);  


  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();
  const formLote = useRef();

  const preceboTemp = {
    camadaId: 0,
    pesoTotalPrecebo: 0
  }

  const ceboTemp = {
    lechonId: 0,
    pesoTotalCebo: 0
  }


  // get cerda by id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(engordeFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setCerdasLote(response.data.camadas)
            getPesosList(response.data.camadas)
            if(response?.data?.estado && response?.data?.estado === engordeEstado.finalizado){
              setShowAction(false);
            } 
            if(response?.data?.estado && response?.data?.estado !== engordeEstado.precebo){
              setShowEditCamada(false);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setItem({});
        setCerdasLote([])
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
    if (location.state.engordeId !== -1) {
      // id de navigate
      setEditMode(true);
      const request = {
        id: location.state.engordeId,
        granjaId: user.granjaId
      };
      getItemById(request);
    } else {
      setEditActive(true)
      setItem({});
    }
  }, [getItemById]);

  // process cerdas
  const processCerdasToSave = () => {
    if(cerdasLote.length>0){
      return cerdasLote.map(e => e.id)
    }

    return []
  };

  const resetStates = (edit = false) => {
     setRemoveList([])
     if(edit){
       setEditActive(false)
     }
     setLoading(false)
  };
  
  

  // add
  const addItem = async (reqObj) => {
    const cerdasToSave = processCerdasToSave()
    reqObj.camadaIds = cerdasToSave
    try {
      const response = await certifyAxios.post(engordeRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
      }
      navigateToMain()
      resetStates()
    } catch (error) {
      resetStates()
      showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
    }
  };

  // edit
  const editItemById = async (reqObj, resetForm) => {
    const cerdasToSave = processCerdasToSave()
    reqObj.camadaIds = cerdasToSave
   try {
      const response = await certifyAxios.post(engordeUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({id: reqObj.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
        resetStates(true)

      }
    } catch (error) {
      resetStates(true)
      resetForm()
      console.error(error);
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
  };

  // return
  const navigateToMain = () => {
    navigate(-1);
  };

  // open modal cerda
  const openCerdaModal = () => {
      setCerdaModal(true)      
  }

  // close modal cerda
  const closeCerdaModal = () => {
    setCerdaModal(false)      
  }

  // agregar cerdas seleccionadas del modal
  const addCerdaToList = (cerdasToAdd=[]) => {
    let temp = [...cerdasLote]
    setCerdasLote(temp.concat(cerdasToAdd))
    closeCerdaModal()
  };

  // eliminar cerda 
  const removeCerda = (item) => {
    const updatedList = cerdasLote.filter(
      (cerda) => cerda.id !== item.id
    );
    setRemoveList([...removeList].concat(item))
    setCerdasLote(updatedList)
  };
  
  
  // validar todo 
  const validateForm = () => {
    if(loading) return true
    if(formLote && formLote.current && !formLote?.current?.isValid)
  {
    return true
  }
  
  if(editMode && cerdasLote.length>0 && JSON.stringify(cerdasLote) !== JSON.stringify(item.camadas)){
    return false
  }
  
     return false
  };
  
    // close modal precebo fin
  const closeCeboModal = () => {
    setCeboModal(false)      
  }

  const closePreceboModal = () => {
    setPreceboModal(false)      
  }
  
  // edit
  const terminarEtapas = async (reqObj, resetForm, precebo) => {
   const url = precebo? preceboTerminarAPI: ceboTerminarAPI
   try {
      const response = await certifyAxios.post(url, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({id: reqObj.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
        if(precebo){
          closePreceboModal()
        } else {
          closeCeboModal()
        }

      }
    } catch (error) {
      resetForm()
      console.error(error);
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
  };

  // modificar pesos
  const getPesosList = (list = []) => {
    let pesos = []
    let pesosCebo = []
    list.forEach(e => {
      const temp = {...preceboTemp}
      const temp2 = {...ceboTemp}
      temp.camadaId = e.id
      if(e.pesoTotalPrecebo !== null){
        temp.pesoTotalPrecebo = e.pesoTotalPrecebo
      }
      pesos = pesos.concat(temp)

      temp2.camadaId = e.id
      if(e.pesoTotalCebo !== null){
        temp2.pesoTotalCebo = e.pesoTotalCebo
      }
      pesosCebo = pesosCebo.concat(temp2)
    })

    setPesosList(pesos)
    setPesosListCebo(pesosCebo)
  };

  const registerPesos = async (precebo = false) => {
    // llamada
    const reqObj = {
      id: item?.id,
      pesoCamada: precebo? pesosList: pesosListCebo,
      precebo: precebo? 1: 0
    }
    try {
      const response = await certifyAxios.post(pesosRegisterAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        await getItemById({id: item.id, granjaId: user.granjaId})
        setEditPesos(false)
        successMessage(response.data.userMsg?? "Se ha registrado satisfactoriamente")
      }
    } catch (error) {
      setEditPesos(false)
      console.error(error)
      showUserErrors(error, "No se ha podido terminar. Inténtelo de nuevo")
    } 
  };

  const cambiarValor = (valor, idx, precebo = false) => {
    if(precebo){
      let pesosTemp = [...pesosList]
      pesosTemp[idx].pesoTotalPrecebo = valor
      setPesosList(pesosTemp)
      console.log("B", pesosTemp)
    } else {
      let pesosTemp = [...pesosListCebo]
      pesosTemp[idx].pesoTotalCebo = valor
      setPesosListCebo(pesosTemp)
    }
  };
  

  return (
    <>
      <Helmet>
        <title>Detalle Engorde</title>
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
                      {!editMode ? 'Agregar engorde' : 'Detalle engorde'}
                    </Typography>
                  </Grid>
                  { showAction && (!editMode || (editMode && editActive)) && (
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
                          if (!editMode) {
                            navigateToMain();
                          } else if (editMode && editActive) {
                            setEditActive(false);
                            if(formLote.current){
                              formLote.current.resetForm();
                            }
                            setCerdasLote(item.camadas || [])
                            setRemoveList([])
                          }
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
                  {showAction && (editMode && !editActive) && (
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
        {item !== undefined && 
        <>
                  {showAction && (editMode && item?.estado === engordeEstado.precebo) && (
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
                          setPreceboModal(true)
                        }}
                      >
                        Terminar Precebo
                      </Button>
                    </Grid>
                  )}
                  {showAction && (editMode && item?.estado === engordeEstado.cebo) && (
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
                          setCeboModal(true)
                        }}
                      >
                        Terminar Cebo
                      </Button>
                    </Grid>
                  )}
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title="General">
              <Formik
         innerRef={formLote}
          initialValues={{
            codigo: (editMode && item && item.codigo) || '',
            numCorral: (editMode && item && item.numCorral) || -1,
          }}
          validationSchema={Yup.object().shape({
            codigo: Yup.string().required('El codigo es requerido'),
          })}
          onSubmit={async (values, {resetForm}) => {
            setLoading(true)
            const request = {
              codigo: values.codigo,
              numCorral: values.numCorral,
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
            handleSubmit
          }) => (
            <form noValidate onSubmit={handleSubmit}>
              
              {/* Form and table */}
                
                <Grid container justifyContent="center" spacing={3} mt={2}>
                  {/* Form */}
                  <SubtitleForm subtitle='Datos generales'/>
                  <Grid container item xs={12} sm={12} md={12} spacing={4} mb={2}>
                    {/* Codigo */}
                    <Grid item xs={12} sm={12} md={6}>
                      <InputForm
                        inputName="codigo"
                        value={values.codigo}
                        label="Código de Lote"
                        placeholder="Ejemplo: LOT001"
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        handleBlur={handleBlur}
                        disabled={!editActive}
                      />
                    </Grid>
                   {/* Numero */}
                   <Grid item xs={12} sm={12} md={6}>
                      <SelectForm
                      key="numCorral"
                      label="Número Corral"
                      name="numCorral"
                      value={values.numCorral}
                      onChange={handleChange}
                      errors={errors}
                      touched={touched}
                      number
                      >
                        {[1,2,3,5].map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </SelectForm>
                    </Grid>
                    
                  </Grid>
                  {editMode && 
                  <Grid container item xs={12} sm={12} md={12} spacing={4} mb={2}>
                    {/* Fecha */}
                    <Grid item xs={12} sm={12} md={6}>
                      <DatePickerReadOnly
                        value={item?.fechaApertura || null}
                        label="Fecha Apertura"
                        inputName="fechaApertura"
                      />
                    </Grid>
                   {/* Numero */}
                   <Grid item xs={12} sm={12} md={6}>
                   <DataView label="Estado:"
                   status
                   text={item && item?.estado || ""}
                   lote
                   inline
                   />
                            
                    </Grid>
                    
                  </Grid>}
                </Grid>
            </form>
          )}
        </Formik>

        {/* List */}
        <Grid container justifyContent="center" spacing={3}>
          <SubtitleForm subtitle='Listado de camadas' list>
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
                          {editMode && ( !editPesos && !editPesosCebo) && <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            sx={{marginRight:1}}
                            disabled={item && item?.fechaFinCebo === null}
                            onClick={() => {setEditPesosCebo(true)}}
                          >
                            Modificar Pesos de Cebo
                          </Button>}

                          {editMode && (!editPesos && !editPesosCebo) && <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            disabled={item && item?.fechaFinPrecebo === null}
                            onClick={() => {setEditPesos(true)}}
                          >
                            Modificar Pesos de Precebo
                          </Button>}
                            </Grid>
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
                                getPesosList(item?.camadas)
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => registerPesos(true)}
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
                        {editPesosCebo && (
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
                                setEditPesosCebo(false);
                                getPesosList(item?.camadas)
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
                    {showEditCamada && editActive && <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={openCerdaModal}
                      >
                        Agregar camadas
                      </Button>}
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
                          Total de camadas:
                        </Typography>{' '}
                        <b>{cerdasLote.length || 0}</b> 
                      </Box>
                      <Box>
                        <Typography component="span" variant="subtitle1">
                          Total de lechones:
                        </Typography>{' '}
                        <b>{item?.totalLechones || 0}</b> 
                      </Box>
                    </Box>
                    <Divider />
                    <TableContainer>
                      <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Código Camada</TableCell>
                          <TableCell align='center'>Nro. Lechones</TableCell>
                          <TableCell align='center'>Peso Prom. Destete (kg)</TableCell>
                          <TableCell align='center'>Peso Total de Precebo (kg) </TableCell>
                          <TableCell align='center'>Peso Total de Cebo (kg) </TableCell>
                          {editActive && <TableCell align='center'>Acciones</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                          {cerdasLote.length !== 0 &&
                            cerdasLote.map((element, idx) => {
                              return (
                                <TableRow hover key={idx}>
                                  <TableCell>{element?.codigo ?? ''}</TableCell>
                                  <TableCell align="center">
                                    {element?.totalLechones ?? '0'}
                                  </TableCell>
                                  <TableCell align="center">
                                    {element?.pesoPromDestete ?? '0'}
                                  </TableCell>
                                  <TableCell align="center">
                                    {editPesos &&
                                      <TextField
                                      id="outlined-controlled-1"
                                      label=""
                                      variant='standard'
                                      value={pesosList[idx].pesoTotalPrecebo}
                                      type='number'
                                      inputProps={{ min: '0' }}
                                      onChange={(e) => cambiarValor(e.target.value, idx, true)}
                                    />

                                    }
                                      {!editPesos && (element?.pesoTotalPrecebo ?? '-')}
                                  </TableCell>
                                  <TableCell align="center">
                                    {editPesosCebo &&
                                      <TextField
                                      id="outlined-controlled-2"
                                      label=""
                                      variant='standard'
                                      value={pesosListCebo[idx].pesoTotalPrecebo}
                                      type='number'
                                      inputProps={{ min: '0' }}
                                      onChange={(e) => cambiarValor(e.target.value, idx)}
                                    />

                                    }
                                      {!editPesosCebo && (element?.pesoTotalPrecebo ?? '-')}
                                  </TableCell>
                                  {showEditCamada && editActive && (
                                    <TableCell align="center">
                                      <Tooltip title="Remover camada">
                                        <IconButton
                                          color="error"
                                          sx={{ borderRadius: 30 }}
                                          onClick={() => {
                                            removeCerda(element);
                                          }}
                                        >
                                          <DeleteRoundedIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            })
                          }
                      </TableBody>
                      </Table>
                    </TableContainer>
                    {cerdasLote?.length === 0 && (
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
                            Sin camadas registradas.
                          </Typography>
                        </Box>
                      )}
                  </Grid>
                 </Grid>
              </Tab>
              <Tab eventKey={2} title="Etapas de Engorde">
                <form noValidate>
                  <Grid container
                          justifyContent="normal"
                          spacing={3}
                          mb={3}
                          mt={3}>
                    <SubtitleForm subtitle="Precebo"/>
                    <Grid container item xs={12} sm={12} md={12} spacing={3}>
                    <Grid item xs={12} sm={12} md={4}>
                      <DatePickerReadOnly
                        value={item?.fechaPreceboProbable || null}
                        label="Fecha Recomendada"
                        inputName="fechaPreceboProbable"
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <DatePickerReadOnly
                        value={item?.fechaFinPrecebo || null}
                        label="Fecha Real"
                        inputName="fechaFinPrecebo"
                      />
                    </Grid>
                      </Grid>
                    <SubtitleForm subtitle="Cebo"/>
                    <Grid container item xs={12} sm={12} md={12} spacing={3}>
                      <Grid item xs={12} sm={12} md={4}>
                      <DatePickerReadOnly
                        value={item?.fechaCeboProbable || null}
                        label="Fecha Recomendada"
                        inputName="fechaCeboProbable"
                      />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                      <DatePickerReadOnly
                        value={item?.fechaFinCebo || null}
                        label="Fecha Real"
                        inputName="fechaFinCebo"
                      />
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
              </Tab>
              </Tabs>
        </>
        }
        </DialogContent>
      {cerdaModal && <AddCamadaModal
      open ={cerdaModal}
      modalClose={closeCerdaModal}
      handleAction={addCerdaToList}
      granjaId ={user.granjaId}
      cerdasList={cerdasLote|| []}
      removeList={removeList || []}
      />}
      {preceboModal && <TerminarEtapaModal
      open ={preceboModal}
      modalClose={closePreceboModal}
      handleAction={terminarEtapas}
      engordeId ={item?.id}
      precebo
      />}
      {ceboModal && <TerminarEtapaModal
      open ={ceboModal}
      modalClose={closeCeboModal}
      handleAction={terminarEtapas}
      engordeId ={item?.id}
      />}
    </>
  );
}

export default AddEditLote;
