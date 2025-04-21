import { AnalyzerService } from '../analyzer.service';
import { ContentType, AnalysisResult } from '@safeview/shared/types/content';
import * as tf from '@tensorflow/tfjs';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('@tensorflow/tfjs');
jest.mock('fluent-ffmpeg');
jest.mock('tesseract.js');

describe('ContentAnalyzer', () => {
  let analyzer: AnalyzerService;
  const tempDir = join(process.cwd(), 'temp');

  beforeEach(async () => {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    // Mock TensorFlow model
    (tf.loadLayersModel as jest.Mock).mockResolvedValue({
      predict: jest.fn().mockResolvedValue(tf.tensor([0.8])),
      dispose: jest.fn()
    });

    analyzer = new AnalyzerService();
  });

  afterEach(async () => {
    await analyzer.cleanup();
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should analyze video and return segments', async () => {
    // Create a mock video file
    const videoPath = join(tempDir, 'test.mp4');
    await fs.writeFile(videoPath, 'fake video content');

    const result = await analyzer.analyzeVideo(videoPath);

    expect(result).toHaveProperty('segments');
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('processingTime');
    expect(Array.isArray(result.segments)).toBe(true);
  });

  it('should detect content types correctly', async () => {
    const videoPath = join(tempDir, 'test.mp4');
    await fs.writeFile(videoPath, 'fake video content');

    const result = await analyzer.analyzeVideo(videoPath);

    result.segments.forEach(segment => {
      expect(segment).toHaveProperty('type');
      expect(segment).toHaveProperty('confidence');
      expect(segment).toHaveProperty('startTime');
      expect(segment).toHaveProperty('endTime');
      expect(segment).toHaveProperty('action');
    });
  });

  it('should handle empty video gracefully', async () => {
    const videoPath = join(tempDir, 'empty.mp4');
    await fs.writeFile(videoPath, '');

    const result = await analyzer.analyzeVideo(videoPath);

    expect(result.segments).toHaveLength(0);
    expect(result.metadata).toBeDefined();
  });

  it('should merge overlapping segments', async () => {
    const videoPath = join(tempDir, 'test.mp4');
    await fs.writeFile(videoPath, 'fake video content');

    // Mock overlapping segments
    const mockSegments = [
      { startTime: 0, endTime: 5, type: 'violence' as ContentType, confidence: 0.8, action: 'blur' },
      { startTime: 3, endTime: 8, type: 'violence' as ContentType, confidence: 0.9, action: 'blur' }
    ];

    jest.spyOn(analyzer as any, 'analyzeFrame').mockResolvedValue(mockSegments);

    const result = await analyzer.analyzeVideo(videoPath);

    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].startTime).toBe(0);
    expect(result.segments[0].endTime).toBe(8);
    expect(result.segments[0].confidence).toBe(0.9);
  });
}); 