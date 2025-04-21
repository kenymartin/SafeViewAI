"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockStreamingService = void 0;
class MockStreamingService {
    constructor() {
        this.name = 'mock';
        this.initialized = false;
        this.isFullscreenState = false;
        this.currentVideo = null;
    }
    async initialize() {
        if (this.initialized)
            return;
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.initialized = true;
        console.log('Mock streaming service initialized');
    }
    async playVideo(videoId) {
        if (!this.initialized) {
            throw new Error('Mock service not initialized');
        }
        // Create mock video metadata
        this.currentVideo = {
            title: `Mock Video ${videoId}`,
            platform: 'mock',
            quality: {
                width: 1920,
                height: 1080,
                fps: 60,
                bitrate: 15000000 // 15 Mbps
            },
            resolution: '1920x1080',
            aspectRatio: '16:9'
        };
        console.log(`Playing mock video: ${videoId}`);
    }
    async getCurrentVideo() {
        if (!this.initialized) {
            throw new Error('Mock service not initialized');
        }
        return this.currentVideo;
    }
    async setQuality(quality) {
        if (!this.initialized) {
            throw new Error('Mock service not initialized');
        }
        console.log('Setting mock quality:', quality);
    }
    async enterFullscreen() {
        if (!this.initialized) {
            throw new Error('Mock service not initialized');
        }
        this.isFullscreenState = true;
        console.log('Entering mock fullscreen');
    }
    async exitFullscreen() {
        if (!this.initialized) {
            throw new Error('Mock service not initialized');
        }
        this.isFullscreenState = false;
        console.log('Exiting mock fullscreen');
    }
    async isFullscreen() {
        if (!this.initialized) {
            throw new Error('Mock service not initialized');
        }
        return this.isFullscreenState;
    }
}
exports.MockStreamingService = MockStreamingService;
//# sourceMappingURL=mock.js.map