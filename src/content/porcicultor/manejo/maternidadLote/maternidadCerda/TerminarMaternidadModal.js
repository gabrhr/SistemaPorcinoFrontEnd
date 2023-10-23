import { Box, Button, Dialog, Grid, Slide, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
import DatePickerForm from "src/components/Form/DatePickerForm";
import InputForm from "src/components/Form/InputForm";
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

function TerminarMaternidadModal ({
    open, 
    modalClose,
    handleAction, 
    maternidadId
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
                Finalizar Maternidad
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
                ¿Está seguro que desea finalizar la maternidad con el destete?
            </Typography>
            <Typography
                width="100%"
                align="left"
                sx={{
                pt: 1,
                pb: 2
                // px: 6
                }}
                fontWeight="normal"
                color="text.secondary"
            >
                Esta acción es irreversible.
            </Typography>
            {/* Contenido */}
           
            <Formik
            initialValues={{
                fechaDestete: "",
                pesoCerda: 0
            }}
            validationSchema={Yup.object().shape({
                fechaDestete: Yup.string().required('La fecha es requerida')
            })}
            onSubmit={async (values, {resetForm}) => {      
                const request = {
                    id: maternidadId,
                    fechaDestete: values.fechaDestete,
                    pesoActualizado: values.pesoCerda
                }                
                await handleAction(request, resetForm)
            }}
          >
            {({ errors, touched, handleBlur, values, handleSubmit, isSubmitting, dirty, isValid,setFieldValue, handleChange}) => (
              <form noValidate onSubmit={handleSubmit} style={{width:"100%"}}>
                    <Grid
                        container
                        spacing={4}
                        direction="column"
                        alignContent="stretch"
                    >
                        {/* Motivo */}
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                            <DatePickerForm
                                inputName="fechaDestete"
                                value={values.fechaDestete}
                                label="Fecha real de destete"
                                setFieldValue={setFieldValue}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                              />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                             <InputForm
                                inputName="pesoCerda"
                                value={values.pesoCerda}
                                label="Peso actualizado de cerda (Opcional)"
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

export default TerminarMaternidadModal;