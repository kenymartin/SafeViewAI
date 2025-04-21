import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

interface OverlayContainerProps {
  borderColor: string;
  borderWidth: number;
}

const OverlayContainer = styled(Box)<OverlayContainerProps>(({ borderColor, borderWidth }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& > div': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: `${borderWidth}px solid ${borderColor}`,
    boxShadow: `0 0 20px ${borderColor}, inset 0 0 20px ${borderColor}`,
    backdropFilter: 'blur(1px)',
    transition: 'all 0.3s ease-in-out',
    animation: 'borderPulse 3s infinite'
  },
  '@keyframes borderPulse': {
    '0%': {
      boxShadow: `0 0 20px ${borderColor}, inset 0 0 20px ${borderColor}`
    },
    '50%': {
      boxShadow: `0 0 30px ${borderColor}, inset 0 0 30px ${borderColor}`
    },
    '100%': {
      boxShadow: `0 0 20px ${borderColor}, inset 0 0 20px ${borderColor}`
    }
  }
}));

interface ContentOverlayProps {
  isActive: boolean;
  warningText?: string;
  borderColor?: string;
  borderWidth?: number;
  viewport?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

export const ContentOverlay: React.FC<ContentOverlayProps> = ({
  isActive,
  warningText,
  borderColor = '#00ff00',
  borderWidth = 5,
  viewport
}) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update dimensions when viewport changes
  useEffect(() => {
    if (viewport) {
      setDimensions({
        width: viewport.width,
        height: viewport.height
      });
    }
  }, [viewport]);

  if (!isActive) return null;

  return (
    <OverlayContainer 
      borderColor={borderColor} 
      borderWidth={borderWidth}
      sx={{
        width: viewport ? `${viewport.width}px` : '100vw',
        height: viewport ? `${viewport.height}px` : '100vh',
        position: viewport ? 'absolute' : 'fixed',
        top: viewport ? `${viewport.y}px` : 0,
        left: viewport ? `${viewport.x}px` : 0
      }}
    >
      <div>
        {warningText && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: borderColor,
              fontSize: '2rem',
              textAlign: 'center',
              textShadow: `0 0 10px ${borderColor}`,
              backgroundColor: 'rgba(0,0,0,0.85)',
              padding: '20px',
              borderRadius: '10px',
              maxWidth: '80%',
              border: `${borderWidth}px solid ${borderColor}`,
              animation: 'fadeIn 0.5s ease-in-out',
              boxShadow: `0 0 20px ${borderColor}`
            }}
          >
            {warningText}
          </Box>
        )}
      </div>
    </OverlayContainer>
  );
};

export default ContentOverlay; 