import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  controlSanitarioDeleteAPI,
  controlSanitarioRegisterAPI,
  sanitarioServicioFindByIdAPI
} from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Alert,
  Box,
  Button,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Tab, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import BackdropLoading from 'src/components/BackdropLoading';
import CircularLoading from 'src/components/CircularLoading';
import DataView from 'src/components/Form/DataView';
import DatePickerReadOnly from 'src/components/Form/DatePickerReadOnly';
import InputFormReadOnly from 'src/components/Form/InputFormReadOnly';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';
import { resultCodeOk, vacunaTipo } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import AddControlModal from './AddControlModal';
import DeleteControlModal from './DeleteControlModal';

const maxResults = 999;

function ControlServicioDetalle() {
  const [item, setItem] = useState(undefined);
  const [controlModal, setControlModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [controlesList, setControlesList] = useState([]);
  const [currentItem, setCurrentItem] = useState({});

  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();

  // get cerda by id
  const getItemById = useCallback(
    async (reqObj) => {
      try {
        const response = await certifyAxios.post(sanitarioServicioFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setControlesList(response.data.controles || []);
          }
        }
      } catch (err) {
        console.error(err);
        setItem({});
        setControlesList([]);
        if (err.response) {
          console.log(err.response);
        } else {
          console.error('Servicio encontró un error');
        }
        errorMessage('El servicio ha encontrado un error')
      }
    },
    [isMountedRef]
  );

  useEffect(() => {
    if (location.state.loteId !== -1) {
      // id de navigate
      const request = {
        id: location.state.loteId,
        maxResults
      };
      getItemById(request);
    } else {
      setItem({});
    }
  }, [getItemById]);


  // return
  const navigateToMain = () => {
    navigate(-1);
  };

  // agregar alimento
  // open close modal
  const openControlModal = () => {
    setControlModal(true);
  };

  const closeControlModal = () => {
    setControlModal(false);
  };

  // agregar api
  const agregarControl = async (reqObj) => {
    try {
      setLoading(true)
      const response = await certifyAxios.post(controlSanitarioRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        closeControlModal();
        const request = {
          id: item.id,
        };
        await getItemById(request);
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error(error);
      showUserErrors(error, 'No se ha podido agregar. Inténtelo de nuevo');
    }
  };

  // eliminar compra

  // open close modal
  const openDeleteModal = (item) => {
    setCurrentItem(item);
    setOpenDelete(true);
  };

  const closeDeleteModal = () => {
    setCurrentItem({});
    setOpenDelete(false);
  };

  // eliminar
  const deleteItem = async () => {
    // llamada
    setLoading(true)
    closeDeleteModal();
    try {
      const reqObj = {
        id: currentItem.id
      };
      const response = await certifyAxios.post(controlSanitarioDeleteAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const request = {
          id: item.id,
        };
        await getItemById(request);
        setLoading(false)
        successMessage(response.data.userMsg ?? 'Se ha eliminado satisfactoriamente');
      }
    } catch (error) {
      setLoading(false)
      console.error(error);
      showUserErrors(error, 'No se ha podido eliminar. Inténtelo de nuevo');
    }
  };


  return (
    <>
      <Helmet>
        <title>Control Servicio</title>
      </Helmet>
      <PageTitleWrapper>
        <Grid container alignItems="center">
          <Grid item xs={2} md={0.5} sm={0.5}>
            <IconButton size="small" onClick={navigateToMain}>
              <KeyboardArrowLeftRoundedIcon />
            </IconButton>
          </Grid>
          <Grid item xs={10} md={6} sm={6} alignItems="left">
            {/* Titulo */}
            <Typography variant="h3" component="h3" gutterBottom>
              Detalle de Control del Lote
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      {/* Form and table */}
      <DialogContent
        sx={{
          py: theme.spacing(3),
          mb: theme.spacing(3),
          px: theme.spacing(6),
          mx: theme.spacing(4),
          background: 'white',
          borderRadius: 2
        }}
      >
        <>
          {item === undefined && <CircularLoading />}
          <BackdropLoading open={loading} />
          {item !== undefined && (
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title="Controles">
                <Grid container justifyContent="center" 
                  spacing={1}
                  mt={2}
                >
                  <SubtitleForm subtitle="Datos de Lote" />
                  <Grid container item xs={12} sm={12} md={12} spacing={4}>
                    <Grid item xs={12} sm={12} md={4}>
                      <DataView label="Código" text={item?.codigo || ''} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <DataView
                        label="Fecha de apertura"
                        text={
                          (item?.fechaApertura &&
                            formatDate(item?.fechaApertura)) ||
                          '-'
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <DataView
                        label="Estado"
                        text={item?.estado}
                        status
                        lote
                      />
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} sm={12} md={12} spacing={4} mb={3}>
                    <Grid item xs={12} sm={12} md={4}>
                      <DataView
                        label="Total de Cerdas"
                        text={item?.totalCerdas || '0'}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <DataView
                        label="Fecha Promedio Servicio"
                        text={
                          (item?.fechaPromServicio &&
                            formatDate(item?.fechaPromServicio)) ||
                          '-'
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <DataView
                        label="Fecha Promedio Parto"
                        text={
                          (item?.fechaPromParto &&
                            formatDate(item?.fechaPromParto)) ||
                          '-'
                        }
                      />
                    </Grid>
                  </Grid>
                  <SubtitleForm subtitle="Próxima Vacuna Recomendada"/>
                  <Grid container item spacing={2}>
                    <Grid item xs={12} sm={12} md={4}>
                      <InputFormReadOnly
                        label="Tipo de Vacuna"
                        value={(item?.proximaVacunaTipo && vacunaTipo[item?.proximaVacunaTipo]) || '-'}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <DatePickerReadOnly
                        value={item?.proximaVacunaFecha || null}
                        label="Fecha de aplicación recomendada"
                        inputName="proximaVacunaFecha"
                      />
                    </Grid>
                  </Grid>
                  
                  <SubtitleForm subtitle="Listado de controles" list>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={openControlModal}
                    >
                      Agregar control
                    </Button>
                  </SubtitleForm>
                  <Grid item xs={12} sm={12} md={10}>
                    <Box
                      p={2}
                      display="flex"
                      alignItems="normal"
                      flexDirection="column"
                      justifyContent="space-between"
                      mr={2}
                    >
                      <Box>
                        <Typography component="span" variant="subtitle1">
                          Total de controles:
                        </Typography>{' '}
                        <b>{controlesList.length || 0}</b>
                      </Box>
                    </Box>
                    <Divider />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Fecha de Control</TableCell>
                            <TableCell align="center">Tipo de Vacuna</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {controlesList?.length !== 0 &&
                            controlesList.map((element, idx) => {
                              return (
                                <TableRow hover key={idx}>
                                  <TableCell>
                                    <Typography>
                                      {(element?.fechaAplicacion &&
                                        formatDate(element.fechaAplicacion)) ||
                                        ''}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography>
                                      {(element?.tipo &&
                                        vacunaTipo[element.tipo]) ||
                                        '-'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title="Remover control">
                                      <IconButton
                                        color="error"
                                        sx={{ borderRadius: 30 }}
                                        onClick={() => {
                                          openDeleteModal(element);
                                        }}
                                      >
                                        <DeleteRoundedIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {controlesList?.length === 0 && (
                      <Box p={2}>
                        <Typography
                          sx={{
                            py: 2
                          }}
                          variant="h3"
                          fontWeight="normal"
                          color="text.secondary"
                          align="center"
                        >
                          Sin controles registrados
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Tab>
              <Tab eventKey={2} title="Vacunas Recomendadas">
                <div style={{ marginTop: '1.5rem' }}>
                  <Alert severity="warning">
                    Las fechas de vacunación son referenciales, ya que dependen
                    de lo establecido por la marca.
                  </Alert>
                  <Grid
                    container
                    justifyContent="normal"
                    spacing={3}
                    mb={3}
                    mt={0}
                  >
                    <SubtitleForm subtitle="Vacuna Coli-clostridium" />
                    <Grid container spacing={2} ml={2} mt={1}>
                      <Grid item xs={12} sm={12} md={3}>
                        <InputFormReadOnly
                          label="Días de gestación"
                          value={(item?.vacunaCCProbable && item?.vacunaCCProbable?.dias) || '0'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={3}>
                        <DatePickerReadOnly
                          value={item?.vacunaCCProbable &&
                            item?.vacunaCCProbable?.fechaAplicacion || null}
                          label="Fecha de aplicación recomendada"
                          inputName="vacunaCCProbable"
                        />
                      </Grid>
                    </Grid>
                    <SubtitleForm subtitle="Vacuna Parvovirus-leptospirosis-erisipela" />
                    <Grid container spacing={2} ml={2}>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography pt={2}>
                         <b> Primera dosis recomendada </b>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={3}>
                        <InputFormReadOnly
                          label="Días de gestación"
                          value={(item?.vacunaPLEPrimeraProbable && item?.vacunaPLEPrimeraProbable?.dias) || '0'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={3}>
                        <DatePickerReadOnly
                          value={item?.vacunaPLEPrimeraProbable &&
                            item?.vacunaPLEPrimeraProbable?.fechaAplicacion || null}
                          label="Fecha de aplicación recomendada"
                          inputName="vacunaPLEPrimeraProbable"
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} ml={2}>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography pt={2}>
                         <b> Segunda dosis recomendada </b>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={3}>
                        <InputFormReadOnly
                          label="Días de lactancia"
                          value={(item?.vacunaPLESegundaProbable && item?.vacunaPLESegundaProbable?.dias) || '0'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={3}>
                        <DatePickerReadOnly
                          value={item?.vacunaPLESegundaProbable &&
                            item?.vacunaPLESegundaProbable?.fechaAplicacion || null}
                          label="Fecha de aplicación recomendada"
                          inputName="vacunaPLESegundaProbable"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
              </Tab>
            </Tabs>
          )}
          {/* <Grid container justifyContent="center" spacing={2}>
            <Alert severity="info">
              Las fechas de vacunación son referenciales, ya que dependen de lo establecido por la marca
            </Alert>
          </Grid> */}
        </>
      </DialogContent>
      {controlModal && (
        <AddControlModal
          open={controlModal}
          modalClose={closeControlModal}
          handleAction={agregarControl}
          servicioId={item?.id}
        />
      )}
      {openDelete && (
        <DeleteControlModal
          openConfirmDelete={openDelete}
          closeConfirmDelete={closeDeleteModal}
          title="Eliminar Control Sanitario"
          itemName={` el control realizado el ${
            currentItem?.fechaAplicacion
              ? formatDate(currentItem?.fechaAplicacion)
              : ''
          }`}
          handleDeleteCompleted={deleteItem}
        />
      )}
    </>
  );
}

export default ControlServicioDetalle;
