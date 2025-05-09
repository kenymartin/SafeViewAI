import React from 'react';
import { Box } from '@mui/material';

interface ContentOverlayProps {
  children: React.ReactNode;
  isFullscreen?: boolean;
}

const ContentOverlay: React.FC<ContentOverlayProps> = ({ children, isFullscreen = false }) => {
  return (
    <Box
      data-testid="content-overlay"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
        ...(isFullscreen && {
          position: 'fixed',
        }),
      }}
    >
      <Box
        data-testid="content-overlay-inner"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ContentOverlay; 