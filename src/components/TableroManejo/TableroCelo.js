import { Divider, Stack, useMediaQuery } from "@mui/material";
import CardNumber from "./CardNumber";

function TableroCelo({item = null, showPorc = true}) {

  const isRowBased = useMediaQuery('(min-width: 500px)');
  
  const getPorcentaje = () => {
    if(item){

      const aptas = item?.totalAptas?? 0
      const total = item?.totalCerdas?? 1

      const porcentaje = (aptas / total) * 100;
      return porcentaje.toFixed(0);

    }

    return 0;
  };
  
  
  return (
      <Stack
        direction={isRowBased? "row": "column"}
        justifyContent="space-between"
        alignItems="stretch"
        divider={<Divider orientation="vertical" flexItem sx={{my: 2}}/>}
        spacing={0}
      >
            {showPorc && <CardNumber
              valor={getPorcentaje()}
              texto="Tasa de Aptas"
              background="#000000A6"
              porcentaje
            />}
            {showPorc && <CardNumber
              valor={item?.totalCerdas?? 0}
              background="#000000A6"
              texto="Total Cerdas"
            />}
            <CardNumber
              valor={item?.totalAptas?? 0}
              background="#00BB8E"
              texto="Aptas para servir"
            />
            <CardNumber
              valor={item?.totalDescartadas?? 0}
              background="error"
              texto="Descartadas"
            />
      </Stack>
    )

}



export default TableroCelo;