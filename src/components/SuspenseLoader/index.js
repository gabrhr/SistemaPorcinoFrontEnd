import { Box, LinearProgress } from '@mui/material';
import NProgress from 'nprogress';
import { useEffect } from 'react';

function SuspenseLoader() {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <LinearProgress size={64} thickness={4} color='primary'/>
    </Box>
  );
}

export default SuspenseLoader;
