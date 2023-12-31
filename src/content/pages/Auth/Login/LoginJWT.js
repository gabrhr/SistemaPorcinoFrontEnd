import * as Yup from 'yup';

import { Formik } from 'formik';

import {
  Button,
  CircularProgress,
  FormHelperText,
  TextField,
} from '@mui/material';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';

const LoginJWT = () => {
  const { login } = useAuth();
  const isMountedRef = useRefMounted();

  return (
    
    <Formik
      initialValues={{
        email: '',
        password: '',
        terms: true,
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email(
            'El correo electrónico proporcionado debe ser una dirección de correo electrónico válida'
          )
          .max(255)
          .required('El correo electrónico es obligatorio'),
        password: Yup.string().max(255).required('La contraseña es obligatoria')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          await login(values.email, values.password);

          if (isMountedRef.current) {
            setStatus({ success: true });
            setSubmitting(false);
          }
        } catch (err) {
          console.error(err);
          if (isMountedRef.current) {
            setStatus({ success: false });
            setErrors({ submit: err.message });
            setSubmitting(false);
          }
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values
      }) => (
        <form noValidate onSubmit={handleSubmit}>
          <TextField
            error={Boolean(touched.email && errors.email)}
            fullWidth
            margin="normal"
            autoFocus
            helperText={touched.email && errors.email}
            label="Correo electrónico"
            name="email"
            onBlur={handleBlur}
            onChange={handleChange}
            type="email"
            value={values.email}
            variant="outlined"
            color="secondary"
          />
          <TextField
            error={Boolean(touched.password && errors.password)}
            fullWidth
            margin="normal"
            helperText={touched.password && errors.password}
            label="Contraseña"
            name="password"
            onBlur={handleBlur}
            onChange={handleChange}
            type="password"
            value={values.password}
            variant="outlined"
            color="secondary"
          />

          {Boolean(touched.terms && errors.terms) && (
            <FormHelperText error>{errors.terms}</FormHelperText>
          )}

          <Button
            sx={{
              mt: 3,
              mb: 3
            }}
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size="1rem"  color='white'/> : null}
            disabled={isSubmitting}
            type="submit"
            size="large"
            variant="contained"
          >
            Ingresar
          </Button>

        </form>
      )}
    </Formik>
  );
};

export default LoginJWT;
