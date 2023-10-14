import { Box, Button, Checkbox, Dialog, FormControlLabel, Grid, Slide, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
import DatePickerForm from "src/components/Form/DatePickerForm";
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

function TerminarEtapaModal ({
    open, 
    modalClose,
    handleAction, 
    engordeId,
    precebo = false
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
               {precebo?"Terminar Precebo": "Terminar Cebo"}
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
                
                {`¿Está seguro que desea finalizar el periodo ${precebo? 'precebo': 'cebo'}?`}
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
                Esta acción es irreversible.
            </Typography>
            {/* Contenido */}
           
            <Formik
            initialValues={{
                fechaFin: "",
                finalizarProceso: false
            }}
            validationSchema={Yup.object().shape({
                fechaFin: Yup.string().required('La fecha es requerida')
            })}
            onSubmit={async (values) => {      
                const request = {
                    id: engordeId,
                    fechaFin: values.fechaFin,
                }                
                if(precebo){
                    request.finalizarProceso = values.finalizarProceso? 1: 0
                }
                await handleAction(request, precebo)
            }}
          >
            {({ errors, touched, handleBlur, values, handleSubmit, isSubmitting, dirty, isValid,setFieldValue, handleChange}) => (
              <form noValidate onSubmit={handleSubmit} style={{width:"100%"}}>
                    <Grid
                        container
                        spacing={2}
                        mt={2}
                        mb={3}
                        direction="column"
                        alignContent="stretch"
                    >
                        {/* fecha */}
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                            <DatePickerForm
                                inputName="fechaFin"
                                value={values.fechaFin}
                                label={precebo?"Fecha fin de precebo": "Fecha fin de cebo"}
                                setFieldValue={setFieldValue}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                              />
                        </Grid>
                        {precebo && <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                    checked={values.finalizarProceso}
                                    name="finalizarProceso"
                                    onChange={handleChange}
    
                                />
                                }
                                label="Continuar con el proceso de Cebo para venta de 
                                cerdos de aproximadamente 100 kg o según el mercado."
                            />
                        </Grid>}
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

export default TerminarEtapaModal;