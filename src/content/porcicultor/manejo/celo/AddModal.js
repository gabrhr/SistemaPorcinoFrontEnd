import { Box, Button, Dialog, Grid, MenuItem, Slide, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { Formik } from "formik";
import { forwardRef, useEffect, useState } from "react";
import SelectForm from "src/components/Form/SelectForm";
import { celoGetLotesPendientesAPI } from "src/utils/apiUrls";
import { formatDate } from "src/utils/dataFormat";
import { resultCodeOk } from "src/utils/defaultValues";
import { errorMessage } from "src/utils/notifications";
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

function AddModal ({
    openConfirmModal, 
    closeConfirmModal,
    title,
    handleCompleted, 
    granjaId
}){

    const [list, setList] = useState(undefined);
    const theme = useTheme();

    // get cerdas
    const getLotesToAdd = async () => {
        const reqObj = {
            granjaId
        };
        try {
        const response = await certifyAxios.post(celoGetLotesPendientesAPI, reqObj);
        if (response.data?.resultCode === resultCodeOk) {
            const updatedList = processList(response.data.list || [])
            setList(updatedList || []);
        }
        } catch (err) {
        console.error(err);
        setList([]);

        errorMessage('No se ha podido obtener los lotes')
        }
    };

    useEffect(() => {
        let isMounted = true;

        if(isMounted){
            getLotesToAdd();
        }
    
        return () => {
        // Cleanup: Cancelar la tarea si el componente se desmonta
        isMounted = false;
        };
        
    }, []);


    const processList = (list) => {
        return list
    }
    return (
        <DialogWrapper
            open={openConfirmModal}
            TransitionComponent={Transition}
            onClose={closeConfirmModal}
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
                {title}
            </Typography>

            {/* Contenido */}
           
            <Formik
            enableReinitialize
            initialValues={{
                loteId: -1
            }}
            validationSchema={Yup.object().shape({
                loteId: Yup.number().min(0, 'Seleccionar una línea').required('La línea es requerida')
            })}
            onSubmit={async (values, {resetForm}) => {      
                const request = {
                    "loteId": values.loteId,
                    "granjaId": granjaId
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
                            <Typography>
                                Seleccione un lote para iniciar el seguimiento del celo
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
                            md={10}
                        >
                            <SelectForm
                            label="Lote"
                            name="loteId"
                            value={values.loteId}
                            onChange={handleChange}
                            errors={errors}
                            onBlur={handleBlur}
                            touched={touched}
                            disabled={list === undefined}
                            number
                            >
                                {list && list.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {`${type.codigo} - Apertura: ${formatDate(type.fechaApertura)}`}
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
        
      </DialogWrapper>
    )
}

export default AddModal;