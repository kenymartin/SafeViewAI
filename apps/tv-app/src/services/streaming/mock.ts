import { StreamingService, VideoMetadata, StreamingQuality, ContentWarning } from './types';

export class MockStreamingService implements StreamingService {
  name = 'mock';
  private isInitialized = false;
  private currentVideo: VideoMetadata | null = null;

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async playVideo(videoId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    this.currentVideo = {
      title: `Mock Video ${videoId}`,
      platform: 'mock',
      quality: {
        width: 1920,
        height: 1080,
        fps: 30,
        bitrate: 5000000
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    };
  }

  async getCurrentVideo(): Promise<VideoMetadata | null> {
    return this.currentVideo;
  }

  async setQuality(quality: StreamingQuality): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    console.log('Setting quality:', quality);
  }

  async enterFullscreen(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    console.log('Entering fullscreen');
  }

  async exitFullscreen(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    console.log('Exiting fullscreen');
  }

  async isFullscreen(): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    return false;
  }

  async getContentWarnings(): Promise<ContentWarning[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    return [
      {
        type: 'mock_warning',
        confidence: 0.95,
        description: 'This is a mock content warning'
      }
    ];
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
    this.currentVideo = null;
  }
} 