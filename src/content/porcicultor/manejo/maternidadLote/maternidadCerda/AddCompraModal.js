import { Box, Button, Dialog, Grid, MenuItem, Slide, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
import InputForm from "src/components/Form/InputForm";
import SelectForm from "src/components/Form/SelectForm";
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

function AddCompraModal ({
    open, 
    modalClose,
    handleAction, 
    maternidadId
}){
    const theme = useTheme();
    return (
      <DialogWrapper
        open={open}
        TransitionComponent={Transition}
        onClose={modalClose}
        maxWidth="sm"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          p={3}
        >
          {/* Titulo */}
          <Typography width="100%" align="left" variant="h3" mb={3}>
            Agregar Lechón
          </Typography>

          {/* Contenido */}

          <Formik
            initialValues={{
              sexo: 'none',
              pesoNacimiento: 0
            }}
            validationSchema={Yup.object().shape({
              sexo: Yup.string()
                .matches(/^(?!none\b)/i, 'Seleccionar un sexo')
                .required('El género es obligatorio'),
                pesoNacimiento: Yup.number()
                .min(0, 'Debe ser mayor a 0')
                .required('El peso es requerida')
            })}
            onSubmit={async (values, { resetForm }) => {
              const request = {
                sexo: values.sexo,
                pesoNacimiento: values.pesoNacimiento,
                id: maternidadId
              };
              await handleAction(request, resetForm);
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
              dirty,
              isValid
            }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  paddingLeft={2}
                  alignContent="stretch"
                >
                  {/* Nombre */}
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
                    <SelectForm
                      key="sexo"
                      label="Sexo"
                      name="sexo"
                      value={values.sexo}
                      onChange={handleChange}
                      errors={errors}
                      touched={touched}
                    >
                      {["Macho", "Hembra"].map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </SelectForm>
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
                    <InputForm
                      inputName="pesoNacimiento"
                      value={values.pesoNacimiento}
                      label="Peso nacimiento (kg)"
                      placeholder="Peso en kg"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      type="number"
                      inputProps={{ min: '0' }}
                    />
                  </Grid>
                </Grid>

                {/* Botones */}
                <Grid
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    pt: 2
                  }}
                  container
                  margin="auto"
                  item
                  xs={12}
                >
                  <Grid item>
                    <Button
                      color="error"
                      size="small"
                      variant="outlined"
                      onClick={modalClose}
                    >
                      Cancelar
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color="primary"
                      variant="outlined"
                      type="submit"
                      size="small"
                      sx={{
                        ml: 1,
                        px: 2
                      }}
                      disabled={!isValid || !dirty || isSubmitting}
                    >
                      Guardar Cambios
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </DialogWrapper>
    );
}

export default AddCompraModal;