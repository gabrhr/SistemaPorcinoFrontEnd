import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  cerdaFindByIdAPI,
  cerdaRegisterAPI,
  cerdaUpdateAPI,
  lineaQueryAllAPI
} from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios from 'src/utils/spAxios';
import * as Yup from 'yup';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Button,
  CircularProgress,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Formik } from 'formik';
import useRefMounted from 'src/hooks/useRefMounted';
import useAuth from 'src/hooks/useAuth';

function AddEditCerda() {
  const [item, setItem] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
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
      setEditMode(true);
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

  // add
  const addItem = async (reqObj) => {
    try {
      const response = await certifyAxios.post(cerdaRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        enqueueSnackbar(
          response.data.userMsg ?? 'Se agregó satisfactoriamente',
          { variant: 'success' }
        );
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('No se ha podido agregar. Inténtelo de nuevo', {
        variant: 'error'
      });
    }
  };

  // edit
  const editItemById = async (reqObj) => {
    try {
      const response = await certifyAxios.post(cerdaUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        enqueueSnackbar(
          response.data.userMsg ?? 'Se ha modificado satisfactoriamente',
          { variant: 'success' }
        );
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('No se ha podido editar. Inténtelo de nuevo', {
        variant: 'error'
      });
    }
  };

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
            codigo: (editMode && item && item.codigo) || '',
            lineaGeneticaId: (editMode && item && item.lineaGeneticaId) || ''
          }}
          validationSchema={Yup.object().shape({
            codigo: Yup.string().required('El codigo es requerido'),
            lineaGeneticaId: Yup.string().required('La línea es requerida')
          })}
          onSubmit={async (values) => {
            const request = {
              codigo: values.codigo,
              lineaGeneticaId: values.lineaGeneticaId,
              granjaId: user.granjaId
            };
            if (editMode && editActive) {
              request.id = item.id;
              editItemById(request);
            } else {
              addItem(request);
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
            isSubmitting
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
                      {!editMode ? 'Agregar cerda' : 'Detalle cerda'}
                    </Typography>
                  </Grid>
                  {(!editMode || (editMode && editActive)) && (
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
                          if(!editMode){
                            navigateToMain()

                          } else if(editMode && editActive){
                            setEditActive(false);
                            resetForm();
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        startIcon={
                          isSubmitting ? <CircularProgress size="1rem" /> : null
                        }
                        disabled={Boolean(errors.submit) || isSubmitting}
                        variant="contained"
                        size="small"
                        color="primary"
                      >
                        Guardar Cambios
                      </Button>
                    </Grid>
                  )}
                  {editMode && !editActive && (
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
              {/* Form */}
              <DialogContent
                  sx={{
                      p: 3,
                      mx: theme.spacing(4),
                      background: "white",
                      borderRadius: 2
                  }}
              >
              <Grid
                container
                spacing={0}
                direction="column"
                paddingLeft={2}
                alignContent="stretch"
              >
                {/* Codigo */}
                <Grid
                  sx={{
                    my: `${theme.spacing(2)}`,
                    mr: `${theme.spacing(1)}`,
                    paddingRight: 3
                  }}
                  item
                  xs={12}
                  sm={12}
                  md={10}
                >
                  <TextField
                    error={Boolean(touched.codigo && errors.codigo)}
                    fullWidth
                    size="small"
                    helperText={touched.codigo && errors.codigo}
                    name="codigo"
                    placeholder="Ejemplo: CER001"
                    label="Codigo"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    variant="outlined"
                    value={values.codigo}
                  />
                </Grid>
                <Grid
                  sx={{
                    my: `${theme.spacing(2)}`,
                    mr: `${theme.spacing(1)}`,
                    paddingRight: 3
                  }}
                  item
                  xs={12}
                  sm={12}
                  md={10}
                >
                  <FormControl sx={{ width: '100%', my: 2 }}>
                    <InputLabel id="demo-simple-select-label">
                      Línea genética
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      name="lineaGeneticaId"
                      value={values.lineaGeneticaId}
                      label="Linea genética"
                      onChange={handleChange}
                    >
                      {lineas.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              </DialogContent>
            </form>
          )}
        </Formik>
      }
    </>
  );
}

export default AddEditCerda;
