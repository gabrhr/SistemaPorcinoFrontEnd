import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import LensRoundedIcon from '@mui/icons-material/LensRounded';


function ServicioStatusDetalle({ disabled, fecha, resultado = 0, gest = false }) {
  
    if(disabled && fecha === null){
        return <LensRoundedIcon sx={{color:"gray"}}/>
    }

    if(fecha !== null){
        if((gest && resultado === 0) ||(!gest && resultado === 1 )){
            return <HighlightOffRoundedIcon sx={{color:"#e42a2a"}}/>
        }
        return <CheckCircleOutlineRoundedIcon sx={{color:"#43aa43"}}/>
    } 

  return <AccessTimeRoundedIcon sx={{color:"#eca80b"}}/>;
}

export default ServicioStatusDetalle;
