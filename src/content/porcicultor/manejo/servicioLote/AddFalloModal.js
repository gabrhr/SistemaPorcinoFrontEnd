import { Box, Button, Dialog, Grid, MenuItem, Slide, Typography } from "@mui/material";
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

function AddFalloModal ({
    open, 
    modalClose,
    handleAction, 
    texto,
    loteCerdaServicioId
}){
    return (
        <DialogWrapper
            open={open}
            TransitionComponent={Transition}
            onClose={modalClose}
            maxWidth="md"
        >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          p={3}
        >
            {/* Titulo */}
            <Typography
            width="100%"
                align="left"
                variant="h3"
                mb={3}
            >
                Registrar falo en el servicio
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
                {texto}
            </Typography>
            {/* Contenido */}
           
            <Formik
            initialValues={{
                descripcionFallo: "",
                motivoFallo: "none"
            }}
            validationSchema={Yup.object().shape({
                descripcionFallo: Yup.string().required('La descripción es requerida'),
                motivoFallo: Yup.string().matches(/^(?!none\b)/i, 'Seleccionar un motivo').required('El motivo es obligatorio'),
            })}
            onSubmit={async (values, {resetForm, setSubmitting}) => {      
                setSubmitting(true)
                const request = {
                    loteCerdaServicioId,
                    motivoFallo: values.motivoFallo,
                    descripcionFallo: values.descripcionFallo
                }                
                await handleAction(request, resetForm)
                setSubmitting(false)   
            }}
          >
            {({ errors, touched, handleBlur, handleChange, values, handleSubmit, isSubmitting, dirty, isValid }) => (
              <form noValidate onSubmit={handleSubmit} style={{width:"100%"}}>
                    <Grid
                        container
                        spacing={2}
                        mt={2}
                        direction="column"
                        alignContent="stretch"
                    >
                        {/* Motivo */}
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={10}
                        >
                            <SelectForm
                                label="Motivo"
                                name="motivoFallo"
                                value={values.motivoFallo}
                                onChange={handleChange}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                            >
                                    <MenuItem id="aborto" value="Aborto">
                                        Aborto
                                    </MenuItem>
                                    <MenuItem id="sanitario" value="Problema sanitario">
                                        Problema sanitario
                                    </MenuItem>
                                    <MenuItem id="fractura" value="Fractura">
                                        Fractura
                                    </MenuItem>
                            </SelectForm>

                        </Grid>
                        {/* Descripcion */}
                        <Grid
                            item
                            className="center-form"
                            xs={12}
                            sm={12}
                            md={10}
                        >
                           <InputForm
                            inputName="descripcionFallo"
                            value={values.descripcionFallo}
                            label="Descripcion"
                            placeholder='Breve información de fallo reproductivo'
                            handleChange={handleChange}
                            errors={errors}
                            touched={touched}
                            handleBlur={handleBlur}
                            multiline
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
                            disabled={(!isValid || !dirty) || isSubmitting}
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
    )
}

export default AddFalloModal;