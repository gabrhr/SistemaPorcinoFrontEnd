import AssignmentIcon from '@mui/icons-material/Assignment';
import CachedIcon from '@mui/icons-material/Cached';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SavingsIcon from '@mui/icons-material/Savings';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';

const menuItems = [
  {
    heading: '',
    items: [
      {
        name: 'Porcinos',
        icon: SavingsIcon,
        link: '',
        items: [
          {
            name: 'Lineas genéticas',
            link: '/sp/porcicultor/porcinos/lineas'
          },
          {
            name: 'Verracos',
            link: '/sp/porcicultor/porcinos/verracos'
          },
          {
            name: 'Cerdas',
            link: '/sp/porcicultor/porcinos/cerdas'
          },
          {
            name: 'Lotes',
            link: '/sp/porcicultor/porcinos/lotes'
          }
        ]
      },
      {
        name: 'Manejo',
        icon: CachedIcon,
        link: '',
        items: [
          {
            name: 'Celo',
            link: '/sp/porcicultor/manejo/celo'
          },
          {
            name: 'Servicio y Gestación',
            link: '/sp/porcicultor/manejo/servicio'
          },
          {
            name: 'Maternidad',
            link: '/sp/porcicultor/manejo/maternidad'
          },
          {
            name: 'Engorde',
            link: '/sp/porcicultor/manejo/engorde'
          }
        ]
      },
      {
        name: 'Sanidad',
        icon: LocalHospitalIcon,
        link: '',
        items: [
          {
            name: 'Control Cerdas',
            link: '/sp/porcicultor/sanidad/cerdas'
          } ,
          {
            name: 'Control Lechones',
            link: '/sp/porcicultor/sanidad/engorde'
          }
          /* ,
          {
            name: 'Calendario',
            link: '/sp/porcicultor/sanidad/calendario'
          } */
        ]
      },
      {
        name: 'Alimentación',
        icon: ShoppingBasketIcon,
        link: '',
        items: [
          {
            name: 'Alimentos',
            link: '/sp/porcicultor/alimentacion/alimentos'
          },
          {
            name: 'Control Cerdas',
            link: '/sp/porcicultor/alimentacion/cerdas'
          } ,
          {
            name: 'Control Engorde',
            link: '/sp/porcicultor/alimentacion/engorde'
          }
        ]
      },
      {
        name: 'Mi Granja',
        icon: AssignmentIcon,
        link: '',
        items: [
          /* {
            name: 'Estadísticas',
            link: '/sp/porcicultor/granja/estadisticas'
          }, */
          {
            name: 'Parámetros',
            link: '/sp/porcicultor/granja/parametros'
          }/* ,
          {
            name: 'Corrales',
            link: '/sp/porcicultor/granja/corrales'
          } */
        ]
      }
    ]
  }
];

export default menuItems;
