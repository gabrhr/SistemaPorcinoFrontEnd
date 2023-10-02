import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { loteFindByIdAPI, loteRegisterAPI, loteUpdateAPI } from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
import DatePickerForm from 'src/components/Form/DatePickerForm';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { listTiposLote, loteEstado, loteTipos, resultCodeOk } from 'src/utils/defaultValues';
import AddCerdaModal from './AddCerdaModal';

const tipos = listTiposLote()

function AddEditLote() {
  const [item, setItem] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
  const [editActive, setEditActive] = useState(false);
  const [showAction, setShowAction] = useState(true)
  const [cerdaModal, setCerdaModal] = useState(false);
  const [removeList, setRemoveList] = useState([]);
  const [cerdasLote, setCerdasLote] = useState([]);  
  const [tipoSelected, setTipoSelected] = useState("none");  
  const [touchedTipo, setTouchedTipo] = useState(false);
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
        const response = await certifyAxios.post(loteFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setCerdasLote(response.data.cerdas)
            setTipoSelected(response.data.tipo)
            if(response?.data?.estado && response?.data?.estado === loteEstado.enProceso){
              setShowAction(false);
            } 
          }
        }
      } catch (err) {
        console.error(err);
        setItem({});
        setCerdasLote([])
        setTipoSelected("none")
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
    if (location.state.loteId !== -1) {
      // id de navigate
      setEditMode(true);
      const request = {
        id: location.state.loteId
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
     setTouchedTipo(false)
     setLoading(false)
  };
  
  

  // add
  const addItem = async (reqObj) => {
    const cerdasToSave = processCerdasToSave()
    reqObj.cerdaIds = cerdasToSave
    try {
      const response = await certifyAxios.post(loteRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        enqueueSnackbar(
          response.data.userMsg ?? 'Se agregó satisfactoriamente',
          { variant: 'success' }
        );
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
    reqObj.cerdaIds = cerdasToSave
   try {
      const response = await certifyAxios.post(loteUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({id: reqObj.id})
        enqueueSnackbar(
          response.data.userMsg ?? 'Se ha modificado satisfactoriamente',
          { variant: 'success' }
        );
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
  

  // cambiar el tipo 

  const changeTipoSelected = (tipo) => {
     setTipoSelected(tipo)
     setCerdasLote([])
  };
  
  // validar todo 
  const validateForm = () => {
    if(loading) return true
    if((formLote && formLote.current && !formLote?.current?.isValid)
    || tipoSelected === "none")
  {
    return true
  }
  
  if(editMode && cerdasLote.length>0 && JSON.stringify(cerdasLote) !== JSON.stringify(item.cerdas)){
    return false
  }
  
     return false
  };
  
  

  return (
    <>
      <Helmet>
        <title>Detalle Lote</title>
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
                      {!editMode ? 'Agregar lote' : 'Detalle lote'}
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
                            setCerdasLote(item.cerdas || [])
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
        <Formik
         innerRef={formLote}
          initialValues={{
            codigo: (editMode && item && item.codigo) || '',
            fechaApertura: (editMode && item && item.fechaApertura) || new Date(),
            numCorral: (editMode && item && item.numCorral) || -1,
          }}
          validationSchema={Yup.object().shape({
            codigo: Yup.string().required('El codigo es requerido'),
            fechaApertura: Yup.string().required('La fecha de apertura es obligatoria'),
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
              request.tipo = tipoSelected
              request.fechaApertura = values.fechaApertura
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
            setFieldValue,
          }) => (
            <form noValidate onSubmit={handleSubmit}>
              
              {/* Form and table */}
                
                <Grid container justifyContent="center" spacing={3}>
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
                  <Grid container item xs={12} sm={12} md={12} spacing={4}>
                    {/* Tipo */}
                    <Grid item xs={12} sm={12} md={6}>
                    {!editMode &&<FormControl sx={{ width: '100%'}} id="label-tipo">
                <InputLabel id="select-label-tipo">
                    Tipo
                </InputLabel>
                <Select
                    labelId="select-label-tipo"
                    label="Tipo"
                    size="small"
                    value={tipoSelected}
                    onChange={(e) => {changeTipoSelected(e.target.value)}}
                    onBlur={() => setTouchedTipo(true)}
                    error = {touchedTipo && tipoSelected === "none"}
                >
                    <MenuItem disabled value="none">
                        <em style={{color:"gray"}}>Seleccionar</em>
                    </MenuItem>
                    {tipos.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.text}
                          </MenuItem>
                        ))}
                </Select>
                <FormHelperText error>{(touchedTipo && tipoSelected === "none") && "Seleccionar un tipo"}</FormHelperText>
                </FormControl>

                    }
                    {editMode &&
                    <DataView status label='Tipo: ' text={item?.tipo} inline/>

                    }
                    </Grid>
                    
                     {/* Fecha */}
                     <Grid item xs={12} sm={12} md={6}>
                      <DatePickerForm
                        inputName="fechaApertura"
                        value={values.fechaApertura}
                        label="Fecha de apertura"
                        disablePast
                        setFieldValue={setFieldValue}
                        errors={errors}
                        touched={touched}
                        disabled={editMode}
                      />
                    </Grid>
                  </Grid>
                </Grid>
            </form>
          )}
        </Formik>
        
        {!showAction && <Grid container justifyContent="center" spacing={3} mt={2}>
        <SubtitleForm subtitle={`Datos de ${item?.tipo}`}/>
          <Grid item xs={12} sm={12} md={6}>
            <DataView lote status label='Estado: ' text={item?.estado}/>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            
            <DataView  label={item && item?.tipo === loteTipos.servicio?"Total Servidas": "Total Aptas para servir"} 
            text={item && item?.tipo === loteTipos.servicio? item.totalServidas : item.totalAptas }/>
          </Grid> 
        </Grid>}

        {/* List */}
        <Grid container justifyContent="center" spacing={3}>
          <SubtitleForm subtitle='Listado de cerdas' list>
                    {editActive && <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={openCerdaModal}
                      >
                        Agregar cerdas
                      </Button>}
                  </SubtitleForm>
                  <Grid item xs={12} sm={12} md={10}>
                    <Box
                      p={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mr={2}
                    >
                      <Box>
                        <Typography component="span" variant="subtitle1">
                          Total de cerdas:
                        </Typography>{' '}
                        <b>{cerdasLote.length || 0}</b> 
                      </Box>
                    </Box>
                    <Divider />
                    <TableContainer>
                      <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Código Cerda</TableCell>
                          <TableCell align='center'>Estado</TableCell>
                          <TableCell align='center'>Línea Genética</TableCell>
                          <TableCell align='center'>Orden de Parto</TableCell>
                          {editActive && <TableCell align='center'>Acciones</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                          {cerdasLote.length !== 0 &&
                            cerdasLote.map((element, idx) => {
                              return (
                              <TableRow hover key={idx}>
                                <TableCell>
                                  {element?.codigo?? ""}
                                </TableCell>
                                <TableCell align='center'>
                              <CerdaEstadoChip estado={element?.estado ?? ''} />
                            </TableCell>
                                <TableCell align='center'>
                                  {element?.lineaGeneticaNombre?? ""}
                                </TableCell>
                                <TableCell align='center'>
                                  {element?.ordenParto?? 0}
                                </TableCell>
                                  {editActive && 
                                <TableCell align='center'>
                                  <Tooltip title="Remover cerda">

                                    <IconButton color="error" 
                                        sx={{borderRadius:30}}
                                        onClick={()=> {removeCerda(element)}}
                                        >
                                        <DeleteRoundedIcon/>                          
                                    </IconButton>
                                    </Tooltip>
                                </TableCell>
                                    }
                              </TableRow>
                              )
                            })
                          }
                      </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
        </Grid>
        </>
        }
        </DialogContent>
      {cerdaModal && <AddCerdaModal
      open ={cerdaModal}
      modalClose={closeCerdaModal}
      handleAction={addCerdaToList}
      tipo = {tipoSelected === "none"? null: tipoSelected}
      granjaId ={user.granjaId}
      cerdasList={cerdasLote|| []}
      removeList={removeList || []}
      />}
    </>
  );
}

export default AddEditLote;
