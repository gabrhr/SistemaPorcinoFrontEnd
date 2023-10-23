import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  perfilFindByGranjaIdAPI,
  perfilUpdateAPI
} from 'src/utils/apiUrls';
import { departamentosPeru, resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import {
  Button,
  CircularProgress,
  DialogContent,
  Grid,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { Helmet } from 'react-helmet-async';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';

import BackdropLoading from 'src/components/BackdropLoading';
import CircularLoading from 'src/components/CircularLoading';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import { errorMessage, successMessage } from 'src/utils/notifications';

function EditPerfil() {
  const [item, setItem] = useState(undefined);
  const [editActive, setEditActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();

  // get parametro by granja id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(perfilFindByGranjaIdAPI, reqObj);
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
        errorMessage('El servicio ha encontrado un error');
      }
    },
    [isMountedRef]
  );

  useEffect(() => {
      const request = {
        granjaId: user.granjaId
      }
      getItemById(request);
  }, [getItemById]);

  // edit
  const editItemById = async (reqObj, resetForm) => {
    setLoading(true)
    try {
      const response = await certifyAxios.post(perfilUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const request = {
          granjaId: user.granjaId
        };
        await getItemById(request);
        setLoading(false)
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
      }
    } catch (error) {
      resetForm()
      setLoading(false)
      console.error(error);
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
    setEditActive(false)
  };

  return (
    <>
      <Helmet>
        <title>Perfil</title>
      </Helmet>
        <Formik
          enableReinitialize
          initialValues={{
            correo: (item && item.correo) || "",
            nombre: (item && item.nombre) || "",
            departamento: (item && item.departamento) || "none",
            direccion: (item && item.direccion) || ""
          }}
          validationSchema={Yup.object().shape({
            correo: Yup.string().email('El correo electrónico no es válida').max(255)
                    .required('El correo electrónico es obligatorio'),
            nombre: Yup.string().max(255).required('El nombre es obligatorio'),
            departamento: Yup.string().matches(/^(?!none\b)/i, 'Seleccionar un departamento')
                  .required('El departamento es obligatorio'),
            direccion: Yup.string()
                  .max(255)
                  .required('La dirección es obligatoria')
          })}
          onSubmit={async (values, {resetForm}) => {
            const request = {
              correo: values.correo,
              nombre: values.nombre,
              departamento: values.departamento,
              direccion: values.direccion
            };
            if (editActive) {
              request.granjaId = item.id;
              await editItemById(request, resetForm);
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
                  <Grid item xs={10} md={6} sm={6} alignItems="left">
                    <Typography variant="h3" component="h3" gutterBottom>
                      Perfil
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
                        disabled={Boolean(errors.submit) || isSubmitting}
                        variant="contained"
                        size="small"
                        color="primary"
                      >
                        Guardar Cambios
                      </Button>
                    </Grid>
                  )}
                  {!editActive && (
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
              {item === undefined && <CircularLoading/>}
              <BackdropLoading open={loading}/>
              {item !== undefined && 
              <Grid container justifyContent="center" spacing={2}>
              <SubtitleForm subtitle='Datos Personales'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                {/* nombre */}
                <Grid item xs={12} sm={12} md={4}>
                  <InputForm
                      inputName="correo"
                      value={values.correo}
                      label="Correo Electrónico"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      disabled={!editActive}
                  />
                </Grid>
              </Grid>

              <SubtitleForm subtitle='Datos de la granja'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                <Grid item xs={12} sm={12} md={4}>
                  <InputForm
                      inputName="nombre"
                      value={values.nombre}
                      label="Nombre de su Granja"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      disabled={!editActive}
                    />
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                <Grid item xs={12} sm={12} md={4}>
                  <SelectForm
                    key="departamento"
                    label="Departamento"
                    name="departamento"
                    value={values.departamento}
                    onChange={handleChange}
                    handleBlur={handleBlur}
                    errors={errors}
                    disabled={!editActive}
                    touched={touched}
                    >
                      {departamentosPeru.map((e) => (
                        <MenuItem key={e.key} value={e.value}>
                          {e.value}
                        </MenuItem>
                      ))}
                  </SelectForm>
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                <Grid item xs={12} sm={12} md={4}>
                  <InputForm
                      inputName="direccion"
                      value={values.direccion}
                      label="Dirección"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      disabled={!editActive}
                    />
                </Grid>
              </Grid>
              </Grid>}
              </DialogContent>
            </form>
          )}
        </Formik>
    </>
  );
}

export default EditPerfil;
