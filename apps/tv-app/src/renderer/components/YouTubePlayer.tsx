import React, { useEffect, useRef, useState } from 'react';
import { ContentWarning } from './PrePlayAnalysis';

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  isFullscreen?: boolean;
}

declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: any;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onTimeUpdate,
  isFullscreen = false
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else {
      setIsAPIReady(true);
    }
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isAPIReady) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        fs: 1, // Enable fullscreen button
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            // Start time update interval when playing
            const timeUpdateInterval = setInterval(() => {
              const currentTime = playerRef.current?.getCurrentTime() || 0;
              onTimeUpdate?.(currentTime);
            }, 1000);

            return () => clearInterval(timeUpdateInterval);
          }
        }
      }
    });
  }, [isAPIReady, videoId]);

  // Handle viewport adaptation
  useEffect(() => {
    if (!containerRef.current) return;

    const adaptToViewport = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const aspectRatio = 16 / 9;

      let width = isFullscreen ? viewportWidth : Math.min(800, viewportWidth - 40);
      let height = width / aspectRatio;

      if (isFullscreen && height > viewportHeight) {
        height = viewportHeight;
        width = height * aspectRatio;
      }

      containerRef.current!.style.width = `${width}px`;
      containerRef.current!.style.height = `${height}px`;
      containerRef.current!.style.transition = 'all 0.5s ease-in-out';
    };

    // Initial adaptation
    adaptToViewport();

    // Handle window resize
    window.addEventListener('resize', adaptToViewport);
    return () => window.removeEventListener('resize', adaptToViewport);
  }, [isFullscreen]);

  return (
    <div 
      ref={containerRef}
      className="youtube-player-container"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        id="youtube-player"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}; 