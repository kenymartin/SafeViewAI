import React from 'react';
import { Box, Typography } from '@mui/material';

const TestPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        background: 'transparent',
        color: 'white',
        position: 'relative',
        zIndex: 9999
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '4rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0,0,0,0.5)',
          color: 'white'
        }}
      >
        Hello World
      </Typography>
    </Box>
  );
};

export default TestPage; 