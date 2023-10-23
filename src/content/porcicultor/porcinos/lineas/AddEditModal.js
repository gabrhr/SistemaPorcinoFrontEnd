import { Box, Button, CircularProgress, Dialog, Grid, Slide, TextField, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
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
              nombre: editMode && (item && item.nombre) || ""
            }}
            validationSchema={Yup.object().shape({
                nombre: Yup.string().required('El nombre es requerido')
            })}
            onSubmit={async (values, {resetForm}) => {         
                const request = {
                    
                    "nombre": values.nombre,
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
                                placeholder="Nombre"
                                label="Nombre"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                variant="outlined"
                                value={values.nombre}
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