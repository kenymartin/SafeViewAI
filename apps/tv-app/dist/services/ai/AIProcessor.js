"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProcessor = void 0;
class AIProcessor {
    constructor() {
        this.isProcessing = false;
        this.frameBuffer = [];
        this.maxBufferSize = 10;
    }
    async initialize() {
        this.isProcessing = false;
        this.frameBuffer = [];
    }
    async processFrame(frame) {
        if (!this.isProcessing) {
            throw new Error('AIProcessor not initialized');
        }
        // Add frame to buffer
        this.frameBuffer.push(frame);
        if (this.frameBuffer.length > this.maxBufferSize) {
            this.frameBuffer.shift();
        }
        // Mock detection for testing
        const detections = [{
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
    getBufferSize() {
        return this.frameBuffer.length;
    }
}
exports.AIProcessor = AIProcessor;
//# sourceMappingURL=AIProcessor.js.map