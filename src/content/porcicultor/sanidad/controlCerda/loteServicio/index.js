import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  controlCerdasDeleteAPI,
  controlCerdasRegisterAPI,
  loteFindByIdAPI
} from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
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
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import DataView from 'src/components/Form/DataView';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';
import { resultCodeOk } from 'src/utils/defaultValues';
import { errorMessage, successMessage } from 'src/utils/notifications';
import AddControlModal from './AddControlModal';
import DeleteControlModal from './DeleteControlModal';

const maxResults = 30;

function AddEditAlimento() {
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
  const { user } = useAuth();

  // get cerda by id
  const getItemById = useCallback(
    async (reqObj) => {
      setLoading(true)
      try {
        const response = await certifyAxios.post(loteFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setControlesList(response.data.controles || []);
          }
        }
        setLoading(false)
      } catch (err) {
        console.error(err);
        setItem({});
        setControlesList([]);
        setLoading(false)
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
        id: location.state.loteId
      };
      getItemById(request);
    } else {
      setItem({});
    }
  }, [getItemById]);

  /* const resetStates = (edit = false) => {
    if (edit) {
      setEditActive(false);
    }
    setLoading(false);
  }; */

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
      const response = await certifyAxios.post(controlCerdasRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const request = {
          id: item.cerda.id,
          granjaId: user.granjaId,
          maxResults
        };
        getItemById(request);
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
      }
      closeControlModal();
    } catch (error) {
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
    try {
      const reqObj = {
        id: currentItem.id
      };
      const response = await certifyAxios.post(controlCerdasDeleteAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const request = {
          id: item.cerda.id,
          granjaId: user.granjaId,
          maxResults
        };
        getItemById(request);
        closeDeleteModal();
        successMessage(response.data.userMsg ?? 'Se ha eliminado satisfactoriamente');
      }
    } catch (error) {
      closeDeleteModal();
      console.error(error);
      showUserErrors(error, 'No se ha podido eliminar. Inténtelo de nuevo');
    }
  };


  return (
    <>
      <Helmet>
        <title>Control Lote</title>
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
          {item !== undefined && !loading && (
            <Grid container justifyContent="center" spacing={2}>
              <SubtitleForm subtitle="Datos de Lote" />
              <Grid container item xs={12} sm={12} md={12} spacing={4}>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView label="Codigo" text={item?.codigo || ''} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView label="Fecha de apertura" text={item?.fechaApertura && formatDate(item?.fechaApertura) || '-'} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView label="Total de Cerdas" text={item?.totalCerdas || '0'} />
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
                      Total de controles del último mes:
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
                                {(element?.fechaConsumo &&
                                  formatDate(element.fechaConsumo)) ||
                                  ''}
                              </TableCell>
                              <TableCell align="center">
                                {element?.alimento?.nombre ?? '-'}
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
          cerdaId={item?.cerda?.id}
          granjaId={user.granjaId}
        />
      )}
      {openDelete && (
        <DeleteControlModal
          openConfirmDelete={openDelete}
          closeConfirmDelete={closeDeleteModal}
          title="Eliminar Control Alimenticio"
          itemName={` el consumo realizado el ${
            currentItem?.fechaConsumo ? formatDate(currentItem?.fechaConsumo) : ''
          } de ${
            currentItem?.cantidadConsumida || 0
          } kg`}
          handleDeleteCompleted={deleteItem}
        />
      )}
    </>
  );
}

export default AddEditAlimento;
