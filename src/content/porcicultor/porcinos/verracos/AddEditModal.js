import { Box, Button, Dialog, Grid, MenuItem, Slide, TextField, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef } from "react";
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

function AddEditModal ({
    openConfirmModal, 
    closeConfirmModal,
    title,
    item,
    editMode,
    handleCompleted, 
    granjaId,
    lineas = []
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
                codigo: (editMode && item && item.codigo) || "",
                lineaGeneticaId: (editMode && item && item.lineaGeneticaId) || -1
            }}
            validationSchema={Yup.object().shape({
                codigo: Yup.string().required('El codigo es requerido'),
                lineaGeneticaId: Yup.number().min(0, 'Seleccionar una línea').required('La línea es requerida')
            })}
            onSubmit={async (values, {resetForm}) => {      
                const request = {
                    "codigo": values.codigo,
                    "lineaGeneticaId": values.lineaGeneticaId,
                    "granjaId": granjaId
                }                
                if(editMode){
                    request.id = item.id
                }
                await handleCompleted(request, resetForm)
            }}
          >
            {({ errors, touched, handleBlur, handleChange, values, handleSubmit, isSubmitting, dirty, isValid }) => (
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
                                error={Boolean(touched.codigo && errors.codigo)}
                                fullWidth
                                size='small'
                                helperText={touched.codigo && errors.codigo}
                                name="codigo"
                                placeholder="Ejemplo: VER001"
                                label="Código"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                variant="outlined"
                                value={values.codigo}
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
                            label="Linea genética"
                            name="lineaGeneticaId"
                            value={values.lineaGeneticaId}
                            onChange={handleChange}
                            errors={errors}
                            onBlur={handleBlur}
                            touched={touched}
                            number
                            >
                                {lineas.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.nombre}
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
                            onClick={closeConfirmModal}
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
        }
      </DialogWrapper>
    )
}

export default AddEditModal;