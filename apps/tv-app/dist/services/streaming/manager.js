"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingManager = void 0;
const netflix_1 = require("./netflix");
const mock_1 = require("./mock");
class StreamingManager {
    constructor(mainWindow) {
        this.services = new Map();
        this.activeService = null;
        this.mainWindow = null;
        this.mainWindow = mainWindow;
        // Register default services
        this.registerService(new netflix_1.NetflixService(mainWindow));
        this.registerService(new mock_1.MockStreamingService()); // Add mock service for testing
        // Add more services here as they are implemented
    }
    registerService(service) {
        this.services.set(service.name, service);
    }
    async initializeService(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        await service.initialize();
        this.activeService = service;
    }
    async playVideo(serviceName, videoId) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        await service.playVideo(videoId);
        this.activeService = service;
    }
    async getCurrentVideo() {
        if (!this.activeService) {
            return null;
        }
        return await this.activeService.getCurrentVideo();
    }
    async setQuality(quality) {
        if (!this.activeService) {
            throw new Error('No active service');
        }
        await this.activeService.setQuality(quality);
    }
    async enterFullscreen() {
        if (!this.activeService) {
            throw new Error('No active service');
        }
        await this.activeService.enterFullscreen();
    }
    async exitFullscreen() {
        if (!this.activeService) {
            throw new Error('No active service');
        }
        await this.activeService.exitFullscreen();
    }
    async isFullscreen() {
        if (!this.activeService) {
            return false;
        }
        return await this.activeService.isFullscreen();
    }
    getActiveService() {
        return this.activeService;
    }
    async cleanup() {
        for (const service of this.services.values()) {
            if (service.cleanup) {
                await service.cleanup();
            }
        }
        this.activeService = null;
        this.services.clear();
    }
}
exports.StreamingManager = StreamingManager;
//# sourceMappingURL=manager.js.map