import { Typography, useMediaQuery } from "@mui/material";
import { Box, useTheme } from "@mui/system";

/* const DividerWarning = styled(Divider)(
  () => `
      width: 50px;
      height: 6px;
      border-radius: 50px;
  `
);
 */
function CardNumber({background = null, valor= 0, texto = "", porcentaje = false}) {
    const theme = useTheme();
    const isRowBased = useMediaQuery('(min-width: 500px)');
    
    if(!isRowBased){
      return (
        <Box
          p={1}
        >
          <Typography noWrap gutterBottom>
          {texto || ""} :
          <b>{` ${valor || 0}`}</b>
          </Typography>
          
        </Box>
      )
    }

    return (
      <Box
          p={1}
          py={2}
        >
          <Typography noWrap gutterBottom>
          {texto || ""}
          </Typography>
          <Typography color={background || theme.colors.primary.main} variant="h1"
            sx={{
              fontSize: `${theme.typography.pxToRem(20)}`
            }}>
          {valor || 0} {porcentaje && "%"}
          </Typography>
        </Box>
    )

}



export default CardNumber;