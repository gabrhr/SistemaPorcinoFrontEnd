
/* eslint-disable */

import SavingsTwoToneIcon from '@mui/icons-material/SavingsTwoTone';
import ShowChartTwoToneIcon from '@mui/icons-material/ShowChartTwoTone';
import dayjs from 'dayjs';
import { useState } from 'react';
import Chart from 'react-apexcharts';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import Text from 'src/components/Text';
import useAuth from 'src/hooks/useAuth';
import { estCerdasAPI } from 'src/utils/apiUrls';
import { successMessage } from 'src/utils/notifications';
import certifyAxios, { showUserErrors } from 'src/utils/spAxios';


const EmptyResultsWrapper = styled('img')(
  ({ theme }) => `
      max-width: 100%;
      width: auto;
      height: ${theme.spacing(17)};
      margin-top: ${theme.spacing(2)};
`
);

function CerdasReport({setLoading, promOrdenParto = 0, totalCerdas = 0}) {
  const {user} = useAuth();

  const theme = useTheme();

  const defaultOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1
    },
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      strokeDashArray: 5,
      borderColor: theme.colors.alpha.black[10]
    },
    dataLabels: {
      enabled: true,
    },
    legend:  {
      tooltipHoverFormatter: function(val) {
        return val
      },
      position: 'top',
    },
    markers: {
      size: 1
    },
    stroke: {
      curve: 'smooth',
      lineCap: 'butt',
      width: 3
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      },
      title: {
        text: 'Periodo',
        style: {
          fontSize:  '12px',
          fontWeight:  'regular',
          colors: theme.palette.text.secondary
        },
      }
    },
    yaxis: {
      tickAmount: 3,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  }

  const defaultProlificidad = {
    ...defaultOptions,
    colors: [theme.colors.success.main,theme.colors.error.main],
    
  };

  const defaultReposicion = {
    ...defaultOptions,
    colors: [theme.colors.error.main, theme.colors.success.main],
    
  };

  const [prolifChart, setProlifChart] = useState([]);
  const [prolifChartOp, setProlifChartOp] = useState(defaultProlificidad);
  const [repoChart, setRepoChart] = useState([]);
  const [reporChartOp, setRepoChartOp] = useState(defaultReposicion);
  const [inicio, setInicio] = useState(dayjs(new Date()));  
  const [fin, setFin] = useState(dayjs(new Date()));   

  const handleInicio = (e) =>{
    setInicio(e)
  }

  const handleFin = (e) =>{
    setFin(e)
  }

  const generarResultados = async () => {
      try {
        const reqObj = {
          "granjaId": user.granjaId, 
          "inicio": inicio.year(),
          "fin": fin.year()
        };
        
        setLoading(true)
        const response = await certifyAxios.post(estCerdasAPI, reqObj);
        if (response?.status === 200 && response.data) {
          setProlifChart(response?.data?.prolificidad?.anual?.chartData??[])
          setProlifChartOp({...defaultProlificidad, labels: response?.data?.prolificidad?.anual?.label?? []})
          setRepoChart(response?.data?.reposicion?.anual?.chartData??[])
          setRepoChartOp({...defaultReposicion, labels: response?.data?.reposicion?.anual?.label?? []})
          successMessage("Resultados obtenidos satisfactoriamente")
          setLoading(false) 
        }
      } catch (error) {
         setLoading(false) 
         showUserErrors(error, "No se ha podido generar. Inténtelo de nuevo")
       }
  };
  


  

  return (
    <Grid container mt={3}>
      <Grid item container xs={12} sm={12} md={12}  spacing={2} mb={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Card elevation={0} variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: `${theme.colors.success.main}`,
                    color: `${theme.palette.success.contrastText}`
                  }}
                >
                  <SavingsTwoToneIcon />
                </Avatar>
              <Box ml={1.5}>
                <Typography
                  gutterBottom
                  variant="subtitle2"
                  sx={{
                    fontSize: `${theme.typography.pxToRem(16)}`
                  }}
                >
                  Total Cerdas
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${theme.typography.pxToRem(14)}`
                  }}
                >
                  <Text color="success">{totalCerdas || 0}</Text>
                </Typography>
              </Box>
            </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Card elevation={0} variant="outlined">
            <CardContent>
                <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: `${theme.colors.warning.main}`,
                    color: `${theme.palette.warning.contrastText}`
                  }}
                >
                  <ShowChartTwoToneIcon />
                </Avatar>
              <Box ml={1.5}>
                <Typography
                  gutterBottom
                  variant="subtitle2"
                  sx={{
                    fontSize: `${theme.typography.pxToRem(16)}`
                  }}
                >
                  Orden de Parto promedio
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${theme.typography.pxToRem(14)}`
                  }}
                >
                  <Text color="warning">{promOrdenParto || 0}</Text>
                </Typography>
              </Box>
            </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={12} md={12}>
        <DatePicker
          id="periodo-inicial" 
          label='Periodo inicial' 
          value={inicio}
          onChange={handleInicio}
          views={['year']} 
          sx={{mr: 2, mb:1}}
          slotProps={{
            textField: {
              variant: "outlined",
              size: "small"
            }
        }}
        />
        <DatePicker 
          id="periodo-final"
          label='Periodo inicial' 
          value={fin}
          onChange={handleFin}
          views={['year']} 
          sx={{mr: 2, mb:1}}
          slotProps={{
            textField: {
              variant: "outlined",
              size: "small"
            }
        }}
        />
        <Button
          size="small"
          color="secondary"
          variant="outlined"
          onClick={generarResultados}
        >
          Generar
        </Button>
      </Grid>
      <Grid container item xs={12} sm={12} md={12} spacing={2} mb={2} pt={2}>
        <Grid item xs={12} sm={12} md={6}>
          <Card elevation={0}>
            <CardHeader
              title="Prolificidad"
            />
            <Divider
              sx={{
                display: { xs: 'none', sm: 'flex' }
              }}
            />
            <CardContent>
              <Chart
                  options={prolifChartOp}
                  series={prolifChart}
                  type="line"
                  height={306}
                />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
        <Card elevation={0}>
            <CardHeader
              title="Descarte e Ingreso de Cerdas"
            />
            <Divider
              sx={{
                display: { xs: 'none', sm: 'flex' }
              }}
            />
            <CardContent>
              <Chart
                  options={reporChartOp}
                  series={repoChart}
                  type="line"
                  height={306}
                />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

function SinResultado (){
  return(
    <Box
      sx={{
        textAlign: 'center'
      }}
    >
      <EmptyResultsWrapper src="/static/images/placeholders/illustrations/1.svg" />

      <Typography
        align="center"
        variant="h4"
        fontWeight="normal"
        color="text.secondary"
        sx={{
          mt: 3
        }}
        gutterBottom
      >
        No se han encontrado resultados 
      </Typography>
    </Box>
  )
}

export default CerdasReport;
