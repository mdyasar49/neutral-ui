import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { Box, Container, Typography, Stack } from '@mui/material';

// ----------------------------------------------------------------------

const Page = ({ children, title, subtitle, sx, ...other }) => (
  <Box sx={{ py: 3, ...sx }} {...other}>
    <Helmet>
      <title>{`${title} | Neutral UI`}</title>
    </Helmet>
    
    <Container maxWidth="xl">
      {title && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      )}
      {children}
    </Container>
  </Box>
);

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  sx: PropTypes.object,
};

export default Page;
