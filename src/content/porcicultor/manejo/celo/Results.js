import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
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
import { useRef, useState } from 'react';
import StatusTable from 'src/components/Form/StatusTable';
import LoteEstadoChip from 'src/components/LoteEstadoChip';
import { formatDate } from 'src/utils/dataFormat';
import { allStatus, celoEstado, listEstadoLotes } from 'src/utils/defaultValues';


const statusList = listEstadoLotes()

const Results = (props) => {
  const [limit, setLimit] = useState(10); // page size
  const [query, setQuery] = useState('');
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
        "pageNumber": 1,
        "maxResults": event.target.value,
        "granjaId": props.granjaId
    } 

    props.onPageParamsChange(reqObj);
  };
 
  const editItem = (e) => {
    props.navigateToDetalle(e.id || -1 , e.codigo || "", e.estado !== celoEstado.finalizado)

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
                placeholder="Busque por código de lote"
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
            <b>{paginatedObject.length}</b> <b>celo(s)</b> {/* change */}
          </Box>
          <StatusTable
            actionRef = {statusRef}
            setOpenStatus ={setOpenStatus}
            openStatus = {openStatus}
            status = {status}
            setStatus = {setStatus}
            menuList = {statusList}
            handleChange = {handleChangeStatus}
            nombre="Estado Lote"
          />
        </Box>
        <Divider />
        {
          props.loading &&
         <div style={{ display: 'grid', justifyContent: 'center', paddingTop:"6rem", paddingBottom:"6rem"}}>
                <CircularProgress color="secondary" sx={{mb: "1rem", mx:"10rem"}}/>
          </div> 
        }

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
              No se encontraron celos
            </Typography>
          </>
        }
        {!props.loading && paginatedObject.length !== 0 &&
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código Lote</TableCell>
                    <TableCell align='center'>Total Cerdas</TableCell>
                    <TableCell align='center'>Cerdas Aptas Servicio</TableCell>
                    <TableCell align='center'>Fecha Apertura</TableCell>
                    <TableCell align='center'> Estado Lote</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedObject.map((element, idx) => {
                    return (
                      <TableRow hover key={idx}>
                        <TableCell>
                          <Typography noWrap>
                            {element && element.codigo || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.totalCerdas || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.totalAptas || "0"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element.fechaApertura && 
                            formatDate(element.fechaApertura) || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            <LoteEstadoChip
                            estado={element && element.estado || ""}
                            />
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                            {/* Actions */}
                            <IconButton  
                                onClick={()=> {editItem(element)}}
                                sx={{
                                    borderRadius:30, 
                                    marginRight:"15px"
                                }}
                            >
                                <ArrowForwardIosRoundedIcon/>
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