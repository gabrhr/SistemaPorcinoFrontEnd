import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  cerdaFindByIdAPI,
  cerdaUpdateAPI,
  lineaQueryAllAPI
} from 'src/utils/apiUrls';
import { cerdaEstados, resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  Grid,
  IconButton,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import SelectForm from 'src/components/Form/SelectForm';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';

import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import DataView from 'src/components/Form/DataView';
import DatePickerForm from 'src/components/Form/DatePickerForm';
import InputForm from 'src/components/Form/InputForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';

function EditCerda() {
  const [item, setItem] = useState(undefined);
  const [editActive, setEditActive] = useState(false);
  const [lineas, setLineas] = useState([]);

  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();

  // get cerda by id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(cerdaFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
          }
        }
      } catch (err) {
        console.error(err);
        setItem({});

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
    if (location.state.cerdaId !== -1) {
      const request = {
        id: location.state.cerdaId
      };
      getItemById(request);
    } else {
      setItem({});
    }
    getLineas();
  }, [getItemById]);

  // list lineas
  const getLineas = async () => {
    const reqObj = {
      granjaId: user.granjaId
    };
    try {
      const response = await certifyAxios.post(lineaQueryAllAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        setLineas(response?.data?.list || []);
      }
    } catch (error) {
      console.error(error);
      setLineas([]);
    }
  };

  // edit
  const editItemById = async (reqObj, resetForm) => {
    try {
      const response = await certifyAxios.post(cerdaUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const request = {
          id: reqObj.id
        };
        getItemById(request);
        enqueueSnackbar(
          response.data.userMsg ?? 'Se ha modificado satisfactoriamente',
          { variant: 'success' }
        );
      }
    } catch (error) {
      resetForm()
      console.error(error);
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
    setEditActive(false)
  };

  // texto de dias no productivos
  const getDNPText = (estado) => {
    if(estado === cerdaEstados.reemplazo){
      return "Tiempo de la cerda de reemplazo en la granja desde su ingreso"
    } else if(estado === cerdaEstados.descartada){
      return "Tiempo de la cerda desde su último destete hasta su descarte"
    }
    return "Intervalo de tiempo entre el destete a el servicio"
  }

  // return
  const navigateToMain = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>Detalle Cerda</title>
      </Helmet>
      { item !== undefined &&
        <Formik
          enableReinitialize
          initialValues={{
            codigo: (item && item.codigo) || '',
            lineaGeneticaId: (item && item.lineaGeneticaId) || -1,
            fechaNacimiento: item && item.fechaNacimiento || "",
            peso: item && item.peso || 0,
            fechaIngreso: item && item.fechaIngreso ||""
          }}
          validationSchema={Yup.object().shape({
            codigo: Yup.string().required('El codigo es requerido'),
            lineaGeneticaId: Yup.number().min(0, 'Seleccionar una línea').required('La línea es requerida'),
            fechaNacimiento: Yup.string().required('La fecha de nacimiento es obligatoria'),
            fechaIngreso: Yup.string().required('La fecha de ingreso es obligatoria'),
            peso: Yup.number().typeError('El peso debe ser un número').required('El peso es obligatorio')
          })}
          onSubmit={async (values, {resetForm, setSubmitting}) => {
            setSubmitting(false)
            const request = {
              codigo: values.codigo,
              lineaGeneticaId: values.lineaGeneticaId,
              fechaNacimiento: values.fechaNacimiento,
              peso: values.peso,
              fechaIngreso: values.fechaIngreso,
              granjaId: user.granjaId
            };
            if (editActive) {
              request.id = item.id;
              await editItemById(request, resetForm);
              setSubmitting(false)
            }
          }}
        >
          {({
            errors,
            touched,
            handleBlur,
            handleChange,
            resetForm,
            values,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            isValid,
            dirty
          }) => (
            <form noValidate onSubmit={handleSubmit}>
              <PageTitleWrapper>
                <Grid container alignItems="center">
                  <Grid item xs={2} md={0.5} sm={0.5}>
                    <IconButton size="small" onClick={navigateToMain}>
                      <KeyboardArrowLeftRoundedIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={10} md={6} sm={6} alignItems="left">
                    <Typography variant="h3" component="h3" gutterBottom>
                      Detalle cerda
                    </Typography>
                  </Grid>
                  {editActive && (
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
                            setEditActive(false);
                            resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        startIcon={
                          isSubmitting ? <CircularProgress size="1rem"  color='white'/> : null
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
                  {item.descartada !==1 && !editActive && (
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
              <DialogContent
                  sx={{
                      py: theme.spacing(3),
                      px: theme.spacing(6),
                      mx: theme.spacing(4),
                      mb: theme.spacing(3),
                      background: "white",
                      borderRadius: 2,
                      
                  }}
              >
              {/* Form */}
              <Grid container justifyContent="center" spacing={4}>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                {/* Codigo */}
                <Grid item xs={12} sm={12} md={4}>
                  <InputForm
                      inputName="codigo"
                      value={values.codigo}
                      label="Código"
                      placeholder="Ejemplo: CER001"
                      disabled={!editActive}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                    />
                </Grid>
                {/* Linea */}
                <Grid item xs={12} sm={12} md={4}>
                    <SelectForm
                      label="Linea genética"
                      name="lineaGeneticaId"
                      value={values.lineaGeneticaId}
                      onChange={handleChange}
                      handleBlur={handleBlur}
                      errors={errors}
                      touched={touched}
                      number
                      disabled={!editActive}
                    >
                          {lineas.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.nombre}
                          </MenuItem>
                        ))}
                    </SelectForm>
                </Grid>
                {/* Estado */}
                <Grid item xs={12} sm={12} md={3}>
                  <DataView status label="Estado reproductivo" text={item.estado} cerda/>                  
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                {/* Fecha nacimiento */}
                <Grid item xs={12} sm={12} md={4}>
                  <DatePickerForm
                      inputName="fechaNacimiento"
                      value={values.fechaNacimiento}
                      label="Fecha de Nacimiento"
                      disableFuture
                      setFieldValue={setFieldValue} 
                      errors={errors}
                      touched={touched}
                      disabled={!editActive}
                      handleBlur={handleBlur}
                    />
                </Grid>
                {/* Fecha ingreso */}
                <Grid item xs={12} sm={12} md={4}>
                   <DatePickerForm
                      inputName="fechaIngreso"
                      value={values.fechaIngreso}
                      label="Fecha de Ingreso"
                      disableFuture
                      setFieldValue={setFieldValue} 
                      errors={errors}
                      touched={touched}
                      disabled={!editActive}
                      handleBlur={handleBlur}
                    />
                </Grid>
                {/* Orden */}
                <Grid item xs={12} sm={12} md={4} className='center-form'>
                      <div>
                      <Typography>
                        Orden de parto: <span style={{ fontWeight: "bold", color:theme.palette.secondary }}>{item.ordenParto || 0}</span>
                      </Typography>
                      </div>
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                
                  {/* peso */}
                  <Grid item xs={12} sm={12} md={4}>
                  <InputForm
                    inputName="peso"
                    value={values.peso}
                    label="Peso (kg)"
                    placeholder="Peso de cerda en kg"
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
              
              </Grid>
              {/* Descarte */}
              {item.descartada === 1 && 
              <Grid container justifyContent="center" spacing={1} className='mt'>
                <SubtitleForm subtitle='Información de Descarte'/>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography gutterBottom>
                    <b style={{color:"#4a3fa5"}}>Fecha de descarte:</b> {formatDate(item.fechaDescarte)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography gutterBottom>
                  <b style={{color:"#4a3fa5"}}>Motivo:</b> {item.motivoDescarte || ""}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography gutterBottom>
                  <b style={{color:"#4a3fa5"}}>Fase de descarte:</b> {item.estadoDescarte || ""}
                  </Typography>
                </Grid>
              </Grid>}
              {/* Dias no productivos */}
              <Grid container justifyContent="center" spacing={2} className='mt'>
                <SubtitleForm subtitle='Periodo no productivo' description={getDNPText(item.estado)}/>
                <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                <Grid item xs={12} sm={12} md={4}>
                  <Typography variant='body1' gutterBottom>
                    Días no productivos
                  </Typography>
                  <Chip label={`\u00A0\u00A0${item.diasNoProductivos || 0}\u00A0\u00A0`} variant='outlined' color='black'/>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Typography variant='body1' gutterBottom>
                    Fecha de último destete
                  </Typography>
                  {
                    item.fechaUltimoServicio?
                    <Chip label={formatDate(item.fechaUltimoServicio)} variant='outlined' color='success' icon={<EventAvailableRoundedIcon/>}/>
                    :
                    <Chip label="Sin servicio" variant='outlined' color='primary' icon={<EventBusyRoundedIcon/>}/>
                  }
                </Grid>
                </Grid>
              </Grid>
              {/* Ultimo destete */}
              { item.servicio && 
              <Grid container justifyContent="center" spacing={2} className='mt'>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography variant='h6' gutterBottom>
                    Datos de último servicio
                  </Typography>
                </Grid>
                <Grid container item  xs={12} sm={12} md={12} spacing={3}>
                <Grid item xs={12} sm={12} md={4}>
                  <Typography variant='body1' gutterBottom>
                    Estado de Servicio
                  </Typography>
                  <Chip label={item?.servicio?.estado} variant='filled'/>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Typography variant='body1' gutterBottom>
                    Fecha de primera inseminación
                  </Typography>
                  {
                    item.servicio?.fechaPrimeraInseminacion?
                    <Chip label={formatDate(item.servicio.fechaPrimeraInseminacion)} variant='outlined' icon={<EventAvailableRoundedIcon/>}/>
                    :
                    <Chip label="Inseminacion pendiente" variant='outlined' icon={<EventBusyRoundedIcon/>}/>
                  }
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Typography variant='body1' gutterBottom>
                    Fecha de parto {item.servicio?.fechaParto === null && " probable"}
                  </Typography>
                    
                  <Chip label={formatDate(item.servicio?.fechaParto? item.servicio.fechaPrimeraInseminacion: item.fechaPartoProbable)} variant='outlined' icon={<CalendarTodayRoundedIcon/>}/>
                </Grid>
                </Grid>
              </Grid>}
              </DialogContent>
            </form>
          )}
        </Formik>
      }
    </>
  );
}

export default EditCerda;
