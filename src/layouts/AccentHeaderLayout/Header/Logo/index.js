import { Typography } from '@mui/material';

import useAuth from 'src/hooks/useAuth';

function Logo() {

  const { user } = useAuth();

  return (
    <>
    <Typography>
    <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        color: 'white',
        fontSize: '17px'
      }}>
        <span>Sistema Porcino</span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        color: 'white',
        fontSize: '13px'
      }}>
        <span>{user?.granjaNombre || "Granja"}</span>
      </div>
    </Typography>
    </>
  );
}

export default Logo;
