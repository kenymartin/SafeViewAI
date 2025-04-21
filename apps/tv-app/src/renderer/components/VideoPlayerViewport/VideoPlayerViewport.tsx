import React, { useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';

interface ViewportDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface VideoPlayerViewportProps {
  dimensions: ViewportDimensions;
  isFullscreen: boolean;
  onFullscreenChange: (isFullscreen: boolean) => void;
}

export const VideoPlayerViewport: React.FC<VideoPlayerViewportProps> = ({
  dimensions,
  isFullscreen,
  onFullscreenChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        onFullscreenChange(false);
        ipcRenderer.send('exit-fullscreen');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onFullscreenChange]);

  const handleDoubleClick = async () => {
    if (!isFullscreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        onFullscreenChange(true);
        ipcRenderer.send('enter-fullscreen');
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      onFullscreenChange(false);
      ipcRenderer.send('exit-fullscreen');
    }
  };

  const viewportStyle: React.CSSProperties = isFullscreen
    ? {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        transform: 'none',
        zIndex: 9999,
      }
    : {
        position: 'absolute',
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        left: `${dimensions.x}px`,
        top: `${dimensions.y}px`,
        transform: 'none',
      };

  return (
    <div
      ref={containerRef}
      style={viewportStyle}
      onDoubleClick={handleDoubleClick}
      data-testid="video-player-viewport"
      className={isFullscreen ? 'safe-border' : ''}
    />
  );
}; 