import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#1e293b', color: 'white', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} Notify. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
