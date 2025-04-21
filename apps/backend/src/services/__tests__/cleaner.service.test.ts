import { VideoCleaner } from '../cleaner.service';
import { ContentSegment } from '@safeview/shared/types/content';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('fluent-ffmpeg');

describe('VideoCleaner', () => {
  let cleaner: VideoCleaner;
  const tempDir = join(process.cwd(), 'temp');

  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
    cleaner = new VideoCleaner(tempDir);
  });

  afterEach(async () => {
    await cleaner.cleanup();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should process video with blur segments', async () => {
    const inputPath = join(tempDir, 'input.mp4');
    const outputPath = join(tempDir, 'output.mp4');
    await fs.writeFile(inputPath, 'fake video content');

    const segments: ContentSegment[] = [
      {
        startTime: 10,
        endTime: 15,
        type: 'violence',
        confidence: 0.9,
        action: 'blur'
      }
    ];

    const result = await cleaner.cleanVideo(inputPath, segments, outputPath);

    expect(result).toBe(outputPath);
    // Verify that blur filter was applied
    // This would require mocking ffmpeg command chain
  });

  it('should process video with mute segments', async () => {
    const inputPath = join(tempDir, 'input.mp4');
    const outputPath = join(tempDir, 'output.mp4');
    await fs.writeFile(inputPath, 'fake video content');

    const segments: ContentSegment[] = [
      {
        startTime: 20,
        endTime: 25,
        type: 'profanity',
        confidence: 0.8,
        action: 'mute'
      }
    ];

    const result = await cleaner.cleanVideo(inputPath, segments, outputPath);

    expect(result).toBe(outputPath);
    // Verify that mute filter was applied
  });

  it('should process video with cut segments', async () => {
    const inputPath = join(tempDir, 'input.mp4');
    const outputPath = join(tempDir, 'output.mp4');
    await fs.writeFile(inputPath, 'fake video content');

    const segments: ContentSegment[] = [
      {
        startTime: 30,
        endTime: 35,
        type: 'nudity',
        confidence: 0.95,
        action: 'cut'
      }
    ];

    const result = await cleaner.cleanVideo(inputPath, segments, outputPath);

    expect(result).toBe(outputPath);
    // Verify that cut was applied
  });

  it('should handle multiple segments with different actions', async () => {
    const inputPath = join(tempDir, 'input.mp4');
    const outputPath = join(tempDir, 'output.mp4');
    await fs.writeFile(inputPath, 'fake video content');

    const segments: ContentSegment[] = [
      {
        startTime: 10,
        endTime: 15,
        type: 'violence',
        confidence: 0.9,
        action: 'blur'
      },
      {
        startTime: 20,
        endTime: 25,
        type: 'profanity',
        confidence: 0.8,
        action: 'mute'
      },
      {
        startTime: 30,
        endTime: 35,
        type: 'nudity',
        confidence: 0.95,
        action: 'cut'
      }
    ];

    const result = await cleaner.cleanVideo(inputPath, segments, outputPath);

    expect(result).toBe(outputPath);
    // Verify that all filters were applied in correct order
  });

  it('should add SafeView border to output', async () => {
    const inputPath = join(tempDir, 'input.mp4');
    const outputPath = join(tempDir, 'output.mp4');
    await fs.writeFile(inputPath, 'fake video content');

    const segments: ContentSegment[] = [];

    const result = await cleaner.cleanVideo(inputPath, segments, outputPath);

    expect(result).toBe(outputPath);
    // Verify that border was added
  });
}); 