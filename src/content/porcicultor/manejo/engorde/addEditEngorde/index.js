import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
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
import BackdropLoading from 'src/components/BackdropLoading';
import CircularLoading from 'src/components/CircularLoading';
import DataView from 'src/components/Form/DataView';
import DatePickerReadOnly from 'src/components/Form/DatePickerReadOnly';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { ceboTerminarAPI, corralQueryAllAPI, engordeFindByIdAPI, engordeRegisterAPI, engordeUpdateAPI, pesosRegisterAPI, preceboTerminarAPI } from 'src/utils/apiUrls';
import { engordeEstado, resultCodeOk } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';
import AddCamadaModal from './AddCamadaModal';
import LechonesCamadaModal from './LechonesCamadaModal';
import TerminarEtapaModal from './TerminarEtapaModal';

function AddEditEngorde() {
  const [item, setItem] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
  const [editActive, setEditActive] = useState(false);
  const [showAction, setShowAction] = useState(true)
  const [showEditCamada, setShowEditCamada] = useState(true)
  const [cerdaModal, setCerdaModal] = useState(false);
  const [preceboModal, setPreceboModal] = useState(false);
  const [ceboModal, setCeboModal] = useState(false);
  const [lechonModal, setLechonModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [removeList, setRemoveList] = useState([]);
  const [cerdasLote, setCerdasLote] = useState([]);  
  const [loading, setLoading] = useState(false);
  const [editPesos, setEditPesos] = useState(false);
  const [editPesosCebo, setEditPesosCebo] = useState(false);
  const [pesosList, setPesosList] = useState([]);  
  const [pesosListCebo, setPesosListCebo] = useState([]);  
  const [corrales, setCorrales] = useState(undefined);


  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();
  const formLote = useRef();

  const preceboTemp = {
    camadaId: 0,
    peso: 0
  }

  const ceboTemp = {
    lechonId: 0,
    peso: 0
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
            const corralActual = {id: response?.data?.corralId || 0, numCorral: response?.data?.numCorral || 0}
            if(response?.data?.estado && response?.data?.estado === engordeEstado.finalizado){
              setShowAction(false);
              setCorrales([{...corralActual}])
            } else {
              const listCorrales = await getCorralesList()
              if(listCorrales.engorde && listCorrales.engorde.length > 0){
                setCorrales([...listCorrales.engorde])
              } else {
                setCorrales([])
              }

              setShowAction(true)
            }

            if(response?.data?.estado && response?.data?.estado !== engordeEstado.precebo){
              setShowEditCamada(false);
            } else{
              setShowEditCamada(true);
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

  const getCorralesList = async () => {
    const reqObj = {
      fase: 1,
      granjaId: user.granjaId
    };
    try {
      const response = await certifyAxios.post(corralQueryAllAPI, reqObj);
      if (response.status === 200 && response.data) {
        setCorrales(response?.data?.engorde??[])
        return response.data
      }
    } catch (err) {
      console.error(err);
      errorMessage("No se ha podido obtener el listado de corrales")
      setCorrales([])
      return []
    }
    return []
  };

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
      getCorralesList()
    }
  }, [getItemById]);

  // process cerdas
  const processCerdasToSave = (list = []) => {
    if(list.length > 0){
      return list.map(e => e.id)
    }

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
    const isValidCamada = cerdasLote.length > 0;
    const camadasText = "Debe agregar al menos 1 camada."
    if(!isValidCamada){
      resetStates()
      errorMessage(camadasText)
      return 
    }
    const cerdasToSave = processCerdasToSave()
    reqObj.camadaIds = cerdasToSave
    try {
      setLoading(true)
      const response = await certifyAxios.post(engordeRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
        navigateToMain()
        resetStates()
      }
    } catch (error) {
      resetStates()
      showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
    }
  };

  // edit
  const editItemById = async (reqObj, list = [], resetForm = () =>{}) => {
    const cerdasToSave = processCerdasToSave(list)
    reqObj.camadaIds = cerdasToSave
   try {
      setLoading(true)
      const response = await certifyAxios.post(engordeUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        await getItemById({id: reqObj.id, granjaId: user.granjaId})
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
  const addCerdaToList = async (cerdasToAdd=[]) => {
    let temp = [...cerdasLote]
    if(editMode){
      const request = {
        id: item.id,
        granjaId: user.granjaId,
        onlyInfo: false,
        onlyCamadas: true
      }
      editItemById(request, temp.concat(cerdasToAdd));
    } else {
      setCerdasLote(temp.concat(cerdasToAdd))
    }
    closeCerdaModal()
  };

  // eliminar cerda 
  const removeCerda = (element) => {
    const updatedList = cerdasLote.filter(
      (cerda) => cerda.id !== element.id
    );
    
    if(editMode){
      const request = {
        id: item.id,
        granjaId: user.granjaId,
        onlyInfo: false,
        onlyCamadas: true
      }
      editItemById(request, updatedList);
    } else {
      setCerdasLote(updatedList)
      setRemoveList([...removeList].concat(element))
    }
  };

  const closeLechonModal = () => {
    setLechonModal(false)      
    setCurrentItem(null)
  }
  
    // close modal precebo fin
  const closeCeboModal = () => {
    setCeboModal(false)      
  }

  const closePreceboModal = () => {
    setPreceboModal(false)      
  }
  
  // edit
  const terminarEtapas = async (reqObj, precebo) => {
   const url = precebo? preceboTerminarAPI: ceboTerminarAPI
   try {
      setLoading(true)
      if(precebo){
        closePreceboModal()
      } else {
        closeCeboModal()
      }
      const response = await certifyAxios.post(url, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        await getItemById({id: reqObj.id, granjaId: user.granjaId})
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
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
        temp.peso = e.pesoTotalPrecebo
      }
      pesos = pesos.concat(temp)

      temp2.camadaId = e.id
      if(e.pesoTotalCebo !== null){
        temp2.peso = e.pesoTotalCebo
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
      precebo
    }
    try {
      setLoading(true)
      const response = await certifyAxios.post(pesosRegisterAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        await getItemById({id: item.id, granjaId: user.granjaId})
        if(precebo){
          setEditPesos(false)
        } else {
          setEditPesosCebo(false)
        }
        successMessage(response.data.userMsg?? "Se ha registrado satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      if(precebo){
        setEditPesos(false)
      } else {
        setEditPesosCebo(false)
      }
      setLoading(false)
      console.error(error)
      showUserErrors(error, "No se ha podido terminar. Inténtelo de nuevo")
    } 
  };

  const cambiarValor = (valor, idx, precebo = false) => {
    if(precebo){
      let pesosTemp = [...pesosList]
      pesosTemp[idx].peso = valor
      setPesosList(pesosTemp)
    } else {
      let pesosTemp = [...pesosListCebo]
      pesosTemp[idx].peso = valor
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
          <Grid item xs={2} md={0.5} sm={1}>
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
          {/* Solo para el agregar */}
          {(!editMode && editActive) && (
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
                    if (formLote.current) {
                      formLote.current.resetForm();
                    }
                    setCerdasLote(item.camadas || []);
                    setRemoveList([]);
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (formLote?.current) {
                    formLote.current.handleSubmit();
                  }
                }}
                startIcon={
                  loading ? (
                    <CircularProgress size="1rem" color="white" />
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
            {showAction && editMode && item?.estado === engordeEstado.precebo && (
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
                    setPreceboModal(true);
                  }}
                >
                  Terminar Precebo
                </Button>
              </Grid>
            )}
            {showAction && editMode && item?.estado === engordeEstado.cebo && (
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
                    setCeboModal(true);
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
                    numCorral: (editMode && item && item.corralId) || -1
                  }}
                  validationSchema={Yup.object().shape({
                    codigo: Yup.string().required('El codigo es requerido')
                  })}
                  onSubmit={async (values, { resetForm}) => {
                    setLoading(true);
                    const request = {
                      codigo: values.codigo,
                      numCorral: values.numCorral,
                      granjaId: user.granjaId
                    };
                    if (editMode && editActive) {
                      request.id = item.id;
                      request.onlyInfo = true
                      request.onlyCamadas = false
                      editItemById(request, [], resetForm);
                    } else {
                      request.onlyInfo = true
                      request.onlyCamadas = true
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
                      <Grid
                        container
                        justifyContent="center"
                        spacing={3}
                        mt={0}
                      >
                        {/* Form */}
                        <SubtitleForm subtitle="Datos generales" list>
                          {(showAction && editMode && !editActive) && (
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
                          {(showAction && editMode && editActive) && <Grid
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
                                if (editMode && editActive) {
                                  setEditActive(false);
                                  resetForm();
                                  setCerdasLote(item.camadas || []);
                                  setRemoveList([]);
                                }
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              startIcon={
                                loading ? (
                                  <CircularProgress size="1rem" color="white" />
                                ) : null
                              }
                              disabled={!isValid || !dirty || isSubmitting}
                              variant="contained"
                              size="small"
                              color="primary"
                            >
                              Guardar
                            </Button>
                          </Grid>}
                        </SubtitleForm>
                        <Grid
                          container
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          spacing={4}
                          mb={2}
                        >
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
                              disabled={!editActive || corrales === undefined}
                              touched={touched}
                              helper={editActive && corrales !== undefined && corrales.length === 0}
                              helperText='No se han encontrado corrales de engorde'
                              number
                            >
                              {corrales && corrales.length>0 &&
                              corrales.map((type, index) => (
                                <MenuItem key={index} value={type.id}>
                                  {type.numCorral}
                                </MenuItem>
                              ))}
                            </SelectForm>
                          </Grid>
                        </Grid>
                        {editMode && (
                          <Grid
                            container
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            spacing={4}
                            mb={2}
                          >
                            {/* Fecha */}
                            <Grid item xs={12} sm={12} md={6}>
                              <DatePickerReadOnly
                                value={item?.fechaPromNacimiento || null}
                                label="Fecha Nacimiento Promedio"
                                inputName="fechaPromNacimiento"
                              />
                            </Grid>
                            {/* Numero */}
                            <Grid item xs={12} sm={12} md={6}>
                              <DataView
                                label="Estado:"
                                status
                                text={(item && item?.estado) || ''}
                                lote
                                inline
                              />
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </form>
                  )}
                </Formik>

                {/* List */}
                <Grid container justifyContent="center" spacing={3}>
                  <SubtitleForm subtitle="Listado de camadas" list>
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
                      {((item?.estado && item.estado === engordeEstado.cebo) || 
                        (item?.estadoFinal && item.estadoFinal === engordeEstado.cebo)) &&
                        (editMode && !editPesos && !editPesosCebo) && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          sx={{ marginRight: 1 }}
                          disabled={item && item?.fechaFinCebo === null}
                          onClick={() => {
                            setEditPesosCebo(true);
                          }}
                        >
                          Modificar Pesos de Cebo
                        </Button>
                      )}

                      {editMode && !editPesos && !editPesosCebo && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          sx={{ marginRight: 1 }}
                          disabled={item && item?.fechaFinPrecebo === null}
                          onClick={() => {
                            setEditPesos(true);
                          }}
                        >
                          Modificar Pesos de Precebo
                        </Button>
                      )}
                      {showEditCamada && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={openCerdaModal}
                        >
                          Agregar camadas
                        </Button>
                      )}
                      {editPesos && 
                        <Button
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{
                            mr: 2
                          }}
                          onClick={() => {
                            setEditPesos(false);
                            getPesosList(item?.camadas);
                          }}
                        >
                          Cancelar
                        </Button>
                      }
                      {editPesos && 
                        <Button
                          onClick={() => registerPesos(true)}
                          startIcon={
                            loading ? (
                              <CircularProgress size="1rem" color="white" />
                            ) : null
                          }
                          disabled={loading}
                          variant="contained"
                          size="small"
                          color="primary"
                        >
                          Guardar Cambios
                        </Button>
                      }
                      {editPesosCebo && 
                        <Button
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{
                            mr: 2
                          }}
                          onClick={() => {
                            setEditPesosCebo(false);
                            getPesosList(item?.camadas);
                          }}
                        >
                          Cancelar
                        </Button>
                      }
                      {editPesosCebo && 
                        <Button
                          onClick={() => registerPesos()}
                          startIcon={
                            loading ? (
                              <CircularProgress size="1rem" color="white" />
                            ) : null
                          }
                          disabled={loading}
                          variant="contained"
                          size="small"
                          color="primary"
                        >
                          Guardar Cambios
                        </Button>
                      }
                    </Grid>
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
                            <TableCell align="center">Nro. Lechones</TableCell>
                            <TableCell align="center">
                              Peso Prom. Destete (kg)
                            </TableCell>
                            <TableCell align="center">
                              Peso Total de Precebo (kg){' '}
                            </TableCell>
                            {((item?.estado && item.estado === engordeEstado.cebo) || 
                            (item?.estadoFinal && item.estadoFinal === engordeEstado.cebo)) &&
                            <TableCell align="center">
                              Peso Total de Cebo (kg){' '}
                            </TableCell>}
                            <TableCell align="center">Acciones</TableCell>
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
                                    {editPesos && (
                                      <TextField
                                        id="outlined-controlled-1"
                                        label=""
                                        variant="standard"
                                        value={pesosList[idx].peso}
                                        type="number"
                                        inputProps={{ min: '0' }}
                                        onChange={(e) =>
                                          cambiarValor(
                                            e.target.value,
                                            idx,
                                            true
                                          )
                                        }
                                      />
                                    )}
                                    {!editPesos &&
                                      (element?.pesoTotalPrecebo ?? '-')}
                                  </TableCell>
                                  {((item?.estado && item.estado === engordeEstado.cebo) || 
                                    (item?.estadoFinal && item.estadoFinal === engordeEstado.cebo)) &&
                                    <TableCell align="center">
                                    {editPesosCebo && (
                                      <TextField
                                        id="outlined-controlled-2"
                                        label=""
                                        variant="standard"
                                        value={
                                          pesosListCebo[idx].peso
                                        }
                                        type="number"
                                        inputProps={{ min: '0' }}
                                        onChange={(e) =>
                                          cambiarValor(e.target.value, idx)
                                        }
                                      />
                                    )}
                                    {!editPesosCebo &&
                                      (element?.pesoTotalCebo ?? '-')}
                                  </TableCell>}
                                    <TableCell align="center">
                                    <Tooltip title="Lechones">
                                      <span>
                                      <IconButton
                                        color="info"
                                        sx={{ borderRadius: 30 }}
                                        onClick={() => {
                                          setLechonModal(true);
                                          setCurrentItem(element)
                                        }}
                                        disabled={cerdasLote.length === 1}
                                      >
                                        <ListAltRoundedIcon />
                                      </IconButton>
                                      </span>
                                    </Tooltip>
                                    {showEditCamada && (
                                      <Tooltip title="Remover camada">
                                        <span>
                                        <IconButton
                                          color="error"
                                          sx={{ borderRadius: 30 }}
                                          onClick={() => {
                                            removeCerda(element);
                                          }}
                                          disabled={cerdasLote.length === 1}
                                        >
                                          <DeleteRoundedIcon />
                                        </IconButton>
                                        </span>
                                      </Tooltip>
                                    )}
                                    </TableCell>
                                </TableRow>
                              );
                            })}
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
                  <Grid
                    container
                    justifyContent="normal"
                    spacing={2}
                    mb={3}
                    mt={3}
                  >
                    <SubtitleForm subtitle="Precebo" 
                    description='Los lechones son alimentados para desarrollarse y alcanzar un peso entre los 22 y 25 kilogramos.'
                    d2={`Recomendación: Fin de precebo a ${item.diasFinPrecebo || 0} días de nacido.`}
                    />
                    <Grid container item xs={12} sm={12} md={12} spacing={3}>
                      <Grid item xs={12} sm={12} md={4}>
                        <DatePickerReadOnly
                          value={item?.fechaPreceboProbable || null}
                          label="Fecha Fin Recomendada"
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
                    <SubtitleForm subtitle="Cebo" 
                    description='Los cerdos son alimentados para alcanzar un peso óptimo antes del sacrificio, entre los 90 y 100 kg según el mercado.'
                    d2={`Recomendación: Fin de cebo a ${item.diasFinCebo || 0} días de nacido.`}
                    />
                    <Grid container item xs={12} sm={12} md={12} spacing={3}>
                      <Grid item xs={12} sm={12} md={4}>
                        <DatePickerReadOnly
                          value={item?.fechaCeboProbable || null}
                          label="Fecha Fin Recomendada"
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
        )}
      </DialogContent>
      {cerdaModal && (
        <AddCamadaModal
          open={cerdaModal}
          modalClose={closeCerdaModal}
          handleAction={addCerdaToList}
          granjaId={user.granjaId}
          cerdasList={cerdasLote || []}
          removeList={removeList || []}
        />
      )}
      {lechonModal && (
        <LechonesCamadaModal
          open={lechonModal}
          modalClose={closeLechonModal}
          camada={currentItem}
        />
      )}
      {preceboModal && (
        <TerminarEtapaModal
          open={preceboModal}
          modalClose={closePreceboModal}
          handleAction={terminarEtapas}
          engordeId={item?.id}
          precebo
        />
      )}
      {ceboModal && (
        <TerminarEtapaModal
          open={ceboModal}
          modalClose={closeCeboModal}
          handleAction={terminarEtapas}
          engordeId={item?.id}
        />
      )}
    </>
  );
}

export default AddEditEngorde;
