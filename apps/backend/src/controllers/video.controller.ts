import { Request, Response } from 'express';
import { AnalyzerService } from '../services/analyzer.service';
import { VideoCleaner } from '../services/cleaner.service';
import { UserPreferences } from '@safeview/shared/types/content';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export class VideoController {
  private analyzer: AnalyzerService;
  private cleaner: VideoCleaner;
  private tempDir: string;

  constructor() {
    this.analyzer = new AnalyzerService();
    this.cleaner = new VideoCleaner();
    this.tempDir = join(process.cwd(), 'temp');
    this.initialize();
  }

  private async initialize() {
    await mkdir(this.tempDir, { recursive: true });
  }

  async analyzeVideo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const videoPath = req.file.path;
      const analysis = await this.analyzer.analyzeVideo(videoPath);

      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing video:', error);
      res.status(500).json({ error: 'Failed to analyze video' });
    }
  }

  async processVideo(req: Request, res: Response) {
    try {
      const { videoPath, preferences } = req.body as {
        videoPath: string;
        preferences: UserPreferences;
      };

      if (!videoPath) {
        return res.status(400).json({ error: 'No video path provided' });
      }

      // Analyze video content
      const analysis = await this.analyzer.analyzeVideo(videoPath);

      // Filter segments based on user preferences
      const filteredSegments = analysis.segments.filter(segment => {
        switch (segment.type) {
          case 'violence':
            return preferences.violence;
          case 'nudity':
            return preferences.nudity;
          case 'profanity':
            return preferences.profanity;
          case 'gore':
            return preferences.gore;
          case 'drugs':
            return preferences.drugs;
          default:
            return false;
        }
      });

      // Apply user's default action to segments
      filteredSegments.forEach(segment => {
        segment.action = preferences.defaultAction;
      });

      // Process video with filtered segments
      const outputPath = join(this.tempDir, `processed-${Date.now()}.mp4`);
      await this.cleaner.cleanVideo(videoPath, filteredSegments, outputPath);

      res.json({
        success: true,
        outputPath,
        processedSegments: filteredSegments
      });
    } catch (error) {
      console.error('Error processing video:', error);
      res.status(500).json({ error: 'Failed to process video' });
    }
  }

  async streamVideo(req: Request, res: Response) {
    try {
      const { videoPath } = req.params;

      if (!videoPath) {
        return res.status(400).json({ error: 'No video path provided' });
      }

      const stat = await fs.stat(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      console.error('Error streaming video:', error);
      res.status(500).json({ error: 'Failed to stream video' });
    }
  }

  async cleanup() {
    await this.analyzer.cleanup();
    await this.cleaner.cleanup();
  }
} 