import DonutSmallTwoToneIcon from '@mui/icons-material/DonutSmallTwoTone';
import SavingsTwoToneIcon from '@mui/icons-material/SavingsTwoTone';
import { Box, Card, Dialog, Divider, Grid, Slide, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { forwardRef } from "react";
import { formatDate } from 'src/utils/dataFormat';
import Text from '../Text';
import TableroServicio from './TableroServicio';

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

function TableroServicioModal ({
    open, 
    modalClose,
    item = null
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
                Resultados Reproductivos
            </Typography>
            {/* Contenido */}

            <Grid container xs={12} sm={12} md={12} spacing={1} mt={1}>
                <Grid item xs={12} sm={12} md={12}>
                    <Card elevation={0} sx={{background: "#caefff3d"}}>
                    <Stack
                        direction="row"
                        justifyContent="space-evenly"
                        alignItems="stretch"
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={0}
                    >
                        <Box py={4} px={2} display="flex" alignItems="flex-start">
                        <Text color="primary">
                            <SavingsTwoToneIcon fontSize="large" />
                        </Text>
                        <Box ml={1}>
                            <Typography variant="h3">{item?.totalCerdas?? 0}</Typography>
                            <Typography noWrap variant="subtitle2">
                            total de cerdas
                            </Typography>
                        </Box>
                        </Box>
                        <Box py={4} px={2} display="flex" alignItems="flex-start">
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
                    <TableroServicio
                        item={item}
                        showPorc ={false} 
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <Typography noWrap gutterBottom mt={2} color="primary">
                    <b>Parámetros del Lote de Servicio</b>
                    </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} md={12} spacing={1} mt={1}>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography noWrap gutterBottom>
                        Promedio orden de parto:  
                        <b>{` ${item?.promOrdenParto?? 0}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography noWrap gutterBottom>
                        Fecha promedio de servicio:  
                        <b>{` ${item?.fechaPromServicio && formatDate(item?.fechaPromServicio) || "-"}`}</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography noWrap gutterBottom>
                        Fecha promedio de parto:  
                        <b>{` ${item?.fechaPromParto && formatDate(item?.fechaPromParto) || "-"}`}</b>
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>

        </Box>
      </DialogWrapper>
    )
}

export default TableroServicioModal;