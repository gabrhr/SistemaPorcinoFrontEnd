import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { getPorcentajeFormato } from 'src/utils/dataFormat';
import { cerdaEstados } from 'src/utils/defaultValues';

const DotLegend = styled('span')(
  ({ theme }) => `
    border-radius: 22px;
    width: ${theme.spacing(1.5)};
    height: ${theme.spacing(1.5)};
    display: inline-block;
    margin-right: ${theme.spacing(0.5)};
`
);

const estadosCerda = cerdaEstados;

const chartColors = {
  destetada: '#66c2a5',
  descartada: '#fc8d62',
  gestante:'#a6d854',
  lactante:'#34b3e7',
  parida: '#e78ac3',
  porservir: '#fdc633',
  servida: '#00cc41',
  reemplazo: '#c4cada',
  vacia:'#fec091'
}

function CerdaEstados({general = {}}) {
  
  const [chartSeries, setChartSeries] = useState([]);
  const [total, setTotal] = useState(0);

  const theme = useTheme();

  useEffect(() => {
    if(general && general.cerdas){
      const list = Object.values(estadosCerda).map(e => {
        if(general.cerdas[e] !== undefined){
          return general.cerdas[e]
        }

        return 0
      })
      
      setChartSeries(list)
    }

    if(general && general.totalCerdas){
      setTotal(general.totalCerdas || 0)
    }
  }, [general]);

  const sales = {
    datasets: [
      {
        backgroundColor: Object.values(chartColors)
      }
    ],
    labels: Object.values(estadosCerda)
  };

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%'
        }
      }
    },
    colors: Object.values(chartColors),
    dataLabels: {
      enabled: true,
      formatter(val) {
        return `${getPorcentajeFormato(val)}%`;
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: theme.colors.alpha.black[50],
        opacity: 0.5
      }
    },
    fill: {
      opacity: 1
    },
    labels: sales.labels,
    legend: {
      labels: {
        colors: theme.colors.alpha.trueWhite[100]
      },
      show: false
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  

  return (
    <Card elevation={0}>
      <CardHeader title="Estado de Cerdas" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid
            md={6}
            item
          >
            <Chart
              height={228}
              options={chartOptions}
              series={chartSeries}
              type="donut"
            />
            <div>
              <Typography variant="h6" className='center-content'>
                {total}
              </Typography>
              <Typography className='center-content'>
                cerdas
              </Typography>
            </div>
          </Grid>
          <Grid md={5} item display="flex" alignItems="center">
            <Box>
              {sales.labels.map((label, i) => (
                <Typography
                  key={label}
                  variant="body2"
                  sx={{
                    py: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2
                  }}
                >
                  <DotLegend
                    style={{
                      background: `${sales.datasets[0].backgroundColor[i]}`
                    }}
                  />
                  <span
                    style={{
                      paddingRight: 10,
                      color: `${sales.datasets[0].backgroundColor[i]}`
                    }}
                  >
                    {total && getPorcentajeFormato((chartSeries[i]/total)*100)}%
                  </span>
                  {label}
                </Typography>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default CerdaEstados;
