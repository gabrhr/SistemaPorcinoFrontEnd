import { Divider, Stack, useMediaQuery } from "@mui/material";
import CardNumber from "./CardNumber";

function TableroMaternidad({item = null, showPorc = true}) {

  const isRowBased = useMediaQuery('(min-width: 500px)');
  
  const getPorcentaje = () => {
    if(item){

      const paridas = item?.totalParidas?? 0
      const total = item?.totalCerdas?? 1

      const porcentaje = (paridas / total) * 100;
      return porcentaje.toFixed(1);

    }

    return 0;
  };
  
  
  return (
      <Stack
        direction={isRowBased? "row": "column"}
        justifyContent="space-between"
        alignItems="stretch"
        divider={<Divider orientation="vertical" flexItem sx={{my: isRowBased? 2:0}}/>}
        spacing={0}
      >
            {showPorc && <CardNumber
              valor={getPorcentaje()}
              texto="Tasa de parición"
              background="#000000A6"
              porcentaje
            />}
            {showPorc && <CardNumber
              valor={item?.totalCerdas?? 0}
              background="#000000A6"
              texto="Total Cerdas"
            />}
            <CardNumber
              valor={item?.totalGestando?? 0}
              texto="Gestando"
            />
            <CardNumber
              valor={item?.totalParidas?? 0}
              background="#00BB8E"
              texto="Paridas"
            />
            <CardNumber
              valor={item?.totalDestetadas?? 0}
              background="#FFA53A"
              texto="Destetadas"
            />
      </Stack>
    )

}



export default TableroMaternidad;