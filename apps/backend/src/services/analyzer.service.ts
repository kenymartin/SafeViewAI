import * as tf from '@tensorflow/tfjs';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { ContentType, AnalysisResult, VideoMetadata, ContentSegment } from '@safeview/shared/types/content';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const extractFrames = promisify((input: string, outputDir: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .on('end', () => resolve([]))
      .on('error', reject)
      .screenshots({
        count: 10,
        folder: outputDir,
        filename: 'frame-%i.jpg'
      });
  });
});

export class AnalyzerService {
  private models: Map<ContentType, tf.LayersModel>;
  private worker: any; // Tesseract.Worker type

  constructor() {
    this.models = new Map();
    this.initialize();
  }

  private async initialize() {
    // Create local model URLs (in an actual implementation, these would be real models)
    const modelBasePath = path.join(process.cwd(), 'models');
    
    // Ensure models directory exists
    if (!fs.existsSync(modelBasePath)) {
      fs.mkdirSync(modelBasePath, { recursive: true });
    }
    
    try {
      // In a real implementation, you would have actual model files
      // For now, we'll just log that we would load these models
      console.log('Would load violence model from:', path.join(modelBasePath, 'violence-model'));
      console.log('Would load nudity model from:', path.join(modelBasePath, 'nudity-model'));
      console.log('Would load profanity model from:', path.join(modelBasePath, 'profanity-model'));
      
      // Placeholder for model loading (in real implementation)
      // this.models.set('violence', await tf.loadLayersModel(`file://${path.join(modelBasePath, 'violence-model', 'model.json')}`));
      // this.models.set('nudity', await tf.loadLayersModel(`file://${path.join(modelBasePath, 'nudity-model', 'model.json')}`));
      // this.models.set('profanity', await tf.loadLayersModel(`file://${path.join(modelBasePath, 'profanity-model', 'model.json')}`));
      
      // Initialize OCR worker for text detection
      this.worker = await createWorker();
    } catch (error) {
      console.error('Error initializing models:', error);
    }
  }

  async analyzeVideo(videoPath: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    const frames = await extractFrames(videoPath, './temp/frames');
    const segments: ContentSegment[] = [];

    // Analyze each frame
    for (const frame of frames) {
      const frameAnalysis = await this.analyzeFrame(frame);
      segments.push(...frameAnalysis);
    }

    // Get video metadata
    const metadata = await this.getVideoMetadata(videoPath);

    return {
      segments: this.mergeOverlappingSegments(segments),
      metadata,
      processingTime: Date.now() - startTime
    };
  }

  private async analyzeFrame(framePath: string): Promise<ContentSegment[]> {
    // In browser version, we need to read the file differently
    const imageBuffer = fs.readFileSync(framePath);
    const image = tf.node ? 
      await tf.node.decodeImage(imageBuffer) : 
      await tf.browser.fromPixels(await createImageBitmap(new Blob([imageBuffer])));
    
    const segments: ContentSegment[] = [];

    // For now, just return a mock prediction since we don't have real models
    segments.push({
      startTime: 0,
      endTime: 0,
      type: 'violence', // Example content type
      confidence: 0.85,
      action: 'blur'
    });

    // Clean up
    image.dispose();
    return segments;
  }

  private async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration || 0,
          resolution: {
            width: videoStream?.width || 0,
            height: videoStream?.height || 0
          },
          fps: videoStream?.r_frame_rate ? eval(videoStream.r_frame_rate) : 0,
          format: metadata.format.format_name || ''
        });
      });
    });
  }

  private mergeOverlappingSegments(segments: ContentSegment[]): ContentSegment[] {
    // Sort segments by start time
    segments.sort((a, b) => a.startTime - b.startTime);
    
    const merged: ContentSegment[] = [];
    let current: ContentSegment | null = null;

    for (const segment of segments) {
      if (!current) {
        current = { ...segment };
      } else if (segment.startTime <= current.endTime) {
        // Merge overlapping segments
        current.endTime = Math.max(current.endTime, segment.endTime);
        current.confidence = Math.max(current.confidence, segment.confidence);
      } else {
        merged.push(current);
        current = { ...segment };
      }
    }

    if (current) {
      merged.push(current);
    }

    return merged;
  }

  async cleanup() {
    // Clean up resources
    for (const model of this.models.values()) {
      model.dispose();
    }
    await this.worker.terminate();
  }
} 