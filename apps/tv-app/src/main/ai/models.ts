export interface FrameAnalysis {
  timestamp: number;
  contentWarnings: ContentWarning[];
  confidence: number;
}

export interface ContentWarning {
  type: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProcessingResult {
  frameAnalysis: FrameAnalysis;
  filteredFrame: Buffer;
  processingTime: number;
}

export interface ModelConfig {
  confidenceThreshold: number;
  maxBatchSize: number;
  processingMode: 'realtime' | 'batch';
}

export interface ModelMetrics {
  averageProcessingTime: number;
  framesProcessed: number;
  errors: number;
  lastError?: Error;
} 