import { AIProcessor, Frame, ProcessedFrame } from '../ai/AIProcessor';

export interface ContentWarning {
  type: string;
  confidence: number;
  description: string;
}

export class ContentAnalyzer {
  private aiProcessor: AIProcessor;
  private isAnalyzing: boolean = false;
  private currentWarnings: ContentWarning[] = [];

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  async initialize() {
    await this.aiProcessor.initialize();
  }

  async startAnalysis() {
    this.isAnalyzing = true;
    await this.aiProcessor.startProcessing();
  }

  async stopAnalysis() {
    this.isAnalyzing = false;
    await this.aiProcessor.stopProcessing();
    this.currentWarnings = [];
  }

  async analyzeFrame(frame: Frame): Promise<ContentWarning[]> {
    if (!this.isAnalyzing) {
      throw new Error('Content analyzer not started');
    }

    const processedFrame = await this.aiProcessor.processFrame(frame);
    const warnings = this.processDetections(processedFrame);
    this.currentWarnings = warnings;
    return warnings;
  }

  private processDetections(frame: ProcessedFrame): ContentWarning[] {
    return frame.detections.map(detection => ({
      type: this.getWarningType(detection.type),
      confidence: detection.confidence,
      description: this.getWarningDescription(detection.type)
    }));
  }

  private getWarningType(type: string): string {
    const warningTypes: Record<string, string> = {
      'nudity': 'Nudity',
      'violence': 'Violence',
      'gore': 'Gore',
      'drugs': 'Drug Use',
      'language': 'Strong Language',
      'content_warning': 'Content Warning'
    };
    return warningTypes[type] || 'Content Warning';
  }

  private getWarningDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'nudity': 'Contains scenes with nudity or sexual content',
      'violence': 'Contains violent or aggressive scenes',
      'gore': 'Contains graphic or disturbing content',
      'drugs': 'Contains scenes with drug use or substance abuse',
      'language': 'Contains strong or offensive language',
      'content_warning': 'May contain content that some viewers may find disturbing'
    };
    return descriptions[type] || 'Content that may require viewer discretion';
  }

  getCurrentWarnings(): ContentWarning[] {
    return this.currentWarnings;
  }
} 