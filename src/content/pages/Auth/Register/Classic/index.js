import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import ErrorIcon from '@mui/icons-material/Error';
import {
  // Link,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { Children, useState } from 'react';
import * as Yup from 'yup';

import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import Logo from 'src/components/LogoSign';
import { keyCodeBack } from 'src/config';
import { departamentosPeru } from 'src/utils/defaultValues';
import axios from 'src/utils/spAxios';
import CustomizedSelectForFormik from './CustomizedSelectForFormik';


const MainContent = styled(Box)(
  () => `
    height: 100%;
    overflow: auto;
    flex: 1;
`
);

const BoxActions = styled(Box)(
  ({ theme }) => `
    background: ${theme.colors.alpha.black[5]}
`
);

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
      background-color: ${theme.colors.success.main};
      color: ${theme.palette.success.contrastText};
      width: ${theme.spacing(12)};
      height: ${theme.spacing(12)};
      box-shadow: ${theme.colors.shadows.success};
      margin-left: auto;
      margin-right: auto;

      .MuiSvgIcon-root {
        font-size: ${theme.typography.pxToRem(45)};
      }
`
);

const AvatarError = styled(Avatar)(
  ({ theme }) => `
      background-color: ${theme.colors.error.main};
      color: ${theme.palette.error.contrastText};
      width: ${theme.spacing(12)};
      height: ${theme.spacing(12)};
      box-shadow: ${theme.colors.shadows.error};
      margin-left: auto;
      margin-right: auto;

      .MuiSvgIcon-root {
        font-size: ${theme.typography.pxToRem(45)};
      }
`
);

function RegisterWizard() {
  const [result, setResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const registerUser = async (values) => {
    const {
      correo,
      password,
      nombreGranja,
      departamento,
      direccion
    } = values;

    const user ={
      correo,
      contrasena: password,
      nombreGranja,
      departamento,
      direccion
    };

    try {
      console.log("registrando: ", user)
      const response = await axios.post(
        '/auth/register',
        user,
        {
          headers: {
            Authorization: `${keyCodeBack}`
          }
        },
        {
          validateStatus: (status) => status < 500
        }
      );
      if (response.status === 200) {
        setResult(true);
      } else {
        setResult(false);
        setErrorMessage(
          'Por favor, inténtelo de nuevo. Si el error persiste, comunicarse con soporte'
        );
      }
    } catch (e) {
      setResult(false);
      setErrorMessage("Datos inválidos");
      console.log(e);
    }
  };

  return (
    <>
      <Helmet>
        <title>Registro</title>
      </Helmet>
      <MainContent sx={{background:"#CDEDFF"}}>
        <Container sx={{ my: 1 }} maxWidth="md">
          <Logo />
          <Card sx={{ mt: 2, pt: 4 }}>
            <Box px={4}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                Creación de cuenta
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                fontWeight="normal"
                sx={{ mb: 3 }}
              >
                Complete los campos a continuación para registrarse.
              </Typography>
            </Box>

            <FormikStepper
              initialValues={{
                correo: '',
                password: '',
                password_confirm: '',
                nombreGranja: '',
                departamento: '',
                direccion: 0
              }}
              onSubmit={async (_values) => {
                try {
                  await registerUser(_values);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              <FormikStep
                validationSchema={Yup.object().shape({
                  correo: Yup.string()
                    .email(
                      'El correo electrónico proporcionado debe ser una dirección de correo electrónico válida'
                    )
                    .max(255)
                    .required('El correo electrónico es obligatorio'),
                  password: Yup.string()
                    .min(
                      6,
                      'La contraseña debe tener por lo menos 6 caracteres '
                    )
                    .max(255)
                    .required('La contraseña es obligatoria'),
                  password_confirm: Yup.string()
                    .oneOf(
                      [Yup.ref('password')],
                      'Las contraseñas deben ser iguales'
                    )
                    .required('La contraseña es obligatoria'),
                  nombreGranja: Yup.string()
                  .max(255)
                  .required('El nombre es obligatorio'),
                  departamento: Yup.string()
                    .max(255)
                    .required('El departamento obligatorios'),
                  direccion: Yup.string()
                  .max(255)
                  .required('El departamento obligatorios'),
                })}
                label="Información Personal"
              >
                <Box p={4}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      Datos personales
                    </Grid>
                    <Grid item xs={12} md={6}>
                      Datos de la granja
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        fullWidth
                        name="correo"
                        component={TextField}
                        label="Correo electrónico"
                        placeholder="Correo electrónico"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        fullWidth
                        name="nombreGranja"
                        component={TextField}
                        label="Nombre de su Granja"
                        placeholder="Nombre de su Granja"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        fullWidth
                        type="password"
                        name="password"
                        component={TextField}
                        label="Contraseña"
                        placeholder="Escribe tu contraseña aquí"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl sx={{ minWidth: 'calc(100%)' }}>
                        <InputLabel>Departamento</InputLabel>
                        <Field
                          name="departamento"
                          component={CustomizedSelectForFormik}
                        >
                          {departamentosPeru.map((type) => (
                            <MenuItem key={type.key} value={type.key}>
                              {type.value}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        fullWidth
                        type="password"
                        name="password_confirm"
                        component={TextField}
                        label="Confirmar contraseña"
                        placeholder="Confirma tu contraseña aquí"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        fullWidth
                        name="direccion"
                        component={TextField}
                        label="Direccion"
                        placeholder="dirección"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </FormikStep>
              
              <FormikStep label="Resultado de Registro">
                <Box px={1} py={2}>
                  {result ? (
                    <Container maxWidth="sm">
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ mb: 2 }}>
                          Registro exitoso
                        </Typography>
                        <AvatarSuccess  sx={{ mb: 2 }}>
                          <CheckTwoToneIcon fontSize='8'/>
                        </AvatarSuccess>
                        <Button
                          variant="contained"
                          href="/account/login"
                          >
                          Ingresar
                        </Button>
                      </Box>
                    </Container>
                  ) : (
                    <Container maxWidth="sm">
                      <Box textAlign="center">
                      <AvatarError sx={{fontSize:"12px"}}>
                        <ErrorIcon/>
                      </AvatarError>
                      <Alert
                        sx={{ mt: 2, mb: 2 }}
                        severity="error"
                      >
                        {errorMessage}
                      </Alert>

                      <Button
                        variant="contained"
                        href="/account/register/classic"
                      >
                        Intentar de nuevo
                      </Button>
                      </Box>
                    </Container>
                  )}
                </Box>
              </FormikStep>
              
            </FormikStepper>
          </Card>
        </Container>
      </MainContent>
    </>
  );
}

export function FormikStep({ children }) {
  return <>{children}</>;
}

export function FormikStepper({ children, ...props }) {
  const childrenArray = Children.toArray(children);
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);

  function isLastStep() {
    return step === childrenArray.length - 2;
  }

  const navigate = useNavigate();

  const returnToLogin = () => {
      navigate('/account/login');
  };

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
          setStep((s) => s + 1);
        } else {
          setStep((s) => s + 1);
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step
                key={child.props.label}
                completed={step > index || completed}
              >
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentChild}
          {!completed ? (
            <BoxActions
              p={4}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Button
                color="error"
                size="small"
                variant="outlined"
                onClick={() => returnToLogin()}
                sx={{mr:2}}
              >
                Cancelar
              </Button>

              <Button
                startIcon={
                  isSubmitting ? <CircularProgress size="1rem"  color='white'/> : null
                }
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {isSubmitting
                  ? 'Registrando'
                  : isLastStep()
                  ? 'Guardar Cambios'
                  : 'Siguiente'}
              </Button>
            </BoxActions>
          ) : null}
        </Form>
      )}
    </Formik>
  );
}

export default RegisterWizard;
