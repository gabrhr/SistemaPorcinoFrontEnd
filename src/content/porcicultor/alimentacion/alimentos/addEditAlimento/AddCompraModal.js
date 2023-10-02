import { Box, Button, Dialog, Grid, Slide, Typography, useTheme } from "@mui/material";
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

function AddCompraModal ({
    open, 
    modalClose,
    handleAction, 
    alimentoId
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
                Agregar Compra
            </Typography>

            {/* Contenido */}
           
            <Formik
            initialValues={{
                cantidad: 0,
                fechaCompra: new Date(),
                precioUnitario: 0
            }}
            validationSchema={Yup.object().shape({
                fechaCompra: Yup.string().required('La fecha de compra es requerida'),
                cantidad: Yup.number().min(0, 'Debe ser mayor a 0').required('La cantidad es requerida'),
                precioUnitario: Yup.number().min(0, 'Debe ser mayor a 0').required('El precio unitario es requerida')
            })}
            onSubmit={async (values, {resetForm, setSubmitting}) => {      
                setSubmitting(true)
                const request = {
                    fechaCompra: values.fechaCompra,
                    cantidad: values.cantidad,
                    precioUnitario: values.precioUnitario,
                    alimentoId
                }                
                await handleAction(request, resetForm)
                setSubmitting(false)   
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
                                mr:`${theme.spacing(1)}`,
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={10}
                        >
                            <DatePickerForm
                                inputName="fechaCompra"
                                value={values.fechaCompra}
                                label="Fecha de Compra"
                                disableFuture
                                setFieldValue={setFieldValue} 
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                            />

                        </Grid>
                        <Grid
                            sx={{
                                my: `${theme.spacing(2)}`,
                                mr:`${theme.spacing(1)}`,
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={10}
                        >
                            <InputForm
                                inputName="cantidad"
                                value={values.cantidad}
                                label="Cantidad (kg)"
                                placeholder="Cantidad en kg"
                                handleChange={handleChange}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                type='number'
                                inputProps={{ min: '0' }}
                                />
                        </Grid>
                        <Grid
                            sx={{
                                my: `${theme.spacing(2)}`,
                                mr:`${theme.spacing(1)}`,
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={10}
                        >
                            <InputForm
                                inputName="precioUnitario"
                                value={values.precioUnitario}
                                label="Precio Unitario (S/.)"
                                placeholder="Precio unitario"
                                handleChange={handleChange}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                type='number'
                                inputProps={{ min: '0' }}
                                />
                        </Grid>
                        <Grid
                            sx={{
                                my: `${theme.spacing(2)}`,
                                mr:`${theme.spacing(1)}`,
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={10}
                        >
            <Typography >
                Precio total de compra:
                <b>{` S/. ${values.cantidad*values.precioUnitario}`}</b>
            </Typography>
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

export default AddCompraModal;