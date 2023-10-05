import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
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
  Typography,
  useMediaQuery
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import StatusTable from 'src/components/Form/StatusTable';
import TableRowsLoader from 'src/components/Table/TableRowsLoader';
import { formatDate, getEstadoMaternidadNombre } from 'src/utils/dataFormat';
import { allStatus, listEstadoServicio } from 'src/utils/defaultValues';

const statusList = listEstadoServicio()

const Results = (props) => {
  const [query, setQuery] = useState('');
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
    if(status !== allStatus.text){
      setStatus(allStatus.text)
    }
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
                    <TableCell align='center'>Código Camada</TableCell>
                    <TableCell align='center'>Nro. Lechones</TableCell>
                    <TableCell align='center'> Fecha parto</TableCell>
                    <TableCell align='center'> Estado Maternidad</TableCell>
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
                            {element && element?.codigoCamada || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element?.totalLechones || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                          {element && element?.fechaParto && formatDate(element?.fechaParto) || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography noWrap>
                            {element && element?.estado && getEstadoMaternidadNombre(element.estado) || ""}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                            {/* Actions */}
                            {element && element?.id && <IconButton  
                                onClick={()=> {editItem(element.id)}}
                                sx={{
                                    borderRadius:30, 
                                    marginRight:"15px"
                                }}
                                color='primary'
                            >
                               <AssignmentRoundedIcon/>
                            </IconButton>}
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