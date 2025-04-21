import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, message } from 'antd';
import { PlayCircleOutlined, FullscreenOutlined, FullscreenExitOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface VideoMetadata {
  title: string;
  platform: string;
  quality: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
  };
  resolution: string;
  aspectRatio: string;
}

const TestPanel: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const initializeService = async () => {
    try {
      setLoading(true);
      const result = await window.electron.ipcRenderer.invoke('initialize-service', 'mock');
      if (result.success) {
        setIsInitialized(true);
        message.success('Mock service initialized successfully');
      } else {
        message.error('Failed to initialize mock service');
      }
    } catch (error) {
      message.error('Error initializing mock service');
    } finally {
      setLoading(false);
    }
  };

  const playVideo = async () => {
    try {
      setLoading(true);
      const result = await window.electron.ipcRenderer.invoke('play-video', 'mock', 'test-video-1');
      if (result.success) {
        message.success('Started playing mock video');
        // Get current video info
        const videoResult = await window.electron.ipcRenderer.invoke('get-current-video');
        if (videoResult.success && videoResult.video) {
          setCurrentVideo(videoResult.video);
        }
      } else {
        message.error('Failed to play video');
      }
    } catch (error) {
      message.error('Error playing video');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      setLoading(true);
      if (!isFullscreen) {
        const result = await window.electron.ipcRenderer.invoke('enter-fullscreen');
        if (result.success) {
          setIsFullscreen(true);
          message.success('Entered fullscreen mode');
        }
      } else {
        const result = await window.electron.ipcRenderer.invoke('exit-fullscreen');
        if (result.success) {
          setIsFullscreen(false);
          message.success('Exited fullscreen mode');
        }
      }
    } catch (error) {
      message.error('Error toggling fullscreen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: '20px auto' }}>
      <Title level={3}>Mock Streaming Service Test Panel</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          type="primary" 
          onClick={initializeService}
          loading={loading}
          disabled={isInitialized}
        >
          Initialize Mock Service
        </Button>

        <Button 
          icon={<PlayCircleOutlined />}
          onClick={playVideo}
          loading={loading}
          disabled={!isInitialized}
        >
          Play Test Video
        </Button>

        <Button 
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
          loading={loading}
          disabled={!isInitialized}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>

        {currentVideo && (
          <Card size="small" title={<><InfoCircleOutlined /> Current Video Info</>}>
            <Space direction="vertical">
              <Text>Title: {currentVideo.title}</Text>
              <Text>Platform: {currentVideo.platform}</Text>
              <Text>Resolution: {currentVideo.resolution}</Text>
              <Text>Aspect Ratio: {currentVideo.aspectRatio}</Text>
              <Text>FPS: {currentVideo.quality.fps}</Text>
              <Text>Bitrate: {(currentVideo.quality.bitrate / 1000000).toFixed(2)} Mbps</Text>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default TestPanel; 