import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  celoAptaServicioAPI,
  cerdaCeloFindByIdAPI,
  deteccionDeleteAPI,
  deteccionRegisterAPI
} from 'src/utils/apiUrls';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';

import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Link,
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
import CerdaEstadoChip from 'src/components/CerdaEstadoChip';
import DataView from 'src/components/Form/DataView';
import { SubtitleForm } from 'src/components/Form/SubtitleForm';
import useRefMounted from 'src/hooks/useRefMounted';
import { formatDate } from 'src/utils/dataFormat';
import { celoEstado, resultCodeOk } from 'src/utils/defaultValues';
import AddDeteccionModal from './AddDeteccionModal';
import AptaServicioModal from './AptaServicioModal';
import DeleteDeteccionModal from './DeleteDeteccionModal';

const mainUrl = '/sp/porcicultor/manejo/celo';
const loteUrl = '/sp/porcicultor/manejo/celo/lote-detalle';

function AddEditAlimento() {
  const [item, setItem] = useState(undefined);
  const [locationState, setLocationState] = useState({});
  const [editActive, setEditActive] = useState(false);
  const [deteccionModal, setDeteccionModal] = useState(false);
  const [aptaModal, setAptaModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deteccionesList, setDeteccionesList] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMountedRef = useRefMounted();

  // get lotecerdacelo by id
  const getItemById = useCallback(
    async (reqObj) => {
      setLoading(true)
      try {
        const response = await certifyAxios.post(cerdaCeloFindByIdAPI, reqObj);
        if (isMountedRef.current) {
          if (response.status === 200 && response.data) {
            setItem(response.data);
            setDeteccionesList(response.data.deteccionCeloList || []);
            if (response.data.estado === celoEstado.enProceso) {
              setEditActive(true);
            }
          }
        }
        setLoading(false)
      } catch (err) {
        console.error(err);
        setItem({});
        setDeteccionesList([]);
        setLoading(false)
        if (err.response) {
          console.log(err.response);
        } else {
          console.error('Servicio encontró un error');
        }
        enqueueSnackbar('El servicio ha encontrado un error', {
          variant: 'error'
        });
      }
    },
    [isMountedRef]
  );

  useEffect(() => {
    if (location.state.celoId !== -1) {
      // id de navigate
      const request = {
        id: location.state.celoId
      };
      setLocationState({
        celoId: location.state.celoId,
        loteId: location.state.loteId,
        loteNombre: location.state.loteNombre,
        disableStatusCerda: location.state.disableStatusCerda
      });
      getItemById(request);
    } else {
      setEditActive(false);
      setItem({});
    }
  }, [getItemById]);

  // apta para servicio
  const openAptaModal = () => {
    setAptaModal(true);
  };

  const closeAptaModal = () => {
    setAptaModal(false);
  };

  const aptaParaServicio = async () => {
    try {
      const reqObj ={
        id: item.id
      }
      const response = await certifyAxios.post(celoAptaServicioAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({ id: item.id });
        enqueueSnackbar(
          response.data.userMsg ?? 'Se modificó satisfactoriamente',
          { variant: 'success' }
        );
        navigateToLoteList()
      }
    } catch (error) {
      console.error(error);
      navigateToLoteList()
      showUserErrors(error, "No se ha podido marcar como apta. Inténtelo de nuevo")
    }
  };


  // agregar deteccion
  // open close modal
  const openDeteccionModal = () => {
    setDeteccionModal(true);
  };

  const closeDeteccionModal = () => {
    setDeteccionModal(false);
  };

  // agregar api
  const agregarDeteccion = async (reqObj) => {
    try {
      const response = await certifyAxios.post(deteccionRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({ id: item.id });
        enqueueSnackbar(
          response.data.userMsg ?? 'Se agregó satisfactoriamente',
          { variant: 'success' }
        );
      }
      closeDeteccionModal();
    } catch (error) {
      console.error(error);
      showUserErrors(error, "No se ha podido agregar. Inténtelo de nuevo")
    }
  };

  // eliminar deteccion

  // open close modal
  const openDeleteModal = (item) => {
    setCurrentItem(item);
    setOpenDelete(true);
  };

  const closeDeleteModal = () => {
    setCurrentItem({});
    setOpenDelete(false);
  };

  // eliminar deteccion
  const deleteItem = async () => {
    // llamada
    try {
      const reqObj = {
        id: currentItem.id
      };
      const response = await certifyAxios.post(deteccionDeleteAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        getItemById({ id: item.id });
        enqueueSnackbar(
          response.data.userMsg ?? 'Se ha eliminado satisfactoriamente',
          { variant: 'success' }
          );
          closeDeleteModal();
      }
    } catch (error) {
      closeDeleteModal();
      console.error(error);
      showUserErrors(error, "No se ha podido eliminar. Inténtelo de nuevo")
    }
  };

  // return
  const navigateToLoteList = () => {
    navigate(loteUrl, {
      state: {
        loteId: locationState.loteId,
        loteNombre: locationState.loteNombre,
        disableStatusCerda: locationState.disableStatusCerda
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Celo Cerda</title>
      </Helmet>
      <PageTitleWrapper>
        <Grid container alignItems="center">
          <Grid item xs={12} md={12} sm={12} mb={2}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href={mainUrl}>
                Listado de Celos
              </Link>
              <Link
                underline="hover"
                color="inherit"
                onClick={navigateToLoteList}
              >
                Celo del Lote
              </Link>
              <Typography color="text.primary">Detalle de Cerda</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid item xs={2} md={0.5} sm={0.5}>
            <IconButton size="small" onClick={navigateToLoteList}>
              <KeyboardArrowLeftRoundedIcon />
            </IconButton>
          </Grid>
          <Grid item xs={10} md={6} sm={6} alignItems="left">
            {/* Titulo */}
            <Typography variant="h3" component="h3" gutterBottom>
              Celo de Cerda
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
        {(loading || item === undefined) && 
          <div
          style={{
            display: 'grid',
            justifyContent: 'center',
            paddingTop: '6rem',
            paddingBottom: '6rem'
          }}
        >
          <CircularProgress
            color="secondary"
            sx={{ mb: '1rem', mx: '10rem' }}
          />
        </div>

        }
        {(!loading && item !== undefined) && <>
          {/* Cerda datos */}
          <Grid container justifyContent="center" spacing={3} mb={4}>
            <SubtitleForm subtitle="Datos de Cerda" />
            <Grid container item xs={12} sm={12} md={12} spacing={4}>
              <Grid item xs={12} sm={12} md={4}>
                <DataView
                  label="Código"
                  text={(item?.cerda && item?.cerda?.codigo) || ''}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <DataView
                  label="Línea genético"
                  text={
                    (item?.cerda && item?.cerda?.lineaGenetica?.nombre) || ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <DataView
                  label="Estado"
                  status
                  cerda
                  text={(item?.cerda && item?.cerda?.estado) || ''}
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} spacing={4}>
              <Grid item xs={12} sm={12} md={4}>
                <DataView
                  label="Fecha de nacimiento"
                  text={
                    (item?.cerda &&
                      item?.cerda?.fechaNacimiento &&
                      formatDate(item?.cerda?.fechaNacimiento)) ||
                    ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <DataView
                  label="Orden de parto"
                  text={(item?.cerda && item?.cerda?.ordenParto) || '0'}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <DataView
                  label="Fecha de último servicio "
                  text={
                    (item?.cerda && item?.cerda?.fechaUltimoServicio && formatDate(item?.cerda?.fechaUltimoServicio)) ||
                    'Sin servicio'
                  }
                />
              </Grid>
            </Grid>
          </Grid>

          <Divider className="divider-form" />
          {/* List */}
          <Grid container justifyContent="center" spacing={3}>
            <SubtitleForm subtitle="Detecciones de celo" list>

              {editActive && <Button
                variant="outlined"
                size="small"
                color="primary"
                sx={{marginRight:2}}
                onClick={openAptaModal}
              >
                Apta para Servicio
              </Button>}
              {editActive && <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={openDeteccionModal}
              >
                Agregar detección
              </Button>}
            </SubtitleForm>
            <Grid item xs={12} sm={12} md={10}>
              <Box
                p={2}
                display="flex"
                alignItems="center"
                justifyContent="space-around"
                mr={2}
              >
                <Box>
                  <Typography component="span" variant="subtitle1">
                    Total de detecciones:
                  </Typography>{' '}
                  <b>{deteccionesList?.length || 0}</b>
                </Box>
                <Box>
                <Typography component="span" variant="subtitle1">
                    Presencia de celo:
                  </Typography>{' '}
                  <b>{item?.numeroCelos || 0}</b>
                </Box>
              </Box>
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha de celo</TableCell>
                      <TableCell align="center">Presencia de Celo</TableCell>
                      <TableCell align="center">Peso (kg)</TableCell>
                      {editActive && (
                        <TableCell align="center">Acciones</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deteccionesList?.length !== 0 &&
                      deteccionesList.map((element, idx) => {
                        return (
                          <TableRow hover key={idx}>
                            <TableCell>
                              {(element?.fechaDeteccion &&
                                formatDate(element.fechaDeteccion)) ||
                                ''}
                            </TableCell>
                            <TableCell align="center">
                              <CerdaEstadoChip
                                estado={
                                  element?.resultadoCelo === 1 ? 'Sí' : 'No'
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              {element?.peso ?? '0'}
                            </TableCell>
                            {editActive &&<TableCell align="center">
                                <Tooltip title="Remover detección">
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
                            </TableCell>}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              {deteccionesList?.length === 0  &&
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
                      Sin detecciones registradas
                    </Typography>
                  </Box>
                }
            </Grid>
          </Grid>
        </>}
      </DialogContent>
      {deteccionModal && (
        <AddDeteccionModal
          open={deteccionModal}
          modalClose={closeDeteccionModal}
          handleAction={agregarDeteccion}
          loteCerdaCeloId={item.id}
        />
      )}
      {openDelete && (
        <DeleteDeteccionModal
          openConfirmDelete={openDelete}
          closeConfirmDelete={closeDeleteModal}
          title="Eliminar Detección"
          itemName={` la retección realizada el ${
            currentItem?.fechaDeteccion}
              ? formatDate(currentItem?.fechaDeteccion)
              : ''
          }`}
          handleDeleteCompleted={deleteItem}
        />
      )}
      {aptaModal && (
        <AptaServicioModal
          open={aptaModal}
          closeConfirm={closeAptaModal}
          title="Apta para Servicio"
          itemName={` ${item?.cerda?.codigo || "" } como Apta para servicio`}
          handleCompleted={aptaParaServicio}
        />
      )}
    </>
  );
}

export default AddEditAlimento;
