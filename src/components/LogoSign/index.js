import { Typography } from '@mui/material';

function Logo() {
  // const theme = useTheme();

  return (
    <Typography>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        color: 'white'
      }}>
        <span>SISTEMA PORCINO</span>
      </div>
    </Typography>
  );
}

export default Logo;
