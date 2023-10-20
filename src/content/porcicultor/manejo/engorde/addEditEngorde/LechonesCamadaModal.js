import {
  Box,
  Dialog,
  Divider,
  Grid,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { forwardRef, useEffect, useState } from 'react';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import { lechonesCamadaIdAPI } from 'src/utils/apiUrls';
import { formatDate } from 'src/utils/dataFormat';
import { lechonEstado } from 'src/utils/defaultValues';
import { errorMessage } from 'src/utils/notifications';
import certifyAxios from 'src/utils/spAxios';

const DialogWrapper = styled(Dialog)(
  () => `
        .MuiDialog-paper {
          overflow: visible
        }
  `
);

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function LechonesCamadaModal({
  open,
  modalClose,
  camada
}) {
  const [list, setList] = useState(undefined);

  // get cerdas
  const getLechonesByCamadaId = async () => {
    const reqObj = {
      id: camada.id
    };
    try {
      const response = await certifyAxios.post(lechonesCamadaIdAPI, reqObj);
      if (response?.status === 200) {
        setList(response.data || []);
      }
    } catch (err) {
      console.error(err);
      setList([]);

      errorMessage('No se ha podido obtener los lechones')
    }
  };

  useEffect(() => {
    let isMounted = true;

    if(isMounted){
      if(camada){
        getLechonesByCamadaId();
      }
    }
  
    return () => {
      // Cleanup: Cancelar la tarea si el componente se desmonta
      isMounted = false;
    };
    
  }, []);
  

  return (
    <DialogWrapper
      open={open}
      TransitionComponent={Transition}
      onClose={modalClose}
      scroll="body"
      maxWidth="md"
      sx={{ minHeight: '100vh' }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        p={3}
      >
        {/* Titulo */}
        <Typography width="100%" align="left" variant="h3" marginBottom={3}>
          Lechones de Camada {camada?.codigo || ""}
        </Typography>
        {/* Table */}
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12} md={12}>
            <Box
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mr={2}
            >
              <Box>
                <Typography component="span" variant="subtitle1">
                  Fecha de Nacimiento:
                </Typography>{' '}
                <b>{camada?.fechaNacimiento && formatDate(camada?.fechaNacimiento)|| "-"}</b>
                <br/>
                <Typography component="span" variant="subtitle1">
                  Total de lechones:
                </Typography>{' '}
                <b>{list?.length || 0}</b>
              </Box>
            </Box>
            <Divider />
            <TableContainer sx={{height: (list?.length === 0)? "10vh": "50vh", overflowY:"auto"}}>
              <Table sx={{height:"max-content"}}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Código Lechón</TableCell>
                    <TableCell align="center">
                      Peso Nacimiento (kg)
                    </TableCell>
                    <TableCell align="center">
                      Peso destete (kg)
                    </TableCell>
                    <TableCell align="center">Peso Precebo Promedio (kg)</TableCell>
                    <TableCell align="center">Peso Cebo Promedio (kg)</TableCell>
                    <TableCell align="center">
                      Estado de Vida
                    </TableCell>
                    {/* <TableCell align="center">Acciones</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list === undefined && (
                    <TableRowsLoader
                      rowsNum={5}
                      cellsNum={6}
                    />
                  )}
                  {list !== undefined &&
                    list?.length !== 0 &&
                    list.map((element, idx) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell align="center">
                            {element?.codigo ?? '0'}
                          </TableCell>
                          <TableCell align="center">
                            {element?.pesoNacimiento ?? '0'}
                          </TableCell>
                          <TableCell align="center">
                            {element?.pesoDestete ?? '-'}
                          </TableCell>
                          <TableCell align="center">
                            {element?.pesoPrecebo ?? '-'}
                          </TableCell>
                          <TableCell align="center">
                            {element?.pesoCebo ?? '-'}
                          </TableCell>
                          <TableCell align="center">
                            {element.estado === lechonEstado.muerto
                              ? 'Muerto'
                              : 'Vivo'}
                          </TableCell>
                          {/* <TableCell align="center">
                            {!(element.estado === 'Muerto') && 
                                <Tooltip title="Descartar lechón">
                                  <IconButton
                                    sx={{ borderRadius: 30 }}
                                    onClick={() => {
                                      openDescartarModal(element);
                                    }}
                                  >
                                    <HighlightOffRoundedIcon />
                                  </IconButton>
                              </Tooltip>
                              }
                          </TableCell> */}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            {list !== undefined && list?.length === 0 && (
              <>
                <Typography
                  sx={{
                    py: 2
                  }}
                  variant="h3"
                  fontWeight="normal"
                  color="text.secondary"
                  align="center"
                >
                  No se encontraron lechones disponibles
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </DialogWrapper>
  );
}

export default LechonesCamadaModal;
