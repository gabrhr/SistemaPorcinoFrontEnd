import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import {
  Box, Card,
  CircularProgress,
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
import { useState } from 'react';
import AddEditModal from './AddEditModal';
import DeleteModal from './DeleteModal';

const itemSingular = "Línea genética"

const Results = (props) => {
  const [limit, setLimit] = useState(10); // page size
  const [query, setQuery] = useState('');
  const [openDelete, setOpenDelete] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [currentItem, setCurrentItem] = useState({})
  const isRowBased = useMediaQuery('(min-width: 500px)');

  const handleQueryChange = (event) => {
    event.persist();
    setQuery(event.target.value);
    if(event && event.target && event.target.value === ""){
      props.setPageNumber(0);
      const reqObj = {
        "nombre": "",
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
      };
      props.onPageParamsChange(reqObj);
    } else if(event?.target?.value && event.target.value.length >= 1){
      props.setPageNumber(0);
      const reqObj = {
        "nombre": event.target.value,
        "pageNumber": 1,
        "maxResults": limit,
        "granjaId": props.granjaId
      };
      props.onPageParamsChange(reqObj);
    } 
  };

  const handlePageChange = (_event, newPage) => {
    props.setPageNumber(newPage);

    const reqObj = {
        "nombre": "",
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
        "pageNumber": 1,
        "maxResults": event.target.value,
        "granjaId": props.granjaId
    } 

    props.onPageParamsChange(reqObj);
  };


  const openModal = (item, deleteAccion = false) => {
    console.log(item)
    setCurrentItem(item)
    if(deleteAccion){
      setOpenDelete(true)      
    } else {
      setOpenEdit(true)
    }
  }

  const deleteModalClose = () => {
    setCurrentItem({})
    setOpenDelete(false)
  }

  const editModalClose = () => {
    setCurrentItem({})
    setOpenEdit(false)
  }

  
  const editItem = (request, resetForm) => {
    props.editById(request, () => {
      editModalClose()
      resetForm()
    })

  }
  
  const deleteItem = () => {
    props.deleteById(currentItem.id, () => {
        deleteModalClose()
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
                placeholder="Busque por nombre"
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
            <b>{paginatedObject.length}</b> <b>línea(s)</b>
          </Box>
        </Box>
        <Divider />
        {
          props.loading &&
         <div style={{ display: 'grid', justifyContent: 'center', paddingTop:"6rem", paddingBottom:"6rem"}}>
                <CircularProgress color="secondary" sx={{mb: "1rem", mx:"10rem"}}/>
          </div> 
        }
        {!props.loading  && paginatedObject.length === 0 &&
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
              No se encontraron líneas
            </Typography>
          </>
          }
          {!props.loading  && paginatedObject.length !== 0 &&
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre de la línea</TableCell>
                    <TableCell align='center'>Nro. Cerdas</TableCell>
                    <TableCell align='center'> Nro. Verracos</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedObject.map((element, idx) => {
                    return (
                      <TableRow hover key={idx}>
                        <TableCell>
                          <Typography noWrap>
                            {element && element.nombre || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.totalCerdas || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.totalVerracos || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                            {/* Actions */}
                            <IconButton  
                                onClick={()=> {openModal(element)}}
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
                                onClick={()=> openModal(element, true)}
                            >
                                <DeleteRoundedIcon/>                          
                            </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
        }
      </Card>
      {/* Editar */}
      <AddEditModal
        openConfirmModal={openEdit}
        closeConfirmModal={editModalClose}
        title={`Editar ${itemSingular}`}
        item= {currentItem || null}
        editMode
        handleCompleted={editItem}
        granjaId={props.granjaId}
      />
      {/* Eliminar */}
      <DeleteModal
        openConfirmDelete={openDelete}
        closeConfirmDelete={deleteModalClose}
        title={`Eliminar ${itemSingular}`}
        itemName={` la línea ${currentItem?.nombre || "" }`}
        handleDeleteCompleted={deleteItem}
      />
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