"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentAnalyzer = void 0;
const AIProcessor_1 = require("../ai/AIProcessor");
class ContentAnalyzer {
    constructor() {
        this.isAnalyzing = false;
        this.currentWarnings = [];
        this.aiProcessor = new AIProcessor_1.AIProcessor();
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
    async analyzeFrame(frame) {
        if (!this.isAnalyzing) {
            throw new Error('Content analyzer not started');
        }
        const processedFrame = await this.aiProcessor.processFrame(frame);
        const warnings = this.processDetections(processedFrame);
        this.currentWarnings = warnings;
        return warnings;
    }
    processDetections(frame) {
        return frame.detections.map(detection => ({
            type: this.getWarningType(detection.type),
            confidence: detection.confidence,
            description: this.getWarningDescription(detection.type)
        }));
    }
    getWarningType(type) {
        const warningTypes = {
            'nudity': 'Nudity',
            'violence': 'Violence',
            'gore': 'Gore',
            'drugs': 'Drug Use',
            'language': 'Strong Language',
            'content_warning': 'Content Warning'
        };
        return warningTypes[type] || 'Content Warning';
    }
    getWarningDescription(type) {
        const descriptions = {
            'nudity': 'Contains scenes with nudity or sexual content',
            'violence': 'Contains violent or aggressive scenes',
            'gore': 'Contains graphic or disturbing content',
            'drugs': 'Contains scenes with drug use or substance abuse',
            'language': 'Contains strong or offensive language',
            'content_warning': 'May contain content that some viewers may find disturbing'
        };
        return descriptions[type] || 'Content that may require viewer discretion';
    }
    getCurrentWarnings() {
        return this.currentWarnings;
    }
}
exports.ContentAnalyzer = ContentAnalyzer;
//# sourceMappingURL=analyzer.js.map