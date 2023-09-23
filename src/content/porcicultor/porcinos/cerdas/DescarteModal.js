import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Grid,
  Slide,
  Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { Formik } from 'formik';
import { forwardRef } from 'react';
import DatePickerForm from 'src/components/Form/DatePickerForm';
import InputForm from 'src/components/Form/InputForm';
import * as Yup from 'yup';

const DialogWrapper = styled(Dialog)(
  () => `
        .MuiDialog-paper {
          overflow: visible;
        }
  `
);

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function DescarteModal({
  openConfirmDelete,
  closeConfirmDelete,
  title,
  item = null,
  handleDeleteCompleted,
  children = null
}) {
  return (
    <DialogWrapper
      open={openConfirmDelete}
      TransitionComponent={Transition}
      onClose={closeConfirmDelete}
      maxWidth="sm"
    >
      {item !== null && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          p={3}
        >
          <Typography width="100%" align="left" variant="h3">
            {title}
          </Typography>

          <Typography
            width="100%"
            align="left"
            sx={{
              pt: 1,
              pb: 1
              // px: 6
            }}
            fontWeight="normal"
            color="text.secondary"
          >
            {`¿Seguro que desea descartar la cerda `}
            <b>{`${item?.codigo || ''}?`}</b>
          </Typography>
          <Typography
            width="100%"
            align="left"
            sx={{
              pb: 1
              // px: 6
            }}
            fontWeight="normal"
            color="text.secondary"
          >
            {children}
          </Typography>

          <Formik
            enableReinitialize
            initialValues={{
              fechaDescarte: '',
              motivo: ''
            }}
            validationSchema={Yup.object().shape({
              fechaDescarte: Yup.string().required('La fecha es requerida'),
              motivo: Yup.string().required('El motivo es requerido')
            })}
            onSubmit={async (values) => {
              const request = {
                ...values,
                id: item.id
              };
              handleDeleteCompleted(request);
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
              setFieldValue
            }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container justifyContent="center" spacing={3}>
                  <Grid item xs={12} sm={12} md={10}>
                    <InputForm
                      inputName="motivo"
                      value={values.motivo}
                      label="Motivo"
                      placeholder='Breve información de descarte'
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      multiline
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={10}>
                    <DatePickerForm
                      inputName="fechaDescarte"
                      value={values.fechaDescarte}
                      label="Fecha de Descarte"
                      disableFuture
                      setFieldValue={setFieldValue} 
                      errors={errors}
                      touched={touched}
                    />
                  </Grid>
                </Grid>

                <Grid
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    pt: 2
                  }}
                  container
                  margin="auto"
                  item
                  xs={12}
                >
                  <Grid item>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        mx: 1,
                        color: 'red',
                        borderColor: 'red'
                      }}
                      onClick={closeConfirmDelete}
                    >
                      Cancelar
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color="primary"
                      variant="outlined"
                      type="submit"
                      startIcon={
                        isSubmitting ? <CircularProgress size="1rem" /> : null
                      }
                      disabled={Boolean(errors.submit) || isSubmitting}
                      size="small"
                      sx={{
                        ml: 1,
                        px: 2
                      }}
                    >
                      Confirmar
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      )}
    </DialogWrapper>
  );
}

export default DescarteModal;
