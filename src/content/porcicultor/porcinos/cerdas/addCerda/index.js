// /* eslint-disable */
import { useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  cerdaRegisterAPI,
  lineaQueryAllAPI
} from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';
import * as Yup from 'yup';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Button,
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
import { useNavigate } from 'react-router-dom';
import DatePickerForm from 'src/components/Form/DatePickerForm';
import InputForm from 'src/components/Form/InputForm';
import SelectForm from 'src/components/Form/SelectForm';
import useAuth from 'src/hooks/useAuth';
import { successMessage } from 'src/utils/notifications';

function AddCerda() {
  const [item, setItem] = useState(undefined);
  const [lineas, setLineas] = useState([]);

  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    getLineas();
    setItem({})
  }, []);

  // list lineas
  const getLineas = async () => {
    const reqObj = {
      granjaId: user.granjaId
    };
    try {
      const response = await certifyAxios.post(lineaQueryAllAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const lineasList = response?.data?.list || [];
        setLineas(lineasList);
      }
    } catch (error) {
      console.error(error);
      setLineas([]);
    }
  };

  // add
  const addItem = async (reqObj) => {
    console.log(reqObj)
    try {
      const response = await certifyAxios.post(cerdaRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
      }
    } catch (error) {
      console.error(error);
      showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
    }
    navigateToMain()
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
            codigo: '',
            estado:"none",
            lineaGeneticaId: -1,
            ordenParto: 0,
            fechaNacimiento: "",
            peso: 0,
            fechaIngreso: ""
          }}
          validationSchema={Yup.object().shape({
            codigo: Yup.string().required('El codigo es requerido'),
            lineaGeneticaId: Yup.number().min(0, 'Seleccionar una línea').required('La línea es requerida'),
            estado: Yup.string().matches(/^(?!none\b)/i, 'Seleccionar un estado').required('El estado es obligatorio'),
            ordenParto: Yup.number().required('El orden de parto es obligatorio'),
            fechaNacimiento: Yup.string().required('La fecha de nacimiento es obligatoria'),
            fechaIngreso: Yup.string().required('La fecha de ingreso es obligatoria'),
            peso: Yup.number().typeError('El peso debe ser un número').required('El peso es obligatorio')
          })}
          onSubmit={async (values, {setSubmitting}) => {
            const request = {
              ...values,
              granjaId: user.granjaId
            };
            await addItem(request);
            setSubmitting(false)
          }}
        >
          {({
            errors,
            touched,
            handleBlur,
            handleChange,
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
                      Agregar cerda
                    </Typography>
                  </Grid>
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
                            navigateToMain()
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
                </Grid>
              </PageTitleWrapper>
              {/* Form */}
              <DialogContent
                  sx={{
                      py: theme.spacing(3),
                      px: theme.spacing(6),
                      mx: theme.spacing(4),
                      background: "white",
                      borderRadius: 2,
                      
                  }}
              >
              <Grid container justifyContent="center" spacing={3}>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                {/* Codigo */}
                <Grid item xs={12} sm={12} md={6}>
                  <InputForm
                      inputName="codigo"
                      value={values.codigo}
                      label="Código"
                      placeholder="Ejemplo: CER001"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                    />
                </Grid>
                {/* Estado */}
                <Grid item xs={12} sm={12} md={6}>
                  <SelectForm
                    label="Estado reproductivo"
                    name="estado"
                    value={values.estado}
                    onChange={handleChange}
                    errors={errors}
                    touched={touched}
                    handleBlur={handleBlur}
                  >
                        <MenuItem value="Vacia">
                          Vacia
                        </MenuItem>
                        <MenuItem value="Reemplazo">
                          Reemplazo
                        </MenuItem>
                  </SelectForm>
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                  {/* Linea */}
                  <Grid item xs={12} sm={12} md={6}>
                    <SelectForm
                      label="Linea genética"
                      name="lineaGeneticaId"
                      value={values.lineaGeneticaId}
                      onChange={handleChange}
                      errors={errors}
                      touched={touched}
                      number
                      handleBlur={handleBlur}
                    >
                          {lineas.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.nombre}
                          </MenuItem>
                        ))}
                    </SelectForm>
                </Grid>
                {/* Orden */}
                <Grid item xs={12} sm={12} md={6}>
                  <InputForm
                      inputName="ordenParto"
                      value={values.ordenParto}
                      label="Orden de Parto"
                      placeholder="Número de partos"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      type="number"
                      inputProps={{ min: '0' }}
                    />
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                {/* Fecha nacimiento */}
                <Grid item xs={12} sm={12} md={6}>
                  <DatePickerForm
                      inputName="fechaNacimiento"
                      value={values.fechaNacimiento}
                      label="Fecha de Nacimiento"
                      disableFuture
                      setFieldValue={setFieldValue} 
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                    />
                </Grid>
                  {/* peso */}
                  <Grid item xs={12} sm={12} md={6}>
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
                    />
                </Grid>
              </Grid>
              <Grid container item  xs={12} sm={12} md={12} spacing={4}>
                {/* Fecha ingreso */}
                <Grid item xs={12} sm={12} md={6}>
                  <DatePickerForm
                      inputName="fechaIngreso"
                      value={values.fechaIngreso}
                      label="Fecha de Ingreso"
                      disableFuture
                      setFieldValue={setFieldValue} 
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                    />
                </Grid>
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

export default AddCerda;
