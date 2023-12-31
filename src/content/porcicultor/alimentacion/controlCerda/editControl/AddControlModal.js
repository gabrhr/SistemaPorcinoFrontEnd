import { Box, Button, Dialog, Grid, MenuItem, Slide, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { enqueueSnackbar } from "notistack";
import { forwardRef, useEffect, useState } from "react";
import DatePickerForm from "src/components/Form/DatePickerForm";
import InputForm from "src/components/Form/InputForm";
import SelectForm from "src/components/Form/SelectForm";
import { alimentoQueryAllAPI } from "src/utils/apiUrls";
import { resultCodeOk } from "src/utils/defaultValues";
import certifyAxios from "src/utils/spAxios";
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

function AddControlModal ({
    open, 
    modalClose,
    handleAction, 
    cerdaId,
    granjaId
}){
    
    const [list, setList] = useState(undefined);

    // get cerdas
    const getAlimentos = async () => {
    const reqObj = {
      categoria: "cerda",
      granjaId
    };
    try {
      const response = await certifyAxios.post(alimentoQueryAllAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        setList(response.data.list || []);
      }
    } catch (err) {
      console.error(err);
      setList([]);

      enqueueSnackbar('No se ha podido obtener los alimentos.', {
        variant: 'error'
      });
    }
  };


    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
          getAlimentos();
        }

        return () => {
          // Cleanup: Cancelar la tarea si el componente se desmonta
          isMounted = false;
        };
        
      }, []);

    const theme = useTheme();

    const getTextoAlimento = (id) => {
       if(id !== -1){
           const alimentoIndex = list.findIndex(e => e.id === id)
        if(alimentoIndex !== -1){
            const alimento = list[alimentoIndex]
            return [alimento?.cantidadActual || "-", alimento?.consumoRecomendado || "-"]
        }
       }

       return ["-", "-"]
    };
    

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
                cantidadConsumida: 0,
                fechaConsumo: new Date(),
                alimentoId: -1
            }}
            validationSchema={Yup.object().shape({
                fechaConsumo: Yup.string().required('La fecha de compra es requerida'),
                cantidadConsumida: Yup.number().min(0, 'Debe ser mayor a 0').required('La cantidad es requerida'),
                alimentoId: Yup.number().min(0, 'Seleccione el alimento').required('Seleccione el alimento')
            })}
            onSubmit={async (values, {resetForm, setSubmitting}) => {      
                setSubmitting(true)
                const alimentoIndex = list.findIndex(e => e.id === values.alimentoId)
                if(alimentoIndex !== -1){
                    const alimento = list[alimentoIndex]
                    if(alimento.cantidadActual < values.cantidadConsumida){
                        enqueueSnackbar("La cantidad consumida no debe exceder el stock.", {
                            variant: 'error'
                          })
                        setSubmitting(false)   
                        return;
                    }
                }

                const request = {
                    fechaConsumo: values.fechaConsumo,
                    cantidadConsumida: values.cantidadConsumida,
                    alimentoId: values.alimentoId,
                    id: cerdaId
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
                            md={12}
                        >
                            <DatePickerForm
                                inputName="fechaConsumo"
                                value={values.fechaConsumo}
                                label="Fecha de Consumo"
                                disableFuture
                                setFieldValue={setFieldValue} 
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                            />

                        </Grid>
                        <Grid
                            sx={{
                                mt: `${theme.spacing(2)}`,
                                mb: 0,
                                mr:`${theme.spacing(1)}`,
                                paddingRight: 3
                            }}
                            item
                            xs={12}
                            sm={12}
                            md={12}
                        >
                        <SelectForm
                            label="Alimento"
                            name="alimentoId"
                            value={values.alimentoId}
                            onChange={handleChange}
                            errors={errors}
                            onBlur={handleBlur}
                            touched={touched}
                            disabled={list === undefined}
                            number
                            >
                                {list && list.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {`${type.nombre}`}
                                </MenuItem>
                                ))}
                            </SelectForm>
                        </Grid>
                        <Grid item
                            xs={12}
                            sm={12}
                            md={12}
                            mt={0}
                        >
                            <Typography >
                                Consumo recomendado:
                                <b>{` ${getTextoAlimento(values.alimentoId)[0]} kg`}</b>
                            </Typography>
                            <Typography >
                                Cantidad disponible:
                                <b>{` ${getTextoAlimento(values.alimentoId)[1]} kg`}</b>
                            </Typography>
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
                            md={12}
                        >
                            <InputForm
                                inputName="cantidadConsumida"
                                value={values.cantidadConsumida}
                                label="Cantidad (kg)"
                                placeholder="Cantidad en kg"
                                handleChange={handleChange}
                                errors={errors}
                                touched={touched}
                                handleBlur={handleBlur}
                                disabled={values.alimentoId === -1}
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

export default AddControlModal;