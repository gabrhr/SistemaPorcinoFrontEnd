import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useCallback, useEffect, useState } from 'react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  controlCerdasDeleteAPI,
  controlCerdasFindByIdAPI,
  controlCerdasRegisterAPI
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
import BackdropLoading from 'src/components/BackdropLoading';
import CircularLoading from 'src/components/CircularLoading';
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

function AddEditAlimentoCerda() {
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
      try {
        const response = await certifyAxios.post(controlCerdasFindByIdAPI, reqObj);
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
    if (location.state.cerdaId !== -1) {
      // id de navigate
      const request = {
        id: location.state.cerdaId,
        granjaId: user.granjaId,
        maxResults
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
      setLoading(true)
      const response = await certifyAxios.post(controlCerdasRegisterAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        closeControlModal();
        const request = {
          id: item.cerda.id,
          granjaId: user.granjaId,
          maxResults
        };
        await getItemById(request);
        setLoading(false)
        successMessage(response.data.userMsg?? "Se agregó satisfactoriamente")
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
    try {
      setLoading(true)
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
        await getItemById(request);
        closeDeleteModal();
        setLoading(false)
        successMessage(response.data.userMsg ?? 'Se ha eliminado satisfactoriamente');
      }
    } catch (error) {
      setLoading(false)
      closeDeleteModal();
      console.error(error);
      showUserErrors(error, 'No se ha podido eliminar. Inténtelo de nuevo');
    }
  };


  return (
    <>
      <Helmet>
        <title>Control Cerda</title>
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
              Detalle de Alimentación
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
          {item === undefined && <CircularLoading/>}
          <BackdropLoading open={loading}/>
          {item !== undefined && (
            <Grid container justifyContent="center" spacing={2}>
              <SubtitleForm subtitle="Datos de Cerda" />
              <Grid container item xs={12} sm={12} md={12} spacing={4}>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView label="Codigo" text={item?.cerda?.codigo || ''} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView label="Fecha de nacimiento" text={item?.cerda?.fechaNacimiento && formatDate(item?.cerda?.fechaNacimiento) || '-'} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView cerda status label="Estado" text={item?.cerda?.estado || ''} />
                </Grid>
              </Grid>

              <SubtitleForm subtitle="Consumo de alimento" />
              <Grid container item xs={12} sm={12} md={12} spacing={4}>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView
                    label="Cantidad diario promedio (kg)"
                    text={item?.cerda?.consumoDiarioProm??'No se ha consumido'}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <DataView
                    label="Consumo total del último mes (kg)"
                    text={item?.cantidadConsumidaTotal ?? '0'}
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
                        <TableCell>Fecha de Consumo</TableCell>
                        <TableCell align="center">Alimento</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {controlesList?.length !== 0 &&
                        controlesList.map((element, idx) => {
                          return (
                            <TableRow hover key={idx}>
                              <TableCell>
                              <Typography noWrap>
                                {(element?.fechaConsumo &&
                                  formatDate(element.fechaConsumo)) ||
                                  ''}
                              </Typography> 
                              </TableCell>
                              <TableCell align="center">
                                <Typography noWrap>
                                {element?.alimento?.nombre ?? '-'}
                                </Typography> 
                              </TableCell>
                              <TableCell align="center">
                                <Typography noWrap>
                                {element?.cantidadConsumida ?? '0'}
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
                      Sin controles registradas
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
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

export default AddEditAlimentoCerda;
