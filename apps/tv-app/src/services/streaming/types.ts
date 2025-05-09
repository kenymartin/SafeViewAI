export interface StreamingQuality {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
}

export interface VideoMetadata {
  title: string;
  platform: string;
  quality: StreamingQuality;
  resolution: string;
  aspectRatio: string;
}

export interface ContentWarning {
  type: string;
  confidence: number;
  description: string;
}

export interface StreamingService {
  name: string;
  initialize(): Promise<void>;
  playVideo(videoId: string): Promise<void>;
  getCurrentVideo(): Promise<VideoMetadata | null>;
  setQuality(quality: StreamingQuality): Promise<void>;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  isFullscreen(): Promise<boolean>;
  getContentWarnings(): Promise<ContentWarning[]>;
  cleanup?(): Promise<void>;
} 