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

const DotLegend = styled('span')(
  ({ theme }) => `
    border-radius: 22px;
    width: ${theme.spacing(1.5)};
    height: ${theme.spacing(1.5)};
    display: inline-block;
    margin-right: ${theme.spacing(0.5)};
`
);

const estadosLechon = ["Lactante", "Precebo", "Cebo", "Cebado", "Muerto"]

function LechonesEstados({general = {}}) {
  const [chartSeries, setChartSeries] = useState([]);
  const [total, setTotal] = useState(0);

  const theme = useTheme();

  const chartColors = [
    "#b87eff",
    "#4EACF4",
    "#FA8369",
    theme.palette.success.main,
    '#fc8d62'        
  ]

  useEffect(() => {
    if(general && general.cerdas){
      const list = Object.values(estadosLechon).map(e => {
        if(general.lechones[e] !== undefined){
          return general.lechones[e]
        }

        return 0
      })

      setChartSeries(list)
    }

    if(general && general.totalLechones){
      setTotal(general.totalLechones || 0)
    }
  }, [general]);

  const sales = {
    datasets: [
      {
        backgroundColor: chartColors
      }
    ],
    labels: estadosLechon
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
          size: '65%'
        }
      }
    },
    colors: chartColors,
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
      <CardHeader title="Estado de Lechones" />
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
                lechones
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

export default LechonesEstados;
