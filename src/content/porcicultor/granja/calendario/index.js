import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Button,
  Checkbox,
  Chip,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import BackdropLoading from 'src/components/BackdropLoading';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import useAuth from 'src/hooks/useAuth';
import useRefMounted from 'src/hooks/useRefMounted';
import { eventsFindAPI } from 'src/utils/apiUrls';
import { formatDate } from 'src/utils/dataFormat';
import { coloresCalendario, listadoCalendario, listadoCalendarioFilter, listadoCalendarioFilterFalse } from 'src/utils/defaultValues';
import { errorMessage } from 'src/utils/notifications';
import certifyAxios from 'src/utils/spAxios';

function CalendarioDash() {

  const [filter, setFilter] = useState(listadoCalendarioFilter);
  const [eventList, setEventList] = useState(undefined);
  const [currentItem, setCurrentItem] = useState({});
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMountedRef = useRefMounted();
  const {user} = useAuth();
  const calendarRef = useRef();
  const navigate = useNavigate();

  const getListado = useCallback(async (reqObj) => {
    setLoading(true)
      try {
        const response = await certifyAxios.post(eventsFindAPI, reqObj);
        if (isMountedRef.current) {
          if(response.data.total > 0) {
            const listPosition = response.data.list.map((element, index) => 
              ({...element, position: index})
            )
            console.log(listPosition);
            setEventList(listPosition);
          } else {
            setEventList([])
          }
        }
        setLoading(false)
      } catch (err) {
        setEventList([])
        setLoading(false)
        errorMessage("El servicio ha encontrado un error")
      }
  }, [isMountedRef])

  useEffect(() => {
      const reqObj = {
        "granjaId": user.granjaId
      };
      getListado(reqObj);
    }, [getListado]);

  const handleDateClick = (arg) => {
    console.log(arg.dateStr);
  };

  const filterEvents = (info, newFilter) => {

    const val = newFilter;
    if(!val.all && !val.parto && !val.servicio && !val.vacuna){
      return { ...info, display: "none" };
    }
    
    if(!val.parto && info.groupId === "parto"){
      return { ...info, display: "none" };
    }
    
    if(!val.servicio && info.groupId === "servicio"){
      return { ...info, display: "none" };
    }
    
    if(!val.vacuna && info.groupId === "vacuna"){
      return { ...info, display: "none" };
    }

    return { ...info, display: "auto" };
  }

  const handleChangeFilter = (event) => {
    if(event && event.target){
      let newFilter = listadoCalendarioFilter
      if(event.target.name === "all" && event.target.checked){
        newFilter = listadoCalendarioFilter
      } else if(event.target.name === "all" && !event.target.checked){
        newFilter = listadoCalendarioFilterFalse
      } else {
        newFilter ={
          ...filter,
          all: false,
          [event.target.name]: event.target.checked,
        };
        const todasLasPropiedadesSonTrue =  Object.keys(newFilter)
        .filter(propiedad => propiedad !== "all")
        .every(propiedad => newFilter[propiedad] === true);

        if (todasLasPropiedadesSonTrue) {
          newFilter.all = true;
        } else {
          newFilter.all = false;
        }
      }
      setFilter(newFilter)
      
      const arrayActualizado = eventList.map(objeto => {
        return filterEvents(objeto, newFilter)
      });
      console.log("ARRAY: ", arrayActualizado, calendarRef.current);
      setEventList(arrayActualizado)      
    }
  };



 

  const handleDateSet = (info) => {
    const start = info.start;
    const end = info.end;
    console.log("changing...", "start=", start, "end=",end, info)
  };

  const handleEventClick = (clickInfo) => {
    console.log("aaa", JSON.stringify(clickInfo.event));
    setCurrentItem(clickInfo.event)
  };

  const goToEvent = () => {
    if(currentItem){
      if(currentItem.groupId === "vacuna"){
        navigateToVacuna(currentItem)
      } else {
        navigateToServicio(currentItem)
      }
    }
  }

  const navigateToServicio = (info) => {
    navigate('/sp/porcicultor/manejo/servicio/lote-detalle/cerda-servicio', {
      state:{
        servicioId: info.extendedProps.itemId, 
        loteId: info.extendedProps.loteId, 
        loteNombre: info.extendedProps.loteCodigo
      }
    });
  };

  const navigateToVacuna = (info) => {
    navigate('/sp/porcicultor/sanidad/cerdas/lote-detalle', {state:{loteId: info.extendedProps.itemId}});
  };

  return (
    <>
      <Helmet>
        <title>Calendario</title>
      </Helmet>
      <PageTitleWrapper>
        <Grid container alignItems="center">
          <Grid item xs={10} md={6} sm={6} alignItems="left">
            <Typography variant="h3" component="h3" gutterBottom>
              Calendario
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <DialogContent
        sx={{
          py: theme.spacing(2),
          px: theme.spacing(0),
          mx: theme.spacing(4),
          mb: theme.spacing(3),
          mt: theme.spacing(0),
          /* background: 'white', */
          borderRadius: 2
        }}
      >
        <BackdropLoading open={loading}/>
        {eventList !== undefined &&
        <Grid container item xs={12} sm={12} md={12} spacing={2} mb={2}>
          <Grid item xs={12} sm={12} md={8}>
            <Paper
              sx={{
                px: theme.spacing(2),
                py: theme.spacing(1),
                textAlign: 'center'
              }}
              elevation={0}
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                headerToolbar={{
                  left: 'title prev,next',
                  center: '',
                  right: 'today dayGridMonth,dayGridWeek,listWeek'
                }}
                ref={calendarRef}
                dayMaxEvents
                initialView="dayGridMonth"
                weekends
                dateClick={(e) => handleDateClick(e)}
                locales={[esLocale]}
                locale="es"
                events={eventList}
                eventBackgroundColor='white'
                titleFormat={{ year: 'numeric', month: 'long' }}
                eventContent={(e) => renderEventContent(e, currentItem)}
                eventClick={handleEventClick}
                datesSet={handleDateSet}
                defaultAllDay
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Paper
              sx={{ px: theme.spacing(3), py: theme.spacing(1) }}
              elevation={0}
            >
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <Typography variant="h6" marginBottom={1}>
                  Tipo de Eventos
                </Typography>
                <FormControl>
                <FormGroup>
                    <FormControlLabel
                        control={
                          <Checkbox checked={filter.all} onChange={handleChangeFilter} name="all" />
                        }
                        label="Todos"
                      />
                      {listadoCalendario.map((i, index) => (
                        <FormControlLabel 
                        key={index} 
                        control={<Checkbox checked={filter[i.value]} onChange={handleChangeFilter}
                        name={i.value} 
                        sx={{color: i.color,  '&.Mui-checked': {
                          color: i.color,
                        },}}/>} 
                        label={i.texto} 
                        />
                      ))}
                </FormGroup>
                </FormControl>
              </div>
            </Paper>
            <Paper
              sx={{
                px: theme.spacing(3),
                py: theme.spacing(1),
                mt: theme.spacing(2)
              }}
              elevation={0}
            >
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <Grid item sx={{display: "flex", justifyContent: "space-between"}} mb={2}>
                  <Typography variant="h6" marginBottom={1} alignSelf="center">
                    Detalle de Evento
                  </Typography>
                  {currentItem && currentItem.title && <IconButton  
                      onClick={()=> {setCurrentItem({})}}
                      sx={{
                          borderRadius:30, 
                          marginRight:"15px",
                          fontSize: 10
                      }}
                      color='primary'
                  >
                      <CloseIcon/>
                  </IconButton>}
                </Grid>
                {(currentItem && currentItem.extendedProps && currentItem.extendedProps.itemId)? 
                <Grid item alignSelf="center">
                  <Typography color="#00009c"><b>{currentItem.title || ""}</b></Typography>
                  <Typography color="#00009c" className='mt'> 
                    <b>{`Fecha ${currentItem.extendedProps?.status === "Pendiente"? "Probable: ": ": "}`}</b> 
                    {`${formatDate(currentItem.start)}`}
                  </Typography>
                  <div>
                    <Chip 
                      sx={{my:2}}
                      label={currentItem.extendedProps?.status || ""} 
                      color={currentItem.extendedProps?.status === "Pendiente"? "proceso": "finalizado"} 
                    />
                  </div>
                  <div className='center-content'>
                    <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={goToEvent}
                      >
                        Ir a Evento
                      </Button>
                  </div>
                </Grid>
                : 
                <Typography>Seleccione un evento para mayor detalle</Typography>}
              </div>
            </Paper>
          </Grid>
        </Grid>}
      </DialogContent>
    </>
  );
}

function renderEventContent(eventInfo, current) {
  const styleGrid = {
    color: "black", cursor: "pointer"
  }
  return (
    <div style={{...styleGrid, 
        overflow: eventInfo.view.type === "dayGridWeek"? "auto":"hidden",
        whiteSpace: eventInfo.view.type === "dayGridWeek"? "normal":"nowrap"
      }}>
      <FiberManualRecordIcon sx={{color: (coloresCalendario[eventInfo.event.groupId] || coloresCalendario.vacuna), fontSize: 12}}/>
      <i>
      {(current?.extendedProps?.position !== null && current?.extendedProps?.position !== undefined 
      && current.extendedProps.position === eventInfo.event.extendedProps.position)?
        <b>{eventInfo.event.title}</b>
       : eventInfo.event.title
      }
        
        </i>
    </div>
  );
}

export default CalendarioDash;
