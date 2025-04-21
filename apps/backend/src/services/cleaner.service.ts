import ffmpeg from 'fluent-ffmpeg';
import { ContentSegment, FilterAction } from '@safeview/shared/types/content';
import { createWriteStream } from 'fs';
import { join } from 'path';

export class VideoCleaner {
  private tempDir: string;

  constructor(tempDir: string = './temp') {
    this.tempDir = tempDir;
  }

  async cleanVideo(
    inputPath: string,
    segments: ContentSegment[],
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Sort segments by start time to ensure proper processing
      segments.sort((a, b) => a.startTime - b.startTime);

      // Apply each modification based on segment action
      segments.forEach(segment => {
        switch (segment.action) {
          case 'blur':
            command = this.applyBlur(command, segment);
            break;
          case 'mute':
            command = this.applyMute(command, segment);
            break;
          case 'cut':
            command = this.applyCut(command, segment);
            break;
          case 'skip':
            command = this.applySkip(command, segment);
            break;
        }
      });

      // Add blue border to indicate SafeView AI is active
      command = this.addSafeViewBorder(command);

      // Set output path and format
      command
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  private applyBlur(command: ffmpeg.FfmpegCommand, segment: ContentSegment): ffmpeg.FfmpegCommand {
    return command
      .videoFilters({
        filter: 'boxblur',
        options: {
          luma_radius: '10',
          luma_power: '1',
          enable: `between(t,${segment.startTime},${segment.endTime})`
        }
      });
  }

  private applyMute(command: ffmpeg.FfmpegCommand, segment: ContentSegment): ffmpeg.FfmpegCommand {
    return command
      .audioFilters({
        filter: 'volume',
        options: {
          volume: '0',
          enable: `between(t,${segment.startTime},${segment.endTime})`
        }
      });
  }

  private applyCut(command: ffmpeg.FfmpegCommand, segment: ContentSegment): ffmpeg.FfmpegCommand {
    // For cuts, we need to split the video and concatenate the parts
    const beforeSegment = join(this.tempDir, `before-${segment.startTime}.mp4`);
    const afterSegment = join(this.tempDir, `after-${segment.endTime}.mp4`);
    
    // Extract segments before and after the cut
    command
      .output(beforeSegment)
      .setStartTime(0)
      .setDuration(segment.startTime);

    command
      .output(afterSegment)
      .setStartTime(segment.endTime);

    return command;
  }

  private applySkip(command: ffmpeg.FfmpegCommand, segment: ContentSegment): ffmpeg.FfmpegCommand {
    // Similar to cut but with a transition effect
    return this.applyCut(command, segment)
      .videoFilters({
        filter: 'fade',
        options: {
          type: 'in',
          start_time: segment.startTime - 0.5,
          duration: 0.5
        }
      })
      .videoFilters({
        filter: 'fade',
        options: {
          type: 'out',
          start_time: segment.endTime - 0.5,
          duration: 0.5
        }
      });
  }

  private addSafeViewBorder(command: ffmpeg.FfmpegCommand): ffmpeg.FfmpegCommand {
    return command
      .videoFilters({
        filter: 'drawbox',
        options: {
          x: '0',
          y: '0',
          width: 'iw',
          height: 'ih',
          color: 'blue@0.5',
          t: '2'
        }
      });
  }

  async cleanup(): Promise<void> {
    // Clean up temporary files
    // Implementation depends on your file system management strategy
  }
} 