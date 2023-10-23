import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import {
  Box, Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment, Table, TableBody, TableCell,
  TableContainer,
  TableHead, TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import CerdaEstadoChip from 'src/components/CerdaEstadoChip';
import StatusTable from 'src/components/Form/StatusTable';
import { getEstadoCerdaNombre } from 'src/utils/dataFormat';
import { allStatus, listEstadosCerda } from 'src/utils/defaultValues';

import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import DeleteModal from './DeleteModal';
import DescarteModal from './DescarteModal';

const itemSingular = "Cerda"

const statusList = listEstadosCerda()

const Results = (props) => {
  const [limit, setLimit] = useState(10); // page size
  const [query, setQuery] = useState('');
  const [openDelete, setOpenDelete] = useState(false)
  const [openDescarte, setOpenDescarte] = useState(false)
  const [currentItem, setCurrentItem] = useState({})
  const statusRef = useRef(null);
  const [openStatus, setOpenStatus] = useState(false);
  const [status, setStatus] = useState(allStatus.text);
  const isRowBased = useMediaQuery('(min-width: 500px)');

  const handleQueryChange = (event) => {
    event.persist();
    setQuery(event.target.value);
    if(status !== allStatus.text){
      setStatus(allStatus.text)
    }
    if(event && event.target && event.target.value === ""){
      props.setPageNumber(0);
      const reqObj = {
        "codigo": "",
        "estado": "",
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
      };
      props.onPageParamsChange(reqObj);
    } else if(event?.target?.value && event.target.value.length >= 1){
      props.setPageNumber(0);
      const reqObj = {
        "codigo": event.target.value,
        "estado": "",
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
      };
      props.onPageParamsChange(reqObj);
    } 
  };

  const handleChangeStatus = (value) => {
    const reqObj = {
        "codigo": "",
        "estado": value,
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
    }

    props.onPageParamsChange(reqObj);
  } 

  const handlePageChange = (_event, newPage) => {
    props.setPageNumber(newPage);

    const reqObj = {
        "codigo": "",
        "estado": "",
        "pageNumber": newPage + 1,
        "maxResults": limit,
        "granjaId": props.granjaId
    };

    props.onPageParamsChange(reqObj)
  };

  const handleLimitChange = (event) => {    
    setLimit(parseInt(event.target.value));
    props.setPageNumber(0) // Retorna a la pagina 1 cuando cambia de limit

    const reqObj = {
        "codigo": "",
        "estado": "",
        "pageNumber": 1,
        "maxResults": event.target.value,
        "granjaId": props.granjaId
    } 

    props.onPageParamsChange(reqObj);
  };


  const openModal = (item) => {
    setCurrentItem(item)
      setOpenDelete(true)      
  }

  const openModalDescartada = (item) => {
    setCurrentItem(item)
    setOpenDescarte(true)      
  }

  const descarteModalClose = () => {
    setCurrentItem({})
    setOpenDescarte(false)
  }

  const deleteModalClose = () => {
    setCurrentItem({})
    setOpenDelete(false)
  }

 
  const editItem = (id) => {
    props.navigateToDetalle(id)

  }
  
  const deleteItem = () => {
    props.deleteById(currentItem.id, () => {
      props.setPageNumber(0) // Retorna a la pagina 1 cuando cambia de limit
      deleteModalClose()
    })
  }

  const descartarCerda = (request) => {
    props.descartarById(request, () => {
      props.setPageNumber(0) // Retorna a la pagina 1 cuando cambia de limit
      descarteModalClose()
  })
  }

  const paginatedObject = props.itemListado;

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
            <b>{paginatedObject.length}</b> <b>cerda(s)</b>
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
                    <TableCell align='center'>Estado</TableCell>
                    <TableCell align='center'>Línea genética</TableCell>
                    <TableCell align='center'> Orden Parto</TableCell>
                    <TableCell align='center'> Días no productivos</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                  <TableBody>
                {
                  props.loading && 
                    <TableRowsLoader 
                      rowsNum={5} 
                      cellsRow={["text", "status", "text", "text", "text", "action"]}
                    />
                  }
                  
                {!props.loading && paginatedObject.length !== 0 &&
                  (paginatedObject.map((element, idx) => {
                    return (
                      <TableRow hover key={idx}>
                        <TableCell>
                          <Typography noWrap>
                            {element && element.codigo || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          {element && element.estado &&
                            <CerdaEstadoChip estado={getEstadoCerdaNombre(element.estado) || ""}/>
                          }
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.lineaGeneticaNombre || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.ordenParto || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.diasNoProductivos || "0"}
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
                              {element.descartada === 1?
                                <AssignmentRoundedIcon/>
                                :<CreateRoundedIcon/>
                              }
                            </IconButton>
                            {element.descartada !== 1 && 
                            <>
                            <Tooltip title="Descartar cerda">
                              <IconButton  
                                  onClick={()=> openModalDescartada(element)}
                                  sx={{
                                      borderRadius:30, 
                                      marginRight:"15px"
                                  }}
                              >
                                  <HighlightOffRoundedIcon/>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remover cerda">
                              <IconButton color="error" 
                                  sx={{borderRadius:30}}
                                  onClick={()=> openModal(element)}
                                  >
                                  <DeleteRoundedIcon/>                          
                              </IconButton>
                            </Tooltip>
                              </>
                            }
                        </TableCell>
                      </TableRow>
                    );
                  }))
                }
                </TableBody>
              </Table>
            </TableContainer>
            {!props.loading && paginatedObject.length === 0 &&
                  <Box p={2}>
                    <Typography
                      sx={{
                        py: 5
                      }}
                      variant="h3"
                      fontWeight="normal"
                      color="text.secondary"
                      align="center"
                    >
                      No se encontraron cerdas
                    </Typography>
                  </Box>
                }
            <Box p={2}>
              <TablePagination
                component="div"
                count={props.numberOfResults}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleLimitChange}
                page={props.pageNumber}
                rowsPerPage={limit}
                rowsPerPageOptions={[5,10,15]}
              />
          </Box>
          </>
      </Card>
      {/* Eliminar */}
      {openDelete && <DeleteModal
        openConfirmDelete={openDelete}
        closeConfirmDelete={deleteModalClose}
        title={`Eliminar ${itemSingular}`}
        itemName={` la cerda ${currentItem?.nombre || "" }`}
        handleDeleteCompleted={deleteItem}
      />}
      {/* Descartar */}
      {openDescarte && <DescarteModal
        openConfirmDelete={openDescarte}
        closeConfirmDelete={descarteModalClose}
        title={`Descartar ${itemSingular}`}
        item={currentItem}
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