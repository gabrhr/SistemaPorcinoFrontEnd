import { Box, Button, Dialog, Grid, MenuItem, Slide, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
import DatePickerForm from "src/components/Form/DatePickerForm";
import SelectForm from "src/components/Form/SelectForm";
import { listTiposVacunaReemp } from "src/utils/defaultValues";
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

const list = listTiposVacunaReemp()

function AddControlModal ({
    open, 
    modalClose,
    handleAction, 
    cerdaId
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
            <Typography
            width="100%"
                align="left"
                variant="h3"
                mb={3}
            >
                Agregar Control
            </Typography>

            {/* Contenido */}
           
            <Formik
            initialValues={{
                fechaAplicacion: new Date(),
                vacunaTipo: "none"
            }}
            validationSchema={Yup.object().shape({
                fechaAplicacion: Yup.string().required('La fecha de aplicación es requerida'),
                vacunaTipo: Yup.string().matches(/^(?!none\b)/i, 'Seleccionar un estado').required('El estado es obligatorio')
            })}
            onSubmit={async (values, {resetForm}) => {      
                const request = {
                    fechaAplicacion: values.fechaAplicacion,
                    vacunaTipo: values.vacunaTipo,
                    id: cerdaId,
                    forCerda: true
                }                
                await handleAction(request, resetForm)
            }}
          >
            {({ errors, touched, handleBlur, handleChange, values, handleSubmit, isSubmitting, dirty, isValid, setFieldValue }) => (
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
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                            <DatePickerForm
                                inputName="fechaAplicacion"
                                value={values.fechaAplicacion}
                                label="Fecha de Aplicación"
                                disableFuture
                                setFieldValue={setFieldValue} 
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                            />

                        </Grid>
                        <Grid
                            sx={{
                                my: `${theme.spacing(2)} `,
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                        <SelectForm
                            label="Tipo de Vacuna"
                            name="vacunaTipo"
                            value={values.vacunaTipo}
                            onChange={handleChange}
                            errors={errors}
                            onBlur={handleBlur}
                            touched={touched}
                            >
                                {list && list.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {`${type.text}`}
                                </MenuItem>
                                ))}
                            </SelectForm>
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

export default AddControlModal;