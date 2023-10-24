import DonutSmallTwoToneIcon from '@mui/icons-material/DonutSmallTwoTone';
import SavingsTwoToneIcon from '@mui/icons-material/SavingsTwoTone';
import { Box, Card, Dialog, Divider, Grid, Slide, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { forwardRef } from "react";
import { formatDate } from 'src/utils/dataFormat';
import Text from '../Text';
import TableroMaternidad from './TableroMaternidad';

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

function TableroMaternidadModal ({
    open, 
    modalClose,
    item = null,
    indicadores = null,
}){

    const getPorcentaje = () => {
        if(item){
    
          const paridas = item?.totalParidas?? 0
          const total = item?.totalCerdas?? 1
    
          const porcentaje = (paridas / total) * 100;
          return porcentaje.toFixed(1);
    
        }
    
        return 0;
      };

    const getProcentajeMortalidad = () => {
        if(indicadores){
            const muertos = indicadores?.lechonesMuertosLactProm?? 0
      
            const porcentaje = (muertos) * 100;
            return porcentaje.toFixed(1);
          }
      
          return 0;
    }

    return (
        <DialogWrapper
            open={open}
            TransitionComponent={Transition}
            onClose={modalClose}
            maxWidth="sm"
            scroll='body'
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
                Resultados Reproductivos
            </Typography>
            {/* Contenido */}

            <Grid container spacing={1} mt={1} >
                <Grid item xs={12} sm={12} md={12}>
                    <Card elevation={0} sx={{background: "#caefff3d"}}>
                    <Stack
                        direction="row"
                        justifyContent="space-evenly"
                        alignItems="stretch"
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={0}
                    >
                        <Box py={2} px={2} display="flex" alignItems="flex-start">
                        <Text color="primary">
                            <SavingsTwoToneIcon fontSize="large" />
                        </Text>
                        <Box ml={1}>
                            <Typography variant="h3">{item?.totalCerdas?? 0}</Typography>
                            <Typography noWrap variant="subtitle2">
                            cerdas
                            </Typography>
                        </Box>
                        </Box>
                        <Box py={2} px={2} display="flex" alignItems="flex-start">
                        <Text color="primary">
                            <SavingsTwoToneIcon fontSize="large" />
                        </Text>
                        <Box ml={1}>
                            <Typography variant="h3">{indicadores?.totalLechonesVivos?? 0}</Typography>
                            <Typography noWrap variant="subtitle2">
                            lechones vivos
                            </Typography>
                        </Box>
                        </Box>
                        <Box py={2} px={2} display="flex" alignItems="flex-start">
                        <Text color="success">
                            <DonutSmallTwoToneIcon fontSize="large" />
                        </Text>
                        <Box ml={1}>
                            <Typography variant="h3">{getPorcentaje()} %</Typography>
                            <Typography noWrap variant="subtitle2">
                            tasa de parición
                            </Typography>
                        </Box>
                        </Box>
                    </Stack>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Typography noWrap gutterBottom mt={2} color="primary">
                    <b>Estado de Cerdas</b>
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <TableroMaternidad
                        item={item}
                        showPorc ={false} 
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Typography noWrap gutterBottom mt={2} color="primary">
                    <b>Parámetros del Lote de servicio</b>
                    </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} md={12} spacing={1} mt={1}>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Promedio orden de parto:  
                        <b>{` ${item?.promOrdenParto?? 0}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Fecha promedio de servicio:  
                        <b>{` ${item?.fechaPromServicio && formatDate(item?.fechaPromServicio) || "-"}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Fecha promedio de parto:  
                        <b>{` ${item?.fechaPromParto && formatDate(item?.fechaPromParto) || "-"}`}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Typography gutterBottom mt={2} color="primary">
                    <b>Parámetros del Lote en Maternidad</b>
                    </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} md={12} spacing={1} mt={1}>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography  gutterBottom>
                        Total de Partos:  
                        <b>{` ${item?.totalParidas?? 0}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography  gutterBottom>
                        Promedio lechones nacidos vivos:  
                        <b>{` ${indicadores?.lechonesNVProm?? 0}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Peso promedio de lechones nacidos vivos:  
                        <b>{` ${indicadores?.pesoNVProm?? 0} kg`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Promedio lechones nacidos muertos:  
                        <b>{` ${indicadores?.lechonesNMProm?? 0}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Porcentaje Mortalidad Pre destete:  
                        <b>{` ${getProcentajeMortalidad()}%`}</b>
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} mt={2}>
                        <Typography gutterBottom>
                        Días promedio de lactancia:  
                        <b>{` ${indicadores?.diasLactPromedio?? 0} días`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Promedio lechones destetados:  
                        <b>{` ${indicadores?.lechonesDestetadosProm?? 0}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography gutterBottom>
                        Peso promedio de lechones destetados:  
                        <b>{` ${indicadores?.pesoDesteteProm?? 0} kg`}</b>
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>

        </Box>
      </DialogWrapper>
    )
}

export default TableroMaternidadModal;