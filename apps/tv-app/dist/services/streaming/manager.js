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
        this.initialized = false;
        this.mainWindow = mainWindow;
        // Register default services
        this.registerService(new netflix_1.NetflixService(mainWindow));
        this.registerService(new mock_1.MockStreamingService()); // Add mock service for testing
        // Add more services here as they are implemented
    }
    registerService(service) {
        this.services.set(service.name, service);
        console.log(`Registered streaming service: ${service.name}`);
    }
    getService(serviceName) {
        return this.services.get(serviceName);
    }
    async initializeService(serviceName) {
        try {
            console.log(`Initializing streaming service: ${serviceName}`);
            const service = this.services.get(serviceName);
            if (!service) {
                throw new Error(`Service ${serviceName} not found`);
            }
            // Initialize the service
            await service.initialize();
            this.activeService = service;
            this.initialized = true;
            console.log(`Service ${serviceName} initialized successfully`);
        }
        catch (error) {
            console.error(`Failed to initialize service ${serviceName}:`, error);
            throw error;
        }
    }
    async playVideo(serviceName, videoId) {
        try {
            console.log(`Playing video ${videoId} on service ${serviceName}`);
            const service = this.services.get(serviceName);
            if (!service) {
                throw new Error(`Service ${serviceName} not found`);
            }
            await service.playVideo(videoId);
            this.activeService = service;
            console.log(`Video ${videoId} started playing on ${serviceName}`);
        }
        catch (error) {
            console.error(`Failed to play video on ${serviceName}:`, error);
            throw error;
        }
    }
    async getCurrentVideo() {
        if (!this.activeService) {
            console.log('No active service to get current video from');
            return null;
        }
        try {
            const video = await this.activeService.getCurrentVideo();
            console.log('Current video:', video);
            return video;
        }
        catch (error) {
            console.error('Failed to get current video:', error);
            return null;
        }
    }
    async setQuality(quality) {
        if (!this.activeService) {
            throw new Error('No active service');
        }
        try {
            console.log('Setting video quality:', quality);
            await this.activeService.setQuality(quality);
            console.log('Video quality set successfully');
        }
        catch (error) {
            console.error('Failed to set video quality:', error);
            throw error;
        }
    }
    async enterFullscreen() {
        if (!this.activeService) {
            throw new Error('No active service');
        }
        try {
            console.log('Entering fullscreen mode');
            await this.activeService.enterFullscreen();
            console.log('Entered fullscreen mode successfully');
        }
        catch (error) {
            console.error('Failed to enter fullscreen:', error);
            throw error;
        }
    }
    async exitFullscreen() {
        if (!this.activeService) {
            throw new Error('No active service');
        }
        try {
            console.log('Exiting fullscreen mode');
            await this.activeService.exitFullscreen();
            console.log('Exited fullscreen mode successfully');
        }
        catch (error) {
            console.error('Failed to exit fullscreen:', error);
            throw error;
        }
    }
    async isFullscreen() {
        if (!this.activeService) {
            return false;
        }
        try {
            const isFullscreen = await this.activeService.isFullscreen();
            console.log('Fullscreen state:', isFullscreen);
            return isFullscreen;
        }
        catch (error) {
            console.error('Failed to check fullscreen state:', error);
            return false;
        }
    }
    getActiveService() {
        return this.activeService;
    }
    isInitialized() {
        return this.initialized;
    }
    async cleanup() {
        console.log('Cleaning up streaming manager');
        for (const service of this.services.values()) {
            if (service.cleanup) {
                try {
                    await service.cleanup();
                    console.log(`Cleaned up service: ${service.name}`);
                }
                catch (error) {
                    console.error(`Failed to clean up service ${service.name}:`, error);
                }
            }
        }
        this.activeService = null;
        this.services.clear();
        this.initialized = false;
        console.log('Streaming manager cleanup completed');
    }
}
exports.StreamingManager = StreamingManager;
//# sourceMappingURL=manager.js.map