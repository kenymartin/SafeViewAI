import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Slider, IconButton, Paper, Grid, Tooltip, CircularProgress } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen, Flag, ArrowBack } from '@mui/icons-material';
import { ContentSegment } from '@safeview/shared';
import { VideoPlayer } from '../components/VideoPlayer';

interface VideoPlayerPageProps {
  preferences: {
    violence: boolean;
    language: boolean;
    nudity: boolean;
    drugs: boolean;
  };
}

const VideoPlayerPage: React.FC<VideoPlayerPageProps> = ({ preferences }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [segments, setSegments] = useState<ContentSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get video ID from URL parameters
  const { videoId } = useParams<{ videoId: string }>();

  // For demo purposes, we'll use a sample video
  const sampleVideoUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';

  // For demo purposes, we'll use sample segments
  const sampleSegments: ContentSegment[] = [
    {
      startTime: 2,
      endTime: 4,
      type: 'violence',
      confidence: 0.85,
      action: 'blur'
    },
    {
      startTime: 6,
      endTime: 8,
      type: 'profanity',
      confidence: 0.92,
      action: 'mute'
    }
  ];

  // Handle viewport resizing and fullscreen changes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const aspectRatio = 16 / 9;

        // Calculate dimensions to maintain aspect ratio while filling viewport
        let width = viewportWidth;
        let height = width / aspectRatio;

        if (height > viewportHeight) {
          height = viewportHeight;
          width = height * aspectRatio;
        }

        // Apply dimensions
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;

        // Center the container
        container.style.position = 'absolute';
        container.style.left = `${(viewportWidth - width) / 2}px`;
        container.style.top = `${(viewportHeight - height) / 2}px`;
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreenNow = document.fullscreenElement !== null;
      setIsFullscreen(isFullscreenNow);
      handleResize(); // Recalculate dimensions on fullscreen change
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('orientationchange', handleResize);

    // Initial setup
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Handle video source changes
  useEffect(() => {
    if (videoId) {
      // Construct video URL based on service
      const videoUrl = constructVideoUrl(videoId);
      setVideoPath(videoUrl);
      setIsLoading(false);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [videoId]);

  // Helper function to construct video URL based on service
  const constructVideoUrl = (id: string): string => {
    // This would be expanded based on the streaming service
    // For now, we'll handle YouTube as an example
    return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Apply filters based on current time
      segments.forEach(segment => {
        if (videoRef.current && 
            videoRef.current.currentTime >= segment.startTime && 
            videoRef.current.currentTime <= segment.endTime) {
          
          if (segment.action === 'mute' && !videoRef.current.muted) {
            videoRef.current.muted = true;
            setTimeout(() => {
              if (videoRef.current && 
                  videoRef.current.currentTime > segment.endTime) {
                videoRef.current.muted = isMuted;
              }
            }, (segment.endTime - segment.startTime) * 1000);
          }
          
          // Other actions like blur, cut, etc. would be handled by 
          // modifying video or canvas in a real implementation
        }
      });
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (videoRef.current) {
      const time = newValue as number;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleFlagContent = () => {
    if (videoRef.current) {
      const timestamp = videoRef.current.currentTime;
      window.api.flagContent(timestamp, 'manual-flag').then(result => {
        console.log('Content flagged:', result);
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderSegmentMarkers = () => {
    return segments.map((segment, index) => (
      <Tooltip
        key={index}
        title={`${segment.type} (${segment.action})`}
        placement="top"
      >
        <Box
          className="segment-marker"
          sx={{
            left: `${(segment.startTime / duration) * 100}%`,
            width: `${((segment.endTime - segment.startTime) / duration) * 100}%`,
            bgcolor: segment.type === 'violence' ? 'error.main' : 
                    segment.type === 'profanity' ? 'warning.main' :
                    segment.type === 'nudity' ? 'secondary.main' : 'info.main'
          }}
        />
      </Tooltip>
    ));
  };

  const handleAnalysisComplete = (warnings: any[]) => {
    // Filter content based on user preferences
    const filteredWarnings = warnings.filter(warning => {
      if (preferences.violence && warning.type === 'violence') return true;
      if (preferences.language && warning.type === 'language') return true;
      if (preferences.nudity && warning.type === 'nudity') return true;
      if (preferences.drugs && warning.type === 'drugs') return true;
      return false;
    });

    // Handle filtered warnings
    console.log('Filtered warnings:', filteredWarnings);
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#141414',
        color: '#FFFFFF',
        position: 'relative'
      }}
    >
      {/* Netflix-like back button */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1001,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <IconButton
          sx={{
            color: '#FFFFFF',
            '&:hover': {
              color: '#E50914',
            },
          }}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      <Paper 
        ref={containerRef}
        data-testid="video-container"
        sx={{ 
          position: 'absolute',
          overflow: 'hidden',
          borderRadius: 0,
          background: '#000000',
          width: '100%',
          height: '100%',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}>
            <CircularProgress sx={{ color: '#E50914' }} />
          </Box>
        ) : (
          <VideoPlayer
            videoSource={videoPath || undefined}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {/* Netflix-like controls overlay */}
        <Box 
          className="controls-overlay"
          sx={{ 
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.9))',
            padding: '60px 4% 20px',
            zIndex: 1000
          }}
        >
          {/* Progress bar */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              sx={{
                color: '#E50914',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.2s',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(229, 9, 20, 0.16)',
                  },
                  '&:before': {
                    display: 'none',
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28,
                },
              }}
            />
            {/* Segment markers */}
            {renderSegmentMarkers()}
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <IconButton 
                onClick={handlePlayPause}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { color: '#E50914' },
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton 
                onClick={handleMute}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { color: '#E50914' },
                }}
              >
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Grid>
            <Grid item>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Grid>
            <Grid item sx={{ flexGrow: 1 }} />
            <Grid item>
              <IconButton 
                onClick={handleFlagContent}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { color: '#E50914' },
                }}
              >
                <Flag />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton 
                onClick={handleFullscreen}
                data-testid="fullscreen-button"
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { color: '#E50914' },
                }}
              >
                <Fullscreen />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default VideoPlayerPage; 