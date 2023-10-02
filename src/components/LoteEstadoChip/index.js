import { Chip } from '@mui/material';

function LoteEstadoChip({ estado = "" }) {
/*   const loteBackground = {
    enProceso: '#FFFFF4AB',
    finalizado: '#F0FFEAAB',
    precebo: '#EAFBFFAB',
    cebo: '#FFFCEAAB'
  };

  const loteColor = {
    enProceso: '#C9CD0',
    finalizado: '#44B400',
    precebo: '#0089B4',
    cebo: '#B48100'
  } */

  const getColor = () => {
    switch (estado) {
      case 'En Proceso':
        return "proceso";
      case 'Finalizado':
        return "finalizado";
      case 'Precebo':
        return "precebo";
      case 'Cebo':
        return "cebo";
      default:
        return "proceso";
    }
  };

  return <Chip label={estado && estado.toLocaleUpperCase() || ""} color={getColor()} />;
}

export default LoteEstadoChip;
