import { Chip, Typography } from "@mui/material";
import CerdaEstadoChip from "../CerdaEstadoChip";
import LoteEstadoChip from "../LoteEstadoChip";

function StatusChip({cerda = false, text="", lote=false}) {
    if(cerda){
        return <CerdaEstadoChip estado = {text || ""}/>
    }

    if(lote){
        return <LoteEstadoChip estado = {text || ""}/>
    }

    return(
        <Chip label={text || ""} variant='outlined' color='primary'/>
    )
}

function DataView({label = "", status = false, text="", cerda = false, inline= false, lote=false}) {

    if(status){
        return (
            <>
                <Typography mb={1}>
                    {label} {'\u00A0\u00A0'}
                    { inline && 
                         <StatusChip cerda={cerda} text={text} lote ={lote}/>
                    }
                </Typography>
                {!inline &&
                 <StatusChip  cerda={cerda} text={text} lote ={lote}/>
                }
            </>
        )
    }

    return (
        <>
            <Typography >
                {label}
            </Typography>
            <Typography color="#00009c" fontWeight="600" marginTop="8px">
                {text}
            </Typography>
        </>
    )
}

export default DataView;
