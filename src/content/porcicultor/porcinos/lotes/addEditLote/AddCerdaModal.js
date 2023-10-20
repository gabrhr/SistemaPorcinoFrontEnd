import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Divider,
  Grid,
  InputAdornment,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/system';
import { forwardRef, useEffect, useState } from 'react';
import CerdaEstadoChip from 'src/components/CerdaEstadoChip';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import { cerdaToAddLoteAPI } from 'src/utils/apiUrls';
import { resultCodeOk } from 'src/utils/defaultValues';
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

const getCerdasTipoText = (tipo) => {
  if (tipo === 'Celo') {
    return 'Las cerdas listadas tienen de estado: Vacia, Destetada y Reemplazo.';
  }
  if (tipo === 'Servicio') {
    return 'La cerdas listadas tienen de estado: Por servir';
  }

  return '';
};

function AddCerdaModal({
  tipo = null,
  open,
  modalClose,
  handleAction = [],
  removeList = [],
  cerdasList,
  granjaId
}) {
  const [query, setQuery] = useState('');
  const [list, setList] = useState(undefined);
  const [listFiltered, setListFiltered] = useState(undefined);
  const [selectedList, setSelectedList] = useState([]);
  const isRowBased = useMediaQuery('(min-width: 500px)');

  // get cerdas
  const getCerdasToAdd = async () => {
    const reqObj = {
      tipoLote: tipo,
      granjaId
    };
    try {
      const response = await certifyAxios.post(cerdaToAddLoteAPI, reqObj);
      if (response.data?.resultCode === resultCodeOk) {
        const updatedList = processList(response.data.list || [])
        setListFiltered(updatedList || []);
        setList(updatedList || []);
      }
    } catch (err) {
      console.error(err);
      setList([]);
      setListFiltered([]);
      errorMessage("No se ha podido obtener el listado de cerdas")
    }
  };

  useEffect(() => {
    let isMounted = true;

    if(tipo){
        if(isMounted){
            getCerdasToAdd();
        }
    }
  
    return () => {
      // Cleanup: Cancelar la tarea si el componente se desmonta
      isMounted = false;
    };
    
  }, []);

  // procesamos lista
  const processList = (list) => {
    let listado = [...list] 
    
    // si ha añadido en el original, no se debe volver a mostrar
    // en este listado
    if(cerdasList && cerdasList.length > 0){
        const idsNoPermitidos = cerdasList.map(e => e.id);
        listado = listado.filter(e => !idsNoPermitidos.includes(e.id))
    }
    
    // lo que se elimino (removeList) en la lista oficial, 
    // se debe agregar al modal  
    if(removeList && removeList.length > 0){
        listado = listado.concat([...removeList])
    }
    const uniqueSet = new Set(listado.map(JSON.stringify));
    const uniqueArray = Array.from(uniqueSet).map(JSON.parse);
    return uniqueArray
  };
  

  // busqueda por codigo
  const handleChangeQuery = (event) => {
    event.persist();
    setQuery(event.target.value);
    // filter cerdas
    if (event && event.target && event.target.value === '') {
      setListFiltered(list);
    } else if (event?.target?.value && event.target.value.length >= 1) {
      const filteredData = list.filter((item) => {
        return item.codigo.includes(event.target.value);
      });
      setListFiltered(filteredData);
    }
  };

  const isSelected = (id) => {
    const index = selectedList.findIndex((item) => item.id === id)
    return index !== -1
  }

  const selectCerda = (item, event) => {
    if (item) {
      if (!event.target.checked && isSelected(item.id)) {
        const updatedList = selectedList.filter(
            (cerda) => cerda.id !== item.id
        );
            setSelectedList(updatedList);
        } else {
            const updatedList = selectedList.concat(item)
        setSelectedList(updatedList);
      }
    }
  };

  const agregarCerdas = () => {
     handleAction(selectedList)
  };
  

  return (
    <DialogWrapper
      open={open}
      TransitionComponent={Transition}
      onClose={modalClose}
      scroll="body"
      maxWidth="sm"
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
          {tipo !== null ? `Agregar Cerdas para ${tipo}` : 'Agregar Cerdas'}
        </Typography>
        {/* Table */}
        {tipo === null && (
          <Typography
            width="100%"
            align="left"
            sx={{
              py: 3
            }}
            fontWeight="normal"
            color="text.secondary"
          >
            Primero debe seleccionar un Tipo
          </Typography>
        )}
        {tipo !== null && (
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Typography gutterBottom marginY={2}>
                {getCerdasTipoText(tipo)}
              </Typography>
              <Box>
                <TextField
                  sx={{
                    mx: 0,
                    mb: 1,
                    width: isRowBased ? '80%' : '100%',
                    background: 'white',
                    borderRadius: '10px'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchTwoToneIcon />
                      </InputAdornment>
                    )
                  }}
                  size="small"
                  onChange={handleChangeQuery}
                  placeholder="Busque por código de cerda"
                  value={query}
                  variant="outlined"
                />
              </Box>
            </Grid>
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
                    Total de cerdas:
                  </Typography>{' '}
                  <b>{list?.length || 0}</b>
                </Box>
              </Box>
              <Divider />
              <TableContainer sx={{height: (listFiltered?.length === 0)? "10vh": "50vh", overflowY:"auto"}}>
                <Table sx={{height:"max-content"}}>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Código Cerda</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Línea Genética</TableCell>
                      <TableCell align="center">Orden de Parto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listFiltered === undefined && (
                      <TableRowsLoader
                        rowsNum={5}
                        cellsRow={['status', 'text', 'status', 'text', 'text']}
                      />
                    )}
                    {listFiltered !== undefined &&
                      listFiltered?.length !== 0 &&
                      listFiltered.map((element, idx) => {
                        const isCerdaSelected = isSelected(element?.id || -1);
                        return (
                          <TableRow hover key={idx}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isCerdaSelected || false}
                                onChange={(e) =>
                                  selectCerda(element || null, e)
                                }
                                key={idx}
                              />
                            </TableCell>
                            <TableCell>{element?.codigo ?? ''}</TableCell>
                            <TableCell align='center'>
                              <CerdaEstadoChip estado={element?.estado ?? ''} />
                            </TableCell>
                            <TableCell align="center">
                              {element?.lineaGeneticaNombre ?? ''}
                            </TableCell>
                            <TableCell align="center">
                              {element?.ordenParto ?? 0}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              {listFiltered !== undefined && listFiltered?.length === 0 && (
                <>
                  <Typography
                    sx={{
                      py: 3
                    }}
                    variant="h3"
                    fontWeight="normal"
                    color="text.secondary"
                    align="center"
                  >
                    No se encontraron cerdas disponibles
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        )}

        {/* Botones */}
        {(listFiltered !== undefined &&
                      listFiltered?.length !== 0) && 
        <Grid
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            pt: 2
          }}
          container
          margin="auto"
          item
          xs={12}
        >
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              sx={{
                mx: 1,
                color: 'red',
                borderColor: 'red'
              }}
              onClick={modalClose}
            >
              Cancelar
            </Button>
          </Grid>
          <Grid item>
            <Button
              color="primary"
              variant="outlined"
              onClick={agregarCerdas}
              size="small"
              sx={{
                ml: 1,
                px: 2
              }}
            >
              Agregar cerdas
            </Button>
          </Grid>
        </Grid>}
      </Box>
    </DialogWrapper>
  );
}

export default AddCerdaModal;
