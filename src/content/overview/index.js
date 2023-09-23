import { Box, Card, Container, styled } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Footer from 'src/components/Footer';
import { Navigate } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';

import Logo from 'src/components/LogoSign';
import Hero from './Hero';

const HeaderWrapper = styled(Card)(
  ({ theme }) => `
    width: 100%;
    display: flex;
    align-items: center;
    height: ${theme.spacing(5)};
    margin-bottom: ${theme.spacing(10)};
`
);

const OverviewWrapper = styled(Box)(
  ({ theme }) => `
    overflow: auto;
    background: ${theme.palette.common.white};
    flex: 1;
    overflow-x: hidden;
`
);

function Overview() {

  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    console.log(user);
    const { role } = user.person;
    if (role === 1) return <Navigate to="/sp/porcicultor" />;
    if (role === 0) return <Navigate to="/sp/admin" />;
  }  else {

    return <Navigate to="/account/login" />
    
  }

  return (
    <OverviewWrapper>
      <Helmet>
        <title>Sistema Porcino</title>
      </Helmet>
      <HeaderWrapper>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center">
            <Logo />
          </Box>
        </Container>
      </HeaderWrapper>
      <Hero />
      <Footer />
    </OverviewWrapper>
  );
}

export default Overview;
