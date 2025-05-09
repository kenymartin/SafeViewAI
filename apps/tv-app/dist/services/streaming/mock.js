"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockStreamingService = void 0;
class MockStreamingService {
    constructor() {
        this.name = 'mock';
        this.isInitialized = false;
        this.currentVideo = null;
    }
    async initialize() {
        this.isInitialized = true;
    }
    async playVideo(videoId) {
        if (!this.isInitialized) {
            throw new Error('Service not initialized');
        }
        this.currentVideo = {
            title: `Mock Video ${videoId}`,
            platform: 'mock',
            quality: {
                width: 1920,
                height: 1080,
                fps: 30,
                bitrate: 5000000
            },
            resolution: '1920x1080',
            aspectRatio: '16:9'
        };
    }
    async getCurrentVideo() {
        return this.currentVideo;
    }
    async setQuality(quality) {
        if (!this.isInitialized) {
            throw new Error('Service not initialized');
        }
        console.log('Setting quality:', quality);
    }
    async enterFullscreen() {
        if (!this.isInitialized) {
            throw new Error('Service not initialized');
        }
        console.log('Entering fullscreen');
    }
    async exitFullscreen() {
        if (!this.isInitialized) {
            throw new Error('Service not initialized');
        }
        console.log('Exiting fullscreen');
    }
    async isFullscreen() {
        if (!this.isInitialized) {
            throw new Error('Service not initialized');
        }
        return false;
    }
    async getContentWarnings() {
        if (!this.isInitialized) {
            throw new Error('Service not initialized');
        }
        return [
            {
                type: 'mock_warning',
                confidence: 0.95,
                description: 'This is a mock content warning'
            }
        ];
    }
    async cleanup() {
        this.isInitialized = false;
        this.currentVideo = null;
    }
}
exports.MockStreamingService = MockStreamingService;
//# sourceMappingURL=mock.js.map