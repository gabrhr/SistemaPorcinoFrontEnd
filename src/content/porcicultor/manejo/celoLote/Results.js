import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
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
import CerdaEstadoChip from 'src/components/CerdaEstadoChip';
import StatusTable from 'src/components/Form/StatusTable';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import { differenciaEntreFechas, formatDate, getEstadoCerdaNombre } from 'src/utils/dataFormat';
import { allStatus, listEstadoCelo } from 'src/utils/defaultValues';
import DescarteModal from '../../porcinos/cerdas/DescarteModal';

const statusList = listEstadoCelo()

const Results = (props) => {
  const [query, setQuery] = useState('');
  const [openDescarte, setOpenDescarte] = useState(false)
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


  const descarteModalOpen = (item) => {
    setCurrentItem(item)
    setOpenDescarte(true)      
  }

  const descarteModalClose = () => {
    setCurrentItem({})
    setOpenDescarte(false)
  }

  const descartarCerda = (request) => {
    props.descartarById(currentItem.id, request, () => {
      descarteModalClose()
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
                placeholder="Busque por código de cerda"
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
            nombre="Estado Celo"
          />
        </Box>
        <Divider />
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código Cerda</TableCell>
                    {props.statusHeaderCerda && <TableCell align='center'>Estado Cerda</TableCell>}
                    <TableCell align='center'>Edad Cerda</TableCell>
                    <TableCell align='center'> Última Fecha Celo</TableCell>
                    <TableCell align='center'> Estado Celo</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    (props.loading || listFiltered === undefined) &&
                    <TableRowsLoader
                      rowsNum={5} 
                      cellsRow={["text",  "text", "text", "text", "action"]}
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
                        {props.statusHeaderCerda && 
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.cerda &&
                            <CerdaEstadoChip estado={getEstadoCerdaNombre(element.cerda.estado) || ""}/>
                            }
                          </Typography>
                        </TableCell>}
                        <TableCell align='center'>
                          <Typography noWrap>
                          {element && element.cerda?.fechaNacimiento && 
                          differenciaEntreFechas(element.cerda.fechaNacimiento,"month") || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.fechaUltimoCelo && 
                            formatDate(element.fechaUltimoCelo) || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.estado || "0"} 
                            {element.cerda?.descartada === 1? " - Descartada" : ""}
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
                                {element.cerda?.descartada === 1?
                                <AssignmentRoundedIcon/>
                                : <CreateRoundedIcon/>}
                            </IconButton>
                            {element.cerda?.descartada < 1 && 
                            <Tooltip title="Descartar cerda">
                              <IconButton color="error" 
                                sx={{borderRadius:30}}
                                onClick={()=> descarteModalOpen(element)}
                            >
                                <HighlightOffRoundedIcon/>                          
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
      {/* Descartar */}
      {openDescarte && <DescarteModal
        openConfirmDelete={openDescarte}
        closeConfirmDelete={descarteModalClose}
        title="Descartar Cerda"
        item={currentItem.cerda}
        handleDeleteCompleted={descartarCerda}
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