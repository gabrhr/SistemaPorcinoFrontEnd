import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  paramatroUpdateAPI,
  parametroFindByGranjaIdAPI
} from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import {
  Button,
  CircularProgress,
  DialogContent,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import { Formik } from 'formik';
import { Helmet } from 'react-helmet-async';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';

import InputForm from 'src/components/Form/InputForm';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import { errorMessage, successMessage } from 'src/utils/notifications';

function EditParametros() {
  const [item, setItem] = useState(undefined);
  const [editActive, setEditActive] = useState(false);

  const theme = useTheme();
  const isMountedRef = useRefMounted();
  const { user } = useAuth();

  // get parametro by granja id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(parametroFindByGranjaIdAPI, reqObj);
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
        id: user.granjaId
      }
      getItemById(request);
  }, [getItemById]);

  // edit
  const editItemById = async (reqObj, resetForm) => {
    try {
      const response = await certifyAxios.post(paramatroUpdateAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const request = {
          id: user.granjaId
        };
        getItemById(request);
        successMessage(response.data.userMsg?? "Se ha modificado satisfactoriamente")
      }
    } catch (error) {
      resetForm()
      console.error(error);
      showUserErrors(error, "No se ha podido editar. Inténtelo de nuevo")
    }
    setEditActive(false)
  };

  return (
    <>
      <Helmet>
        <title>Paramatros</title>
      </Helmet>
        <Formik
          enableReinitialize
          initialValues={{
            diasMinRecela: (item && item.diasMinRecela) || 0,
            diasDeteccionGestacion: (item && item.diasDeteccionGestacion) || 0,
            diasPasoSalaMaterna: (item && item.diasPasoSalaMaterna) || 0,
            diasPartoProbable: (item && item.diasPartoProbable) || 0,
            diasMinDestete: (item && item.diasMinDestete) || 0,
            diasMaxDestete: (item && item.diasMaxDestete) || 0,
            diasFinPrecebo: (item && item.diasFinPrecebo) || 0,
            diasFinCebo: (item && item.diasFinCebo) || 0
          }}
          validationSchema={Yup.object().shape({
            diasMinRecela: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasDeteccionGestacion: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasPasoSalaMaterna: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasPartoProbable: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasMinDestete: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasMaxDestete: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasFinPrecebo: Yup.number().moreThan(0,'El parámetro es obligatorio'),
            diasFinCebo: Yup.number().moreThan(0,'El parámetro es obligatorio')
          })}
          onSubmit={async (values, {resetForm, setSubmitting}) => {
            setSubmitting(true)
            const request = {
              diasMinRecela: values.diasMinRecela,
              diasDeteccionGestacion: values.diasDeteccionGestacion,
              diasPasoSalaMaterna: values.diasPasoSalaMaterna,
              diasPartoProbable: values.diasPartoProbable,
              diasMinDestete: values.diasMinDestete,
              diasMaxDestete: values.diasMaxDestete,
              diasFinPrecebo: values.diasFinPrecebo,
              diasFinCebo: values.diasFinCebo
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
            isSubmitting
          }) => (
            <form noValidate onSubmit={handleSubmit}>
              <PageTitleWrapper>
                <Grid container alignItems="center">
                  <Grid item xs={10} md={6} sm={6} alignItems="left">
                    <Typography variant="h3" component="h3" gutterBottom>
                      Parámetros productivos y reproductivos
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
              <Grid container justifyContent="center" spacing={2}>
              <SubtitleForm subtitle='Servicio'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                {/* min recela */}
                <Grid item xs={12} sm={12} md={4}>
                  <Typography mb={.5} color="#5a5a5a">
                     Días mínimo para recela
                  </Typography>
                  <InputForm
                      inputName="diasMinRecela"
                      value={values.diasMinRecela}
                      label=" "
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

              <SubtitleForm subtitle='Gestación' description='Los días se contabilizan luego del servicio realizado.'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                {/* Días para deteccion de gestación */}
                <Grid item xs={12} sm={12} md={4}>
                  <Typography mb={.5} color="#5a5a5a">
                    Días para detección de gestación
                  </Typography>
                  <InputForm
                      inputName="diasDeteccionGestacion"
                      value={values.diasDeteccionGestacion}
                      label=" "
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      type='number'
                      inputProps={{ min: '0' }}
                      disabled={!editActive}
                    />
                </Grid>
                {/* Paso a sala */}
                <Grid item xs={12} sm={12} md={4}>
                <Typography mb={.5} color="#5a5a5a">
                Días para paso a sala de maternidad
                  </Typography>
                <InputForm
                      inputName="diasPasoSalaMaterna"
                      value={values.diasPasoSalaMaterna}
                      label=" "
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      type='number'
                      inputProps={{ min: '0' }}
                      disabled={!editActive}
                    />
                </Grid>
                {/* parto */}
                <Grid item xs={12} sm={12} md={4}>
                <Typography mb={.5} color="#5a5a5a">
                Días para probable parto
                  </Typography>
                  <InputForm
                      inputName="diasPartoProbable"
                      value={values.diasPartoProbable}
                      label=" "
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

              <SubtitleForm subtitle='Maternidad'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                  {/* min destete */}
                  <Grid item xs={12} sm={12} md={4}>
                  <Typography mb={.5} color="#5a5a5a">
                  Días mín de nacido para destete
                  </Typography>
                  <InputForm
                    inputName="diasMinDestete"
                    value={values.diasMinDestete}
                    label=" "
                    handleChange={handleChange}
                    errors={errors}
                    touched={touched}
                    handleBlur={handleBlur}
                    type='number'
                    inputProps={{ min: '0' }}
                    disabled={!editActive}
                  />
                </Grid>
                {/* max destete */}
                <Grid item xs={12} sm={12} md={4} >
                <Typography mb={.5} color="#5a5a5a" >
                Días máx de nacido para destete
                  </Typography>
                  <InputForm
                    inputName="diasMaxDestete"
                    value={values.diasMaxDestete}
                    label=" "
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
              
              <SubtitleForm subtitle='Engorde - Fin de Precebo'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4} mb={2}>
                  {/* min destete */} 
                  <Grid item xs={12} sm={12} md={4}>
                  <Typography mb={.5} color="#5a5a5a">
                  Días de nacido
                  </Typography>
                  <InputForm
                    inputName="diasFinPrecebo"
                    value={values.diasFinPrecebo}
                    label=" "
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

              <SubtitleForm subtitle='Engorde - Fin de Cebo'/>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                  {/* min destete */}
                  <Grid item xs={12} sm={12} md={4}>
                  <Typography mb={.5} color="#5a5a5a">
                  Días de nacido
                  </Typography>
                  <InputForm
                    inputName="diasFinCebo"
                    value={values.diasFinCebo}
                    label=" "
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
              </DialogContent>
            </form>
          )}
        </Formik>
    </>
  );
}

export default EditParametros;
