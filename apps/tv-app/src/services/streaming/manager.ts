import { StreamingService, VideoMetadata, StreamingQuality } from './types';
import { NetflixService } from './netflix';
import { MockStreamingService } from './mock';
import { BrowserWindow } from 'electron';

export class StreamingManager {
  private services: Map<string, StreamingService> = new Map();
  private activeService: StreamingService | null = null;
  private mainWindow: BrowserWindow | null = null;
  private initialized = false;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    // Register default services
    this.registerService(new NetflixService(mainWindow));
    this.registerService(new MockStreamingService()); // Add mock service for testing
    // Add more services here as they are implemented
  }

  public registerService(service: StreamingService): void {
    this.services.set(service.name, service);
    console.log(`Registered streaming service: ${service.name}`);
  }

  public getService(serviceName: string): StreamingService | undefined {
    return this.services.get(serviceName);
  }

  async initializeService(serviceName: string): Promise<void> {
    try {
      console.log(`Initializing streaming service: ${serviceName}`);
      const service = this.services.get(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }
      
      // Initialize the service
      await service.initialize();
      this.activeService = service;
      this.initialized = true;
      console.log(`Service ${serviceName} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize service ${serviceName}:`, error);
      throw error;
    }
  }

  async playVideo(serviceName: string, videoId: string): Promise<void> {
    try {
      console.log(`Playing video ${videoId} on service ${serviceName}`);
      const service = this.services.get(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }
      await service.playVideo(videoId);
      this.activeService = service;
      console.log(`Video ${videoId} started playing on ${serviceName}`);
    } catch (error) {
      console.error(`Failed to play video on ${serviceName}:`, error);
      throw error;
    }
  }

  async getCurrentVideo(): Promise<VideoMetadata | null> {
    if (!this.activeService) {
      console.log('No active service to get current video from');
      return null;
    }
    try {
      const video = await this.activeService.getCurrentVideo();
      console.log('Current video:', video);
      return video;
    } catch (error) {
      console.error('Failed to get current video:', error);
      return null;
    }
  }

  async setQuality(quality: StreamingQuality): Promise<void> {
    if (!this.activeService) {
      throw new Error('No active service');
    }
    try {
      console.log('Setting video quality:', quality);
      await this.activeService.setQuality(quality);
      console.log('Video quality set successfully');
    } catch (error) {
      console.error('Failed to set video quality:', error);
      throw error;
    }
  }

  async enterFullscreen(): Promise<void> {
    if (!this.activeService) {
      throw new Error('No active service');
    }
    try {
      console.log('Entering fullscreen mode');
      await this.activeService.enterFullscreen();
      console.log('Entered fullscreen mode successfully');
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      throw error;
    }
  }

  async exitFullscreen(): Promise<void> {
    if (!this.activeService) {
      throw new Error('No active service');
    }
    try {
      console.log('Exiting fullscreen mode');
      await this.activeService.exitFullscreen();
      console.log('Exited fullscreen mode successfully');
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      throw error;
    }
  }

  async isFullscreen(): Promise<boolean> {
    if (!this.activeService) {
      return false;
    }
    try {
      const isFullscreen = await this.activeService.isFullscreen();
      console.log('Fullscreen state:', isFullscreen);
      return isFullscreen;
    } catch (error) {
      console.error('Failed to check fullscreen state:', error);
      return false;
    }
  }

  getActiveService(): StreamingService | null {
    return this.activeService;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async cleanup(): Promise<void> {
    console.log('Cleaning up streaming manager');
    for (const service of this.services.values()) {
      if (service.cleanup) {
        try {
          await service.cleanup();
          console.log(`Cleaned up service: ${service.name}`);
        } catch (error) {
          console.error(`Failed to clean up service ${service.name}:`, error);
        }
      }
    }
    this.activeService = null;
    this.services.clear();
    this.initialized = false;
    console.log('Streaming manager cleanup completed');
  }
} 