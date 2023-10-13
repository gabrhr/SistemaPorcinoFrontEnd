import { Box, Button, Dialog, FormControl, FormControlLabel, FormHelperText, Grid, Radio, RadioGroup, Slide, Typography, useTheme } from "@mui/material";
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

function AddDeteccionModal ({
    open, 
    modalClose,
    handleAction, 
    loteCerdaCeloId
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
                Agregar Detección
            </Typography>

            {/* Contenido */}
           
            <Formik
            initialValues={{
                peso: 0,
                fechaDeteccion: new Date(),
                resultadoCelo: -1
            }}
            validationSchema={Yup.object().shape({
                fechaDeteccion: Yup.string().required('La fecha de detección es requerida'),
                peso: Yup.number().min(0, 'Debe ser mayor a 0').required('El peso es requerido'),
                resultadoCelo: Yup.number().required('El resultado es requerido')
            })}
            onSubmit={async (values, {resetForm}) => {      
                const request = {
                    fechaDeteccion: values.fechaDeteccion,
                    peso: values.peso,
                    resultadoCelo: values.resultadoCelo,
                    loteCerdaCeloId
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
                        {/* Fecha */}
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
                                inputName="fechaDeteccion"
                                value={values.fechaDeteccion}
                                label="Fecha de Detección"
                                disableFuture
                                setFieldValue={setFieldValue} 
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                            />

                        </Grid>
                        {/* Resultado */}
                        <Grid
                            sx={{
                                my: `${theme.spacing(2)}`,
                                mr:`${theme.spacing(1)}`,
                                paddingRight: 3
                            }}
                            item
                            className="center-form"
                            xs={12}
                            sm={12}
                            md={10}
                        >
                            Presencia de Celo:
                            <FormControl sx={{marginLeft:3}}>
                                <RadioGroup
                                    value={values.resultadoCelo}
                                    name="resultadoCelo"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    row
                                >
                                    <FormControlLabel value={1} control={<Radio />} label="Sí" />
                                    <FormControlLabel value={0} control={<Radio />} label="No" />
                                </RadioGroup>
                                <FormHelperText error>{touched.resultadoCelo && errors.resultadoCelo}</FormHelperText>
                            </FormControl>
                        </Grid>
                        {/* Peso */}
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
                                inputName="peso"
                                value={values.peso}
                                label="Peso (kg)"
                                placeholder="Peso en kg"
                                handleChange={handleChange}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                type='number'
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

export default AddDeteccionModal;