import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { ipcRenderer } from 'electron';

interface ViewportDimensions {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

interface VideoPlayerViewportProps {
  dimensions?: ViewportDimensions;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const VideoPlayerViewport: React.FC<VideoPlayerViewportProps> = ({
  dimensions,
  width,
  height,
  x,
  y,
  isFullscreen = false,
  onFullscreenChange,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        ipcRenderer.send('exit-fullscreen');
        onFullscreenChange?.(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, onFullscreenChange]);

  const handleDoubleClick = () => {
    if (isFullscreen) {
      ipcRenderer.send('exit-fullscreen');
    } else {
      ipcRenderer.send('enter-fullscreen');
    }
    onFullscreenChange?.(!isFullscreen);
  };

  const viewportStyle = {
    position: 'absolute' as const,
    top: dimensions?.y ?? y ?? 0,
    left: dimensions?.x ?? x ?? 0,
    width: dimensions?.width ?? width ?? '100%',
    height: dimensions?.height ?? height ?? '100%',
    overflow: 'hidden',
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(0, 255, 0, 0.3)',
    boxSizing: 'border-box',
    ...(isFullscreen
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          border: '4px solid rgba(0, 255, 0, 0.3)',
        }
      : {}),
  };

  return (
    <Box
      data-testid="video-player-viewport"
      sx={viewportStyle}
      onDoubleClick={handleDoubleClick}
      className={isFullscreen ? 'safe-border' : ''}
    >
      <Box
        data-testid="video-player-content"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      />
    </Box>
  );
}; 