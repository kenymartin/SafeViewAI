// Type declarations for @safeview/shared
declare module '@safeview/shared' {
  export type ContentType = 'violence' | 'nudity' | 'profanity' | 'gore' | 'drugs';
  export type FilterAction = 'blur' | 'mute' | 'cut' | 'skip';

  export interface ContentSegment {
    startTime: number;
    endTime: number;
    type: ContentType;
    confidence: number;
    action: FilterAction;
  }

  export interface UserPreferences {
    violence: boolean;
    nudity: boolean;
    profanity: boolean;
    gore: boolean;
    drugs: boolean;
    defaultAction: FilterAction;
    sensitivity: 'low' | 'medium' | 'high';
  }

  export interface VideoMetadata {
    duration: number;
    resolution: {
      width: number;
      height: number;
    };
    fps: number;
    format: string;
  }

  export interface AnalysisResult {
    segments: ContentSegment[];
    metadata: VideoMetadata;
    processingTime: number;
  }
} 