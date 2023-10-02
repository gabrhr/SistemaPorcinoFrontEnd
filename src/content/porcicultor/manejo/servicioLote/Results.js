import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import {
  Box, Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment, Table, TableBody, TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import StatusTable from 'src/components/Form/StatusTable';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import { formatDate, getEstadoServicioNombre } from 'src/utils/dataFormat';
import { allStatus, listEstadoServicio, servicioEstado, tiposInseminacion } from 'src/utils/defaultValues';
import AddFalloModal from './AddFalloModal';

const statusList = listEstadoServicio()

const Results = (props) => {
  const [query, setQuery] = useState('');
  const [falloModal, setFalloModal] = useState(false)
  const [currentItem, setCurrentItem] = useState({})
  const [listFiltered, setListFiltered] = useState(undefined);
  const statusRef = useRef(null);
  const [openStatus, setOpenStatus] = useState(false);
  const [status, setStatus] = useState(allStatus.text);
  const isRowBased = useMediaQuery('(min-width: 500px)');


  useEffect(() => {
    let isMounted = true;

    if(isMounted){
        setListFiltered(props.itemListado)
    }
  
    return () => {
      // Cleanup: Cancelar la tarea si el componente se desmonta
      isMounted = false;
    };
    
  }, [props.itemListado]);

  const handleQueryChange = (event) => {
    event.persist();
    setQuery(event.target.value);
    if (event && event.target && event.target.value === '') {
      setListFiltered(props.itemListado);
    } else if (event?.target?.value && event.target.value.length >= 1) {
      const filteredData = props.itemListado.filter((item) => {
        return item.cerda.codigo.includes(event.target.value);
      });
      setListFiltered(filteredData);
    }
  };

  const handleChangeStatus = (value) => {
    if (value === allStatus.text) {
      setListFiltered(props.itemListado);
    } else {
      const filteredData = props.itemListado.filter((item) => {
        return item.estado.includes(value);
      });
      setListFiltered(filteredData);
    }
  } 

  
  const openFalloModal = (item) => {
    setCurrentItem(item)
    setFalloModal(true)      
  }

  const closeFalloModal = () => {
    setCurrentItem({})
    setFalloModal(false)
  }

  const registerFallo = (reqObj) => {
    props.registerFalloById(reqObj, () => {
      closeFalloModal()
    })
  }
 
  const editItem = (id) => {
    props.navigateToDetalle(id)

  }

  return (
    <>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Box p={1}>
              <TextField
                sx={{
                  mx: 0,
                  mb: 1,
                  width: isRowBased? "50%": "100%",
                  background: "white",
                  borderRadius:"10px"
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  )
                }}
                size='small'
                onChange={handleQueryChange}
                placeholder="Busque por código"
                value={query}
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>

        <Card elevation={0}>
        <Box
          p={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mr={2}
        >
          <Box>
            <Typography component="span" variant="subtitle1">
              Mostrando:
            </Typography>{' '}
            <b>{props.itemListado.length}</b> <b>cerda(s)</b> {/* change */}
          </Box>
          <StatusTable
            actionRef = {statusRef}
            setOpenStatus ={setOpenStatus}
            openStatus = {openStatus}
            status = {status}
            setStatus = {setStatus}
            menuList = {statusList}
            handleChange = {handleChangeStatus}
          />
        </Box>
        <Divider />
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código Cerda</TableCell>
                    <TableCell align='center'>Tipo Servicio</TableCell>
                    <TableCell align='center'>Fecha Servicio</TableCell>
                    <TableCell align='center'> Parto probable</TableCell>
                    <TableCell align='center'> Estado Servicio</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    (props.loading || listFiltered === undefined) &&
                    <TableRowsLoader
                      rowsNum={5} 
                      cellsNum={5}
                      action
                    />
                  }
                  {listFiltered !== undefined && listFiltered?.length !== 0 &&
                  (listFiltered.map((element, idx) => {
                    return (
                      <TableRow hover key={idx}>
                        <TableCell>
                          <Typography noWrap>
                          {element && element.cerda?.codigo || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element?.tipoServicio && tiposInseminacion[element.tipoServicio] || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element?.fechaPrimeraInseminacion && formatDate(element?.fechaPrimeraInseminacion) || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                          {element && element?.fechaPartoProbable && formatDate(element?.fechaPartoProbable) || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element?.estado && getEstadoServicioNombre(element.estado) || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                            {/* Actions */}
                            <IconButton  
                                onClick={()=> {editItem(element.id)}}
                                sx={{
                                    borderRadius:30, 
                                    marginRight:"15px"
                                }}
                                color='primary'
                            >
                              {(element.estado === servicioEstado.fallido || element.estado === servicioEstado.finalizado)?
                               <AssignmentRoundedIcon/>
                                :<CreateRoundedIcon/>
                              }
                                
                            </IconButton>
                            {!(element.estado === servicioEstado.fallido || element.estado === servicioEstado.finalizado) && 
                            <Tooltip title="Registrar Fallo">
                            <IconButton color="error" 
                                sx={{borderRadius:30}}
                                onClick={()=> openFalloModal(element)}
                                >
                                <AssignmentLateOutlinedIcon/>                          
                            </IconButton>
                              </Tooltip>
                            }
                        </TableCell>
                      </TableRow>
                    );
                  }))
                }
                </TableBody>
              </Table>
            </TableContainer>
            {!props.loading && listFiltered !== undefined && listFiltered?.length === 0 &&
            <Box p={2}>
              <Typography
                sx={{
                  py: 10
                }}
                variant="h3"
                fontWeight="normal"
                color="text.secondary"
                align="center"
              >
                No se encontraron cerdas en el lote
              </Typography>
            </Box>
          }
            <Box p={2} />
          </>
      </Card>
      {/* Eliminar */}
      {falloModal && <AddFalloModal
        open={falloModal}
        modalClose={closeFalloModal}
        texto={`Ingrese los motivos para el fallo de la cerda ${currentItem?.cerda?.codigo || ""}`}
        loteCerdaServicioId={currentItem.id}
        handleAction={registerFallo}
      />}
    </>
  );
};

Results.propTypes = {
  itemListado: PropTypes.array.isRequired
};

Results.defaultProps = {
  itemListado: []
};

export default Results;