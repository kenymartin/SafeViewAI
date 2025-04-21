import { StreamingService, VideoMetadata, StreamingQuality } from './types';

export class MockStreamingService implements StreamingService {
  name = 'mock';
  private initialized = false;
  private isFullscreenState = false;
  private currentVideo: VideoMetadata | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.initialized = true;
    console.log('Mock streaming service initialized');
  }

  async playVideo(videoId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Mock service not initialized');
    }

    // Create mock video metadata
    this.currentVideo = {
      title: `Mock Video ${videoId}`,
      platform: 'mock',
      quality: {
        width: 1920,
        height: 1080,
        fps: 60,
        bitrate: 15000000 // 15 Mbps
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    };

    console.log(`Playing mock video: ${videoId}`);
  }

  async getCurrentVideo(): Promise<VideoMetadata | null> {
    if (!this.initialized) {
      throw new Error('Mock service not initialized');
    }

    return this.currentVideo;
  }

  async setQuality(quality: StreamingQuality): Promise<void> {
    if (!this.initialized) {
      throw new Error('Mock service not initialized');
    }

    console.log('Setting mock quality:', quality);
  }

  async enterFullscreen(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Mock service not initialized');
    }

    this.isFullscreenState = true;
    console.log('Entering mock fullscreen');
  }

  async exitFullscreen(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Mock service not initialized');
    }

    this.isFullscreenState = false;
    console.log('Exiting mock fullscreen');
  }

  async isFullscreen(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Mock service not initialized');
    }

    return this.isFullscreenState;
  }
} 