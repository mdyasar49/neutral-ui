import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading component to display while content is being fetched
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @param {boolean} props.fullScreen - If true, takes up full screen
 */
const Loading = ({ message = 'Loading...', size = 'medium', fullScreen = false }) => {
  const sizeMap = {
    small: 30,
    medium: 50,
    large: 70,
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const containerStyles = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      };

  return (
    <Box sx={containerStyles}>
      <CircularProgress
        size={spinnerSize}
        thickness={4}
        sx={{
          color: 'primary.main',
          marginBottom: '16px',
        }}
      />
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            marginTop: '16px',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
