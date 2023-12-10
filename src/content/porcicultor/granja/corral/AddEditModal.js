import { Box, Button, CircularProgress, Dialog, Grid, MenuItem, Slide, TextField, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
import SelectForm from "src/components/Form/SelectForm";
import { listTipoCorral } from "src/utils/defaultValues";
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

const tipos = listTipoCorral()

function AddEditModal ({
    openConfirmModal, 
    closeConfirmModal,
    title,
    item,
    editMode = false,
    handleCompleted, 
    granjaId
}){
    const theme = useTheme();


    return (
        <DialogWrapper
            open={openConfirmModal}
            TransitionComponent={Transition}
            onClose={closeConfirmModal}
            maxWidth="sm"
        >
        { item !== undefined && 
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
                {title}
            </Typography>

            {/* Contenido */}
           
            <Formik
            enableReinitialize

            initialValues={{
              nombre: editMode && (item && item.numCorral) || "",
              capacidad: editMode && (item && item.capacidad) || 0,
              tipo: editMode && (item && item.tipo) || "none",
            }}
            validationSchema={Yup.object().shape({
                nombre: Yup.string().required('El nombre es requerido'),
                capacidad: Yup.number().required('La capacidad es requerida'),
                tipo: Yup.string().matches(/^(?!none\b)/i, 'Seleccionar un tipo').required('El tipo es obligatorio'),
            })}
            onSubmit={async (values, {resetForm}) => {         
                const request = {
                    
                    "numCorral": values.nombre,
                    "capacidad": values.capacidad,
                    "tipo": values.tipo,
                    "granjaId": granjaId
                }                
                if(item != null){
                    request.id = item.id
                }
                await handleCompleted(request, resetForm)
                
            }}
          >
            {({ errors, touched, handleBlur, handleChange, values, handleSubmit, isValid, dirty, isSubmitting }) => (
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
                            <TextField
                                error={Boolean(touched.nombre && errors.nombre)}
                                fullWidth
                                size='small'
                                helperText={touched.nombre && errors.nombre}
                                name="nombre"
                                placeholder="Número de corral"
                                label="Número de corral"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                variant="outlined"
                                value={values.nombre}
                                type="number"
                                inputProps={{min: '0'}}
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
                            <SelectForm
                            label="Tipo"
                            name="tipo"
                            value={values.tipo}
                            onChange={handleChange}
                            errors={errors}
                            onBlur={handleBlur}
                            touched={touched}
                            >
                                {tipos.map((type, index) => (
                                <MenuItem key={index} value={type.value}>
                                    {type.text}
                                </MenuItem>
                                ))}
                            </SelectForm>
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
                            <TextField
                                error={Boolean(touched.capacidad && errors.capacidad)}
                                fullWidth
                                size='small'
                                helperText={touched.capacidad && errors.capacidad}
                                name="capacidad"
                                placeholder="Capacidad máxima"
                                label="Capacidad máxima"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                variant="outlined"
                                value={values.capacidad}
                                type="number"
                                inputProps={{min: '0'}}
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
                            onClick={() => {closeConfirmModal()}}
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
                            startIcon={
                                isSubmitting ? <CircularProgress size="1rem"  color='white'/> : null
                              }
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
        }
      </DialogWrapper>
    )
}

export default AddEditModal;