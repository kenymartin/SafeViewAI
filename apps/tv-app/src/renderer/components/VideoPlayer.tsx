import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { ContentOverlay } from './ContentOverlay';

interface VideoStats {
  resolution: string;
  aspectRatio: string;
  fps: number;
  bitrate: string | number;
}

interface VideoMetadata {
  title: string;
  duration: number;
  resolution: string;
  quality?: string;
  platform?: string;
  url: string;
  width: number;
  height: number;
  isLocal?: boolean;
  stats?: VideoStats;
  viewport?: { width: number; height: number; x: number; y: number };
}

interface VideoPlayerProps {
  videoSource: string;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVideoIdentified?: (metadata: VideoMetadata) => void;
  overlayBorderColor?: string;
  overlayBorderWidth?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSource,
  onPlaybackStateChange,
  onTimeUpdate,
  onVideoIdentified,
  overlayBorderColor = '#00ff00',
  overlayBorderWidth = 5
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [viewport, setViewport] = useState<{width: number; height: number; x: number; y: number} | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle viewport updates
  useEffect(() => {
    const handleViewportUpdate = (_event: any, viewport: { width: number; height: number; x: number; y: number }) => {
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const targetAspectRatio = 16 / 9;
        const currentAspectRatio = viewport.width / viewport.height;
        
        let newWidth = viewport.width;
        let newHeight = viewport.height;
        
        if (currentAspectRatio > targetAspectRatio) {
          // Too wide, adjust width
          newWidth = viewport.height * targetAspectRatio;
        } else {
          // Too tall, adjust height
          newHeight = viewport.width / targetAspectRatio;
        }
        
        setDimensions({
          width: newWidth,
          height: newHeight
        });
      }
    };

    window.electron.on('viewport-updated', handleViewportUpdate);
    return () => {
      window.electron.off('viewport-updated', handleViewportUpdate);
    };
  }, []);

  // Handle window state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = document.fullscreenElement !== null;
      setIsFullscreen(isFullscreenNow);
    };

    const handleMaximizeChange = () => {
      const isMaximizedNow = window.electron.isMaximized();
      setIsMaximized(isMaximizedNow);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.electron.on('maximize', handleMaximizeChange);
    window.electron.on('unmaximize', handleMaximizeChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.electron.off('maximize', handleMaximizeChange);
      window.electron.off('unmaximize', handleMaximizeChange);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isFullscreen && !isMaximized) {
        const container = containerRef.current;
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          setDimensions({ width, height });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, isMaximized]);

  // Handle TV viewport sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && !isFullscreen) {
        const { innerWidth, innerHeight } = window;
        const aspectRatio = 16 / 9;
        
        let width = innerWidth;
        let height = width / aspectRatio;
        
        if (height > innerHeight) {
          height = innerHeight;
          width = height * aspectRatio;
        }
        
        // Only apply these styles if we don't have a viewport from main process
        if (!viewport) {
          containerRef.current.style.width = `${width}px`;
          containerRef.current.style.height = `${height}px`;
          containerRef.current.style.position = 'relative';
          containerRef.current.style.left = 'auto';
          containerRef.current.style.top = 'auto';
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, viewport]);

  // Listen for video metadata from main process
  useEffect(() => {
    const handleVideoFullscreen = (_: any, data: VideoMetadata & { viewport?: { width: number; height: number; x: number; y: number } }) => {
      setMetadata(data);
      onVideoIdentified?.(data);
      
      // Handle viewport adaptation
      if (data.viewport && containerRef.current) {
        const { width, height, x, y } = data.viewport;
        
        // Apply viewport styles
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.height = `${height}px`;
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.left = `${x}px`;
        containerRef.current.style.top = `${y}px`;
        containerRef.current.style.zIndex = '9999';
        
        // Force video element to fill container
        if (videoRef.current) {
          videoRef.current.style.width = '100%';
          videoRef.current.style.height = '100%';
          videoRef.current.style.objectFit = 'contain';
        }
        
        // Update viewport state
        setViewport(data.viewport);
        setIsFullscreen(true);
      }
    };

    window.electron.on('video-fullscreen', handleVideoFullscreen);
    return () => {
      window.electron.off('video-fullscreen', handleVideoFullscreen);
    };
  }, [onVideoIdentified]);

  // Handle video metadata loading with offline support
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const quality = video.videoHeight >= 2160 ? '4K' :
                     video.videoHeight >= 1440 ? '2K' :
                     video.videoHeight >= 1080 ? 'FHD' :
                     video.videoHeight >= 720 ? 'HD' : 'SD';

      const isLocal = videoSource.startsWith('file://') || 
                     videoSource.startsWith('blob:') ||
                     videoSource.includes('localhost');

      let title = videoSource.split('/').pop() || 'Unknown Video';
      if (isLocal) {
        title = decodeURIComponent(title);
      }

      const newMetadata: VideoMetadata = {
        title,
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        quality,
        url: videoSource,
        width: video.videoWidth,
        height: video.videoHeight,
        isLocal
      };
      
      setMetadata(newMetadata);
      onVideoIdentified?.(newMetadata);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [videoSource, onVideoIdentified]);

  // Handle YouTube video detection
  useEffect(() => {
    const checkForYouTubeVideo = () => {
      if (window.location.hostname.includes('youtube.com') && videoRef.current) {
        // Force video element to fill container
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
        videoRef.current.style.objectFit = 'contain';
        
        // Update metadata if available
        const titleElement = document.querySelector('.ytp-title-link, .title');
        if (titleElement && metadata) {
          const newTitle = titleElement.textContent || metadata.title;
          if (newTitle !== metadata.title) {
            setMetadata({
              ...metadata,
              title: newTitle
            });
          }
        }
      }
    };
    
    // Check initially
    checkForYouTubeVideo();
    
    // Set up observer for YouTube page changes
    const observer = new MutationObserver(checkForYouTubeVideo);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [metadata]);

  // Handle playback controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      onPlaybackStateChange?.(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'black',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: dimensions.width || '100%',
          height: dimensions.height || '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <video
          ref={videoRef}
          src={videoSource}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        <ContentOverlay
          isActive={true}
          borderColor={overlayBorderColor}
          borderWidth={overlayBorderWidth}
        />
      </Box>
      
      {showControls && metadata && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            borderTop: `1px solid ${overlayBorderColor}`,
            boxShadow: `0 -5px 10px ${overlayBorderColor}40`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
              {metadata.title}
            </Typography>
            
            {metadata.platform && (
              <Chip
                label={metadata.platform}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0, 255, 0, 0.2)',
                  color: 'white',
                  borderRadius: 1
                }}
              />
            )}
            
            {metadata.isLocal && (
              <Chip
                label="Local File"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0, 255, 0, 0.2)',
                  color: 'white',
                  borderRadius: 1
                }}
              />
            )}
            
            {metadata.quality && (
              <Chip
                label={metadata.quality}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0, 255, 0, 0.2)',
                  color: 'white',
                  borderRadius: 1
                }}
              />
            )}

            {metadata.stats && (
              <Chip
                label={`${metadata.stats.fps}FPS`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0, 255, 0, 0.2)',
                  color: 'white',
                  borderRadius: 1
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              onClick={togglePlay}
              sx={{ color: 'white' }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            
            <IconButton
              onClick={toggleMute}
              sx={{ color: 'white' }}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            
            <IconButton
              onClick={toggleFullscreen}
              sx={{ color: 'white' }}
            >
              <FullscreenIcon />
            </IconButton>

            {metadata.stats && (
              <Typography variant="caption" sx={{ color: 'white', ml: 'auto' }}>
                {metadata.stats.resolution} • {metadata.stats.aspectRatio}:1
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer; 