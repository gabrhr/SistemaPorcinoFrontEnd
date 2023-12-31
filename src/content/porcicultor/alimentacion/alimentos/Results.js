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
  Typography,
  useMediaQuery
} from '@mui/material';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import StatusTable from 'src/components/Form/StatusTable';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import { alimentoCategorias, allStatus } from 'src/utils/defaultValues';
import DeleteModal from './DeleteModal';

const itemSingular = "Alimento"

const statusList = [{value:"sin", text:"Sin Stock"}]

const Results = (props) => {
  const [limit, setLimit] = useState(10); // page size
  const [query, setQuery] = useState('');
  const [openDelete, setOpenDelete] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
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
        "nombre": "",
        "stock": "",
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
      };
      props.onPageParamsChange(reqObj);
    } else if(event?.target?.value && event.target.value.length >= 1){
      props.setPageNumber(0);
      const reqObj = {
        "nombre": event.target.value,
        "stock": "",
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
      };
      props.onPageParamsChange(reqObj);
    } 
  };

  const handleChangeStatus = (value) => {
    const reqObj = {
        "nombre": "",
        "stock": value,
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
    }
    props.onPageParamsChange(reqObj);
  }

  const handlePageChange = (_event, newPage) => {
    props.setPageNumber(newPage);

    const reqObj = {
      "nombre": "",
      "stock": "",
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
        "nombre": "",
        "stock": "",
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

  const deleteModalClose = () => {
    setCurrentItem({})
    setOpenDelete(false)
  }

 
  const editItem = (id) => {
    props.navigateToDetalle(id)

  }
  
  const deleteItem = () => {
    setLoadingDelete(true)
    props.deleteById(currentItem.id, () => {
      deleteModalClose()
      setLoadingDelete(false)
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
            <b>{paginatedObject.length}</b> <b>alimento(s)</b> {/* change */}
          </Box>
          <StatusTable
            nombre="Cantidad disponible"
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
                    <TableCell>Nombre</TableCell>
                    <TableCell align='center'>Categoria</TableCell>
                    <TableCell align='center'>Cantidad Actual (kg)</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {props.loading && 
                    <TableRowsLoader
                      rowsNum={5} 
                      action
                      cellsNum={3}
                    />
                }
                {!props.loading && paginatedObject.length !== 0 &&
                  (paginatedObject.map((element, idx) => {
                    return (
                      <TableRow hover key={idx}>
                        <TableCell>
                          <Typography noWrap>
                            {element && element.nombre || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {(element && element.categoria && alimentoCategorias[element.categoria])?? ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.cantidadActual || "0"}
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
                                <CreateRoundedIcon/>
                            </IconButton>
                            <IconButton color="error" 
                                sx={{borderRadius:30}}
                                onClick={()=> openModal(element)}
                                >
                                <DeleteRoundedIcon/>                          
                            </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  }))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            {!props.loading && paginatedObject.length === 0 &&
              <>
                <Typography
                  sx={{
                    py: 10
                  }}
                  variant="h3"
                  fontWeight="normal"
                  color="text.secondary"
                  align="center"
                >
                  No se encontraron alimentos
                </Typography>
              </>
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
        itemName={` el alimento ${currentItem?.nombre || "" } y sus controles`}
        handleDeleteCompleted={deleteItem}
        loadingDelete={loadingDelete}
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