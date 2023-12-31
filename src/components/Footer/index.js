import { Box, Card, Typography, styled } from '@mui/material';

const FooterWrapper = styled(Card)(
  ({ theme }) => `
        border-radius: 0;
        margin-top: ${theme.spacing(4)};
`
);

function Footer() {
  return (
    <FooterWrapper className="footer-wrapper">
      <Box
        p={1}
        display={{ xs: 'block', md: 'flex' }}
        alignItems="center"
        textAlign={{ xs: 'center', md: 'left' }}
        justifyContent="space-between"
        color="F8F8F8"
      >
        <Box>
          <Typography variant="subtitle1">
            &copy; 2023 - SISTEMA PORCINO
          </Typography>
        </Box>
      </Box>
    </FooterWrapper>
  );
}

export default Footer;
