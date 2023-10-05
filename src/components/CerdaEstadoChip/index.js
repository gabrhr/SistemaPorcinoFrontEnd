import { Chip } from '@mui/material';

function CerdaEstadoChip({ estado }) {
  const cerda = {
    reemplazo: '#e2e2e280',
    vacia: '#fffbc8',
    porservir: '#FFEFC580',
    servida: '#D7EDCD80',
    gestante: '#a7ebeb80',
    parida: '#D8E3FF80',
    lactante: '#F2EDFF80',
    destetada: '#F8FFCF80',
    descartada: '#FFCBCB80'
  };

  const getColorByState = () => {
    switch (estado) {
      case 'Reemplazo':
        return cerda.reemplazo;
      case 'Por servir':
        return cerda.porservir;
      case 'Servida':
        return cerda.servida;
      case 'Gestante':
        return cerda.gestante;
      case 'Parida':
        return cerda.parida;
      case 'Lactante':
        return cerda.lactante;
      case 'Destetada':
        return cerda.destetada;
      case 'Descartada':
        return cerda.descartada;
      case 'Vacia':
        return cerda.vacia;
      default:
        return cerda.reemplazo;
    }
  };

  return <Chip label={estado || ""} sx={{background: getColorByState()}} />;
}

export default CerdaEstadoChip;
