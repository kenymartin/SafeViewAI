export interface Frame {
  data: Uint8Array;
  width: number;
  height: number;
  timestamp: number;
}

export interface ProcessedFrame extends Frame {
  detections: Detection[];
}

export interface Detection {
  type: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class AIProcessor {
  private isProcessing: boolean = false;
  private frameBuffer: Frame[] = [];
  private maxBufferSize: number = 10;

  async initialize() {
    this.isProcessing = false;
    this.frameBuffer = [];
  }

  async processFrame(frame: Frame): Promise<ProcessedFrame> {
    if (!this.isProcessing) {
      throw new Error('AIProcessor not initialized');
    }

    // Add frame to buffer
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.shift();
    }

    // Mock detection for testing
    const detections: Detection[] = [{
      type: 'content_warning',
      confidence: 0.95,
      boundingBox: {
        x: 100,
        y: 100,
        width: 200,
        height: 200
      }
    }];

    return {
      ...frame,
      detections
    };
  }

  async startProcessing() {
    this.isProcessing = true;
  }

  async stopProcessing() {
    this.isProcessing = false;
    this.frameBuffer = [];
  }

  getBufferSize(): number {
    return this.frameBuffer.length;
  }
} 