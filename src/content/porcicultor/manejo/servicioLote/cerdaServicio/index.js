import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  cerdaServicioFindByIdAPI,
  servicioFalloRegisterAPI,
  servicioLoteGestacionAPI,
  servicioLoteInseminacionAPI,
  servicioLoteVerificacionesAPI,
  servicioTerminarGestacionAPI,
  verracoQueryAllAPI
} from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { DatePicker } from '@mui/lab';
import {
  Alert,
  Breadcrumbs,
  Button,
  CircularProgress,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { Tab, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import DataView from 'src/components/Form/DataView';
import DatePickerForm from 'src/components/Form/DatePickerForm';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import ServicioStatusDetalle from 'src/components/ServicioStatusDetalle';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';
import {
  lisTiposInseminacion,
  resultCodeOk,
  servicioEstado
} from 'src/utils/defaultValues';
import * as Yup from 'yup';
import AddFalloModal from '../AddFalloModal';
import TerminarGestacionModal from './TerminarGestacionModal';

const mainUrl = '/sp/porcicultor/manejo/servicio';
const loteUrl = '/sp/porcicultor/manejo/servicio/lote-detalle';
const tiposInseminacion = lisTiposInseminacion();

function ServicioCerdaDetalle() {
  const [item, setItem] = useState(undefined);
  const [generalItem, setGeneralItem] = useState(undefined);
  const [editActive, setEditActive] = useState(false);
  const [showAction, setShowAction] = useState(true);
  const [enableGeneralTab, setEnableGeneralTab] = useState(false);
  const [enableServicioTab, setEnableServicioTab] = useState(false);
  const [terminarGestModal, setTerminarGestModal] = useState(false);
  const [falloModal, setFalloModal] = useState(false);
  const [enableGestTab, setEnableGestTab] = useState(false);
  const [disableSegundaVer, setDisableSegundaVer] = useState(true);
  const [disablePrimeraVer, setDisablePrimeraVer] = useState(true);
  const [disableTerceraVer, setDisableTerceraVer] = useState(true);

  const [verracos, setVerracos] = useState([]);
  const [locationState, setLocationState] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();
  const generalForm = useRef();
  const servicioForm = useRef();
  const gestacionForm = useRef();

  // get servicio by id
  const getItemById = useCallback(
    async (reqObj) => {
      setLoadingItem(true)
      try {
        const response = await certifyAxios.post(
          cerdaServicioFindByIdAPI,
          reqObj
        );
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setGeneralItem(response.data);
            const estado = response?.data?.loteCerdaServicio?.estado;
            if (estado !== undefined || estado !== null) {
              const fechaSegundaInseminacion =
                response?.data?.loteCerdaServicio?.fechaSegundaInseminacion || null;
              const fechaPrimeraRecela =
                response?.data?.loteCerdaServicio?.fechaPrimeraRecela || null;
              const fechaSegundaRecela =
                response?.data?.loteCerdaServicio?.fechaSegundaRecela || null;
                const fechaVerGestacion =
                response?.data?.loteCerdaServicio?.fechaVerGestacion || null;
              if (
                estado === servicioEstado.finalizado ||
                estado === servicioEstado.fallido
              ) {
                setShowAction(false);
              }
              // evaluamos flags
              if (
                estado === servicioEstado.porServir ||
                (estado === servicioEstado.enServicio &&
                  fechaPrimeraRecela === null)
              ) {
                setEnableGeneralTab(true);
                getVerracos();
              } else {
                const list = (response?.data?.loteCerdaServicio?.verraco !== null)? [response?.data?.loteCerdaServicio?.verraco] : []
                setVerracos(list);
              }

              if (estado === servicioEstado.enServicio) {
                setEnableServicioTab(true);

                if(fechaSegundaInseminacion !== null && fechaSegundaRecela === null){
                  setDisablePrimeraVer(false)
                }
                                
                if (fechaPrimeraRecela !== null && fechaVerGestacion === null) {
                  setDisableSegundaVer(false);
                }
                if (fechaSegundaRecela !== null) {
                  setDisableTerceraVer(false);
                }
              }

              if (estado === servicioEstado.gestacion) {
                setEnableGestTab(true);
              }
            }
            setItem(response.data.loteCerdaServicio);
          }
          setLoadingItem(false)
        }
      } catch (err) {
        console.error(err);
        setItem({});
        setLoadingItem(false)
        if (err.response) {
          console.log(err.response);
        } else {
          console.error('Servicio encontró un error');
        }
        enqueueSnackbar('El servicio ha encontrado un error', {
          variant: 'error'
        });
      }
    },
    [isMountedRef]
  );

  useEffect(() => {
    if (location.state.servicioId !== -1) {
      // id de navigate
      setLocationState({
        servicioId: location.state.servicioId,
        loteId: location.state.loteId,
        loteNombre: location.state.loteNombre
      });
      const request = {
        id: location.state.servicioId,
        granjaId: user.granjaId
      };
      getItemById(request);
    } else {
      setEditActive(true);
      setItem({});
    }
  }, [getItemById]);

  const getVerracos = async () => {
    const reqObj = {
      granjaId: user.granjaId
    };
    try {
      const response = await certifyAxios.post(verracoQueryAllAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        setVerracos(response?.data?.list || []);
      }
    } catch (error) {
      console.error(error);
      setVerracos([]);
    }
  };

  const resetStates = (edit = false) => {
    if (edit) {
      setEditActive(false);
    }
    setLoading(false);
  };

  // edit
  const editItemById = async (reqObj, url) => {
    try {
      setLoading(true);
      const response = await certifyAxios.post(url, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({ id: reqObj.id, granjaId: user.granjaId});
        enqueueSnackbar(
          response.data.userMsg ?? 'Se ha modificado satisfactoriamente',
          { variant: 'success' }
        );
        resetStates(true);
      }
    } catch (error) {
      resetStates(true);
      if(generalForm?.current){
        generalForm.current.resetForm()
      }
      if(servicioForm?.current){
        servicioForm.current.resetForm()
      }
      if(gestacionForm?.current){
        gestacionForm.current.resetForm()
      }
      console.error(error);
      showUserErrors(error, 'No se ha podido modificar. Inténtelo de nuevo')
    }
  };

  // submit
  const handleSubmitGeneral = async () => {
    if (
      generalForm?.current ||
      servicioForm?.current ||
      gestacionForm?.current
    ) {
      const { fechaPrimeraRecela } = servicioForm?.current?.values;

      if (
        generalForm?.current &&
        enableGeneralTab &&
        fechaPrimeraRecela === null
      ) {
        // Se modifican aún solo los datos generales
        const values = generalForm.current.values;
        const isValid = generalForm.current.isValid;

        if(!isValid){
          enqueueSnackbar("Debe completar los Datos de inseminación en General", {variant:"error"})
          return;
        }

        const reqObj = {
          id: item.id,
          verracoId: values.verracoId,
          tipoServicio: values.tipoServicio,
          nombreInseminador: values.nombreInseminador,
          fechaPrimeraInseminacion: values.fechaPrimeraInseminacion,
          fechaSegundaInseminacion: values.fechaSegundaInseminacion
        };

        await editItemById(
          reqObj,
          servicioLoteInseminacionAPI
        );
      } else if(servicioForm?.current && enableServicioTab && fechaPrimeraRecela !== null){
        // se editan los valores del segundo tab
        const values = servicioForm.current.values;
        const isValid = servicioForm.current.isValid;

        if(!isValid){
          enqueueSnackbar("Debe completar las verificaciones en Servicio", {variant:"error"})
          return;
        }
        const reqObj = {
          id: item.id,
          fechaPrimeraRecela: values.fechaPrimeraRecela,
          resultadoPrimeraRecela: values.resultadoPrimeraRecela === -1? 0: values.resultadoPrimeraRecela,
          fechaSegundaRecela: values.fechaSegundaRecela,
          resultadoSegundaRecela: values.resultadoSegundaRecela === -1? 0: values.resultadoSegundaRecela,
          fechaVerGestacion: values.fechaVerGestacion,
          resultadoVerGestacion: values.resultadoVerGestacion === -1? 0: values.resultadoVerGestacion,
        };
        await editItemById(
          reqObj,
          servicioLoteVerificacionesAPI
        );

      } else if(gestacionForm?.current && enableGestTab) {
        const values = gestacionForm.current.values;
        const isValid = gestacionForm.current.isValid;

        if(!isValid){
          enqueueSnackbar("Debe completar las verificaciones en Servicio", {variant:"error"})
          return;
        }
        const reqObj = {
          id: item.id,
          fechaSalaMaternindad: values.fechaSalaMaternindad
        };
        await editItemById(
          reqObj,
          servicioLoteGestacionAPI
        );
      }
    }
  };

  const closeTerminarGestModal = () => {
    setTerminarGestModal(false)
  };

  const terminarGestacion = async (reqObj, resetForm) => {
    try {
      const response = await certifyAxios.post(servicioTerminarGestacionAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({ id: reqObj.id, granjaId: user.granjaId});
        enqueueSnackbar(
          await response.data.userMsg ?? 'Se ha terminado con la gestación',
          { variant: 'success' }
        );
        closeTerminarGestModal()
      }
    } catch (error) {
      closeTerminarGestModal()
      resetForm()
      showUserErrors(error, 'No se ha podido modificar. Inténtelo de nuevo')
    }
  };

  const closeFalloModal = () => {
    setFalloModal(false)
  };
  
  // registrar fallo
  const registerFallo = async (reqObj) => {
    try {
      const response = await certifyAxios.post(servicioFalloRegisterAPI, reqObj);
      if(response.data?.resultCode === resultCodeOk){
        await getItemById({ id: reqObj.loteCerdaServicioId, granjaId: user.granjaId});
        enqueueSnackbar(response.data.userMsg?? "Se ha registrado fallo satisfactoriamente", {variant:"success"})
      }
      closeFalloModal()
    } catch (error) {
      showUserErrors(error, "No se ha podido agregar fallo. Inténtelo de nuevo")
      closeFalloModal()
    }
  }

  // return
  const navigateToLoteList = () => {
    navigate(loteUrl, {
      state: {
        loteId: locationState.loteId,
        loteNombre: locationState.loteNombre
      }
    });
  };

  const navigateToMain = () => {
    navigate(mainUrl);
  };

  return (
    <>
      <Helmet>
        <title>Cerda Servicio</title>
      </Helmet>
      <PageTitleWrapper>
        <Grid container alignItems="center">
          <Grid item xs={12} md={12} sm={12} mb={2}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" onClick={navigateToMain}>
                Listado de Servicios
              </Link>
              <Link
                underline="hover"
                color="inherit"
                onClick={navigateToLoteList}
              >
                Servicio del Lote
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
              Detalle de Cerda
            </Typography>
          </Grid>
          {showAction && editActive && (
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
                  if (editActive) {
                    if (generalForm.current) {
                      generalForm.current.resetForm();
                    }
                    if (servicioForm.current) {
                      servicioForm.current.resetForm();
                    }
                    if (gestacionForm.current) {
                      gestacionForm.current.resetForm();
                    }
                    setEditActive(false);
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitGeneral}
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
          {showAction && !editActive && (
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
          px: theme.spacing(5),
          mx: theme.spacing(4),
          background: 'white',
          borderRadius: 2
        }}
      >
        {loadingItem 
          && <div style={{ display: 'grid', justifyContent: 'center', paddingTop:"6rem", paddingBottom:"6rem"}}>
                <CircularProgress color="secondary" sx={{mb: "1rem", mx:"10rem"}}/>
          </div> 
        }
        {!loadingItem && (item !== undefined && generalItem !== undefined) && (
          <div>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title="General">
                <div style={{ marginTop: 2 }}>
                  <Grid container spacing={3} mb={3} mt={1}>
                    {/* Datos cerda */}
                    <SubtitleForm subtitle="Datos de Cerda" />
                    <Grid container item xs={12} sm={12} md={12} spacing={4}>
                      <Grid item xs={12} sm={12} md={4}>
                        <DataView
                          label="Código"
                          text={
                            (item?.loteCerda?.cerda &&
                              item?.loteCerda?.cerda?.codigo) ||
                            ''
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                        <DataView
                          label="Fecha de nacimiento"
                          text={
                            (item?.loteCerda?.cerda &&
                              item?.loteCerda?.cerda?.fechaNacimiento &&
                              formatDate(
                                item?.loteCerda?.cerda?.fechaNacimiento
                              )) ||
                            '-'
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                        <DataView
                          label="Línea genético"
                          text={
                            (item?.loteCerda?.cerda &&
                              item?.loteCerda?.cerda?.lineaGenetica?.nombre) ||
                            ''
                          }
                        />
                      </Grid>
                    </Grid>
                    <Grid container item xs={12} sm={12} md={12} spacing={4}>
                      <Grid item xs={12} sm={12} md={4}>
                        <DataView
                          label="Orden de parto"
                          text={
                            (item?.loteCerda?.cerda &&
                              item?.loteCerda?.cerda?.ordenParto) ||
                            '0'
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                        <DataView
                          label="Días no productivos"
                          text={generalItem?.diasNoProductivos || 0}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Formik
                    key={1}
                    innerRef={generalForm}
                    enableReinitialize
                    initialValues={{
                      verracoId:
                        (item && item?.verraco && item?.verraco?.id) || -1,
                      tipoServicio: (item && item.tipoServicio) || 'none',
                      fechaPrimeraInseminacion:
                        (item && item.fechaPrimeraInseminacion) || null,
                      fechaSegundaInseminacion:
                        (item && item.fechaSegundaInseminacion) || null,
                      nombreInseminador: (item && item.nombreInseminador) || ''
                    }}
                    validationSchema={Yup.object().shape({
                      verracoId: Yup.number()
                        .min(0, 'Seleccionar un verraco')
                        .required('Seleccionar un verraco'),
                      tipoServicio: Yup.string()
                        .matches(/^(?!none\b)/i, 'Seleccionar un tipo')
                        .required('El tipo es obligatorio'),
                      fechaPrimeraInseminacion: Yup.string()
                        .nullable('La fecha de inseminación es obligatoria')
                        .required('La fecha de inseminación es obligatoria'),
                      nombreInseminador: Yup.string().required(
                        'El nombre es obligatorio'
                      )
                    })}
                  >
                    {({
                      errors,
                      touched,
                      handleBlur,
                      handleChange,
                      values,
                      handleSubmit,
                      setFieldValue
                    }) => (
                      <form noValidate onSubmit={handleSubmit}>
                        <Grid
                          container
                          justifyContent="center"
                          spacing={4}
                          mb={3}
                        >
                          {/* Datos inseminacion */}
                          <SubtitleForm subtitle="Datos de Inseminación" />
                          <Grid
                            container
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            spacing={4}
                          >
                            {/* Codigo */}
                            <Grid item xs={12} sm={12} md={4}>
                              <SelectForm
                                label="Código Verraco"
                                name="verracoId"
                                value={values.verracoId}
                                onChange={handleChange}
                                errors={errors}
                                touched={touched}
                                number
                                handleBlur={handleBlur}
                                disabled={!editActive || !enableGeneralTab}
                              >
                                {verracos !== null &&
                                  verracos !== undefined &&
                                  verracos[0] !== null &&
                                  verracos.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                      {type.codigo}
                                    </MenuItem>
                                  ))}
                              </SelectForm>
                            </Grid>
                            {/* Tipo */}
                            <Grid item xs={12} sm={12} md={4}>
                              <SelectForm
                                label="Tipo de Servicio"
                                name="tipoServicio"
                                value={values.tipoServicio}
                                onChange={handleChange}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                disabled={!editActive || !enableGeneralTab}
                              >
                                {tiposInseminacion.map((type) => (
                                  <MenuItem key={type.value} value={type.value}>
                                    {type.text}
                                  </MenuItem>
                                ))}
                              </SelectForm>
                            </Grid>
                            {/* Nombre */}
                            <Grid item xs={12} sm={12} md={4}>
                              <InputForm
                                inputName="nombreInseminador"
                                value={values.nombreInseminador}
                                label="Nombre Inseminador"
                                placeholder="Nombre Inseminador"
                                handleChange={handleChange}
                                errors={errors}
                                touched={touched}
                                disabled={!editActive || !enableGeneralTab}
                                handleBlur={handleBlur}
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
                            {/* Fecha primera inseminacion */}
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePickerForm
                                inputName="fechaPrimeraInseminacion"
                                value={values.fechaPrimeraInseminacion}
                                label="Primera Inseminación"
                                disableFuture
                                setFieldValue={setFieldValue}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                disabled={!editActive || !enableGeneralTab}
                                time
                              />
                            </Grid>
                            {/* Fecha segunda inseminacion */}
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePickerForm
                                inputName="fechaSegundaInseminacion"
                                value={values.fechaSegundaInseminacion}
                                label="Segunda Inseminación"
                                disableFuture
                                setFieldValue={setFieldValue}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                disabled={!editActive || !enableGeneralTab}
                                time
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </form>
                    )}
                  </Formik>
                  <SubtitleForm subtitle="Fallo en servicio" />
                  {item && item.fechaFallo === null && (
                    <div>
                      <Typography>No presenta ningun Fallo</Typography>
                      {showAction && (
                        <Button
                          onClick={() => {
                            setFalloModal(true);
                          }}
                          variant="outlined"
                          size="small"
                          color="primary"
                          sx={{ mt: 2 }}
                        >
                          Registrar Fallo
                        </Button>
                      )}
                    </div>
                  )}
                  {item && item.fechaFallo !== null && (
                    <Grid container justifyContent="center" spacing={1}>
                      <Grid item xs={12} sm={12} md={12} mt={0}>
                        <Typography gutterBottom>
                          <b style={{ color: '#4a3fa5' }}>Fecha de fallo:</b>{' '}
                          {formatDate(item.fechaFallo)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                          <b style={{ color: '#4a3fa5' }}>Motivo:</b>{' '}
                          {item.motivoFallo || ''}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                          <b style={{ color: '#4a3fa5' }}>Descripción:</b>{' '}
                          {item.descripcionFallo || ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </div>
              </Tab>
              <Tab eventKey={2} title="Servicio">
                <div style={{ paddingTop: '1rem' }}>
                  {showAction && (
                    <Alert severity="primary">
                      Si no pasa alguna de las verificaciones, se registrará el
                      fallo en el servicio de manera automática
                    </Alert>
                  )}
                  <Formik
                    key={2}
                    innerRef={servicioForm}
                    enableReinitialize
                    initialValues={{
                      fechaPrimeraRecela: (item && item.fechaPrimeraRecela) || null,
                      fechaSegundaRecela: (item && item.fechaSegundaRecela) || null,
                      fechaVerGestacion: (item && item.fechaVerGestacion) || null,
                      resultadoPrimeraRecela: item && item.fechaPrimeraRecela? item.resultadoPrimeraRecela: -1,
                      resultadoSegundaRecela: item && item.fechaSegundaRecela? item.resultadoSegundaRecela: -1,
                      resultadoVerGestacion: item && item.fechaVerGestacion? item.resultadoVerGestacion: -1
                    }}
                  >
                    {({
                      errors,
                      touched,
                      values,
                      handleChange,
                      handleSubmit,
                      setFieldValue
                    }) => (
                      <form noValidate onSubmit={handleSubmit}>
                        <Grid
                          container
                          justifyContent="normal"
                          spacing={2}
                          mb={3}
                          mt="0.5rem"
                        >
                          <Grid item xs={12} md={0.5} sm={0.5}>
                            <ServicioStatusDetalle
                              disabled={disablePrimeraVer}
                              fecha={item && item?.fechaPrimeraRecela}
                              resultado={item?.resultadoPrimeraRecela}
                            />
                          </Grid>
                          <Grid
                            container
                            item
                            xs={12}
                            md={10.5}
                            sm={10.5}
                            spacing={2}
                          >
                            <SubtitleForm
                              subtitle="Verificación de Primera Recela"
                              description={`Recomendación: Verificación probable ${
                                generalItem.diasMinRecela || 0
                              } días tras el servicio`}
                            />
                            <Grid
                              container
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              spacing={3}
                            >
                              <Grid item xs={12} sm={12} md={4}>
                                <DatePicker
                                  value={
                                    generalItem?.fechaPrimeraRecelaProbable ||
                                    null
                                  }
                                  label="Fecha probable"
                                  disabled
                                  onChange={() => {}}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      placeholder="dd/mm/yyyy"
                                      name="primerRecelaProbabel"
                                    />
                                  )}
                                />
                              </Grid>
                              {/* Fecha real verificación */}
                              <Grid item xs={12} sm={12} md={4}>
                                <DatePickerForm
                                  inputName="fechaPrimeraRecela"
                                  value={values.fechaPrimeraRecela}
                                  label="Fecha real de verificación"
                                  // disableFuture
                                  setFieldValue={setFieldValue}
                                  errors={errors}
                                  touched={touched}
                                  disabled={!editActive || disablePrimeraVer}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12} md={4}>
                                <FormControl
                                  sx={{ marginLeft: 3 }}
                                  disabled={!editActive || disablePrimeraVer}
                                >
                                  <FormLabel id="radio-primera">
                                    Resultado: ¿Presenta celo?
                                  </FormLabel>
                                  <RadioGroup
                                    aria-labelledby="radio-primera"
                                    value={values.resultadoPrimeraRecela}
                                    name="resultadoPrimeraRecela"
                                    onChange={handleChange}
                                    row
                                  >
                                    <FormControlLabel
                                      value={1}
                                      control={<Radio />}
                                      label="Sí"
                                    />
                                    <FormControlLabel
                                      value={0}
                                      control={<Radio />}
                                      label="No"
                                    />
                                  </RadioGroup>
                                </FormControl>
                              </Grid>
                              {editActive &&
                                  values.resultadoPrimeraRecela === '1' &&
                                  <Grid item xs={12}>
                                    <Alert severity="error">
                                      Si la cerda presenta celo, se registrará
                                      como fallo reproductivo al guardar los
                                      cambios.
                                    </Alert>
                              </Grid>}
                            </Grid>
                          </Grid>
                        </Grid>
                          <Grid
                          container
                          justifyContent="normal"
                          spacing={2}
                          mb={3}
                          mt="0.5rem"
                        >
                          <Grid item xs={12} md={0.5} sm={0.5}>
                            <ServicioStatusDetalle
                              disabled={disableSegundaVer}
                              fecha={item?.fechaSegundaRecela}
                              resultado={item?.resultadoSegundaRecela}
                            />
                          </Grid>
                          <Grid
                            container
                            item
                            xs={12}
                            md={10.5}
                            sm={10.5}
                            spacing={2}
                          >
                            <SubtitleForm
                              subtitle="Verificación de Segunda Recela"
                              description={`Recomendación: Verificación probable ${
                                (generalItem?.diasMinRecela &&
                                  generalItem?.diasMinRecela * 2) ||
                                0
                              } días tras el servicio`}
                            />
                            <Grid
                              container
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              spacing={4}
                            >
                              <Grid item xs={12} sm={12} md={4}>
                                <DatePicker
                                  value={
                                    generalItem?.fechaSegundaRecelaProbable ||
                                    null
                                  }
                                  label="Fecha probable"
                                  onChange={() => {}}
                                  disabled
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      placeholder="dd/mm/yyyy"
                                      name="segundaRecelaProbable"
                                    />
                                  )}
                                />
                              </Grid>
                              {/* Fecha real verificación */}
                              <Grid item xs={12} sm={12} md={4}>
                                <DatePickerForm
                                  inputName="fechaSegundaRecela"
                                  value={values.fechaSegundaRecela}
                                  label="Fecha real de verificación"
                                  // disableFuture
                                  setFieldValue={setFieldValue}
                                  errors={errors}
                                  touched={touched}
                                  disabled={!editActive || disableSegundaVer}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12} md={4}>
                                <FormControl
                                  sx={{ marginLeft: 3 }}
                                  disabled={!editActive || disableSegundaVer}
                                >
                                  <FormLabel id="radio-segundo">
                                    Resultado: ¿Presenta celo?
                                  </FormLabel>
                                  <RadioGroup
                                    aria-labelledby="radio-segundo"
                                    value={values.resultadoSegundaRecela}
                                    name="resultadoSegundaRecela"
                                    onChange={handleChange}
                                    row
                                  >
                                    <FormControlLabel
                                      value={1}
                                      control={<Radio />}
                                      label="Sí"
                                    />
                                    <FormControlLabel
                                      value={0}
                                      control={<Radio />}
                                      label="No"
                                    />
                                  </RadioGroup>
                                </FormControl>
                              </Grid>
                              {editActive &&
                                  values.resultadoSegundaRecela === '1' &&
                                  <Grid item xs={12}>
                                    <Alert severity="error">
                                      Si la cerda presenta celo, se registrará
                                      como fallo reproductivo al guardar los
                                      cambios.
                                    </Alert>
                              </Grid>}
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid
                          container
                          justifyContent="normal"
                          spacing={2}
                          mb={3}
                          mt="0.5rem"
                        >
                          <Grid item xs={12} md={0.5} sm={0.5}>
                            <ServicioStatusDetalle
                              disabled={disableTerceraVer}
                              fecha={item?.fechaVerGestacion}
                              resultado={item?.resultadoVerGestacion}
                              gest
                            />
                          </Grid>
                          <Grid container item xs={12} md={10.5} sm={10.5} spacing={2}>
                          <SubtitleForm
                            subtitle="Verificación de Gestación"
                            description="Se verifica de manera visual o mediante ecografías la gestación de la cerda."
                            d2={`Recomendación: Verificación probable ${
                              (generalItem?.diasDeteccionGestacion &&
                                generalItem?.diasDeteccionGestacion) ||
                              0
                            } días tras el servicio`}
                          />
                          <Grid
                            container
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            spacing={4}
                          >
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePicker
                                value={
                                  generalItem?.fechaVerGestacionProbable || null
                                }
                                label="Fecha probable"
                                onChange={() => {}}
                                disabled
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    placeholder="dd/mm/yyyy"
                                    name="verGestacionProbable"
                                  />
                                )}
                              />
                            </Grid>
                            {/* Fecha real verificación */}
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePickerForm
                                inputName="fechaVerGestacion"
                                value={values.fechaVerGestacion}
                                label="Fecha real de verificación"
                                // disableFuture
                                setFieldValue={setFieldValue}
                                errors={errors}
                                touched={touched}
                                disabled={!editActive || disableTerceraVer}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={4}>
                              <FormControl
                                sx={{ marginLeft: 3 }}
                                disabled={!editActive || disableTerceraVer}
                              >
                                <FormLabel id="radio-gest">
                                  Resultado: ¿Presenta signos visuales?
                                </FormLabel>
                                <RadioGroup
                                  aria-labelledby="radio-gest"
                                  value={values.resultadoVerGestacion}
                                  name="resultadoVerGestacion"
                                  onChange={handleChange}
                                  row
                                >
                                  <FormControlLabel
                                    value={1}
                                    control={<Radio />}
                                    label="Sí"
                                  />
                                  <FormControlLabel
                                    value={0}
                                    control={<Radio />}
                                    label="No"
                                  />
                                </RadioGroup>
                              </FormControl>
                            </Grid>
                            <Grid item>
                              {editActive &&
                                values.resultadoVerGestacion === '0' && (
                                  <Alert severity="error">
                                    Si la cerda no presenta signos visuales, se
                                    registrará como fallo reproductivo al
                                    guardar los cambios.
                                  </Alert>
                                )}
                            </Grid>
                          </Grid>
                          </Grid>
                        </Grid>
                      </form>
                    )}
                  </Formik>
                </div>
              </Tab>
              <Tab eventKey={3} title="Gestación">
                <>
                  <Formik
                    key={3}
                    innerRef={gestacionForm}
                    enableReinitialize
                    initialValues={{
                      fechaSalaMaternindad:
                        (item && item.fechaSalaMaternindad) || null
                    }}
                    validationSchema={Yup.object().shape({
                      fechaSalaMaternindad: Yup.string()
                        .nullable('La fecha es requerida.')
                        .required('La fecha es requerida.')
                    })}
                  >
                    {({
                      errors,
                      touched,
                      values,
                      handleSubmit,
                      setFieldValue
                    }) => (
                      <form noValidate onSubmit={handleSubmit}>
                        <Grid
                          container
                          justifyContent="center"
                          spacing={3}
                          mb={3}
                          mt={1}
                        >
                          <SubtitleForm
                            subtitle="Paso a sala de maternidad"
                            description={`Fecha probable ${
                              generalItem.diasPasoSalaMaterna || 0
                            } días tras el servicio`}
                          />
                          <Grid
                            container
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            spacing={3}
                          >
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePicker
                                value={
                                  generalItem?.fechaSalaMaternindadProbable ||
                                  null
                                }
                                label="Fecha probable"
                                onChange={() => {}}
                                disabled
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    placeholder="dd/mm/yyyy"
                                    name="salaMaternidadProbable"
                                  />
                                )}
                              />
                            </Grid>
                            {/* Fecha real verificación */}
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePickerForm
                                inputName="fechaSalaMaternindad"
                                value={values.fechaSalaMaternindad}
                                label="Fecha real"
                                disableFuture
                                setFieldValue={setFieldValue}
                                errors={errors}
                                touched={touched}
                                disabled={!editActive || !enableGestTab}
                              />
                            </Grid>
                          </Grid>
                          <SubtitleForm
                            subtitle="Parto probable"
                            description={`Fecha probable ${
                              generalItem.diasPartoProbable || 0
                            } días tras el servicio`}
                          />
                          <Grid
                            container
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            spacing={4}
                          >
                            <Grid item xs={12} sm={12} md={4}>
                              <DatePicker
                                value={generalItem?.fechaPartoProbable || null}
                                label="Fecha probable"
                                disabled
                                onChange={() => {}}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    placeholder="dd/mm/yyyy"
                                    name="partoProbable"
                                  />
                                )}
                              />
                            </Grid>
                            {item && item?.fechaParto != null && (
                              <Grid item xs={12} sm={12} md={4}>
                                <DatePicker
                                  value={item?.fechaParto || null}
                                  label="Fecha Real"
                                  disabled
                                  onChange={() => {}}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      placeholder="dd/mm/yyyy"
                                      name="salaMaternidadProbable"
                                    />
                                  )}
                                />
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </form>
                    )}
                  </Formik>
                  <Grid container justifyContent="center">
                    {showAction && (
                      <Button
                        onClick={() => {
                          setTerminarGestModal(true);
                        }}
                        variant="outlined"
                        size="small"
                        color="primary"
                        sx={{ mt: 2 }}
                      >
                        Terminar Gestación
                      </Button>
                    )}
                  </Grid>
                </>
              </Tab>
            </Tabs>
          </div>
        )}
      </DialogContent>
      {terminarGestModal && (
        <TerminarGestacionModal
          open={terminarGestModal}
          modalClose={closeTerminarGestModal}
          loteCerdaServicioId={item.id}
          handleAction={terminarGestacion}
        />
      )}
      {falloModal && (
        <AddFalloModal
          open={falloModal}
          modalClose={closeFalloModal}
          texto={`Ingrese los motivos para el fallo de la cerda ${
            item?.loteCerda?.cerda?.codigo || ''
          }`}
          loteCerdaServicioId={item.id}
          handleAction={registerFallo}
        />
      )}
    </>
  );
}

export default ServicioCerdaDetalle;
