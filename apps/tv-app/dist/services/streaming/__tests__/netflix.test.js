"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const netflix_1 = require("../netflix");
// Mock electron modules
jest.mock('electron', () => ({
    BrowserWindow: jest.fn()
}));
describe('NetflixService', () => {
    let netflixService;
    let mockWindow;
    beforeEach(() => {
        mockWindow = {
            loadURL: jest.fn().mockResolvedValue(undefined),
            webContents: {
                executeJavaScript: jest.fn().mockResolvedValue(undefined),
                on: jest.fn(),
                removeListener: jest.fn()
            },
            show: jest.fn(),
            hide: jest.fn(),
            isDestroyed: jest.fn().mockReturnValue(false)
        };
        netflixService = new netflix_1.NetflixService(mockWindow);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('initialize', () => {
        it('should initialize Netflix service', async () => {
            await netflixService.initialize();
            expect(mockWindow.loadURL).toHaveBeenCalledWith('https://www.netflix.com');
            expect(mockWindow.webContents.executeJavaScript).toHaveBeenCalled();
        });
        it('should handle initialization failure', async () => {
            mockWindow.loadURL.mockRejectedValue(new Error('Failed to load'));
            await expect(netflixService.initialize()).rejects.toThrow('Failed to load');
        });
    });
    describe('playVideo', () => {
        beforeEach(async () => {
            await netflixService.initialize();
        });
        it('should play video with given ID', async () => {
            const videoId = '12345';
            await netflixService.playVideo(videoId);
            expect(mockWindow.loadURL).toHaveBeenCalledWith(`https://www.netflix.com/watch/${videoId}`);
            expect(mockWindow.webContents.executeJavaScript).toHaveBeenCalled();
        });
        it('should handle video playback failure', async () => {
            mockWindow.loadURL.mockRejectedValue(new Error('Failed to play video'));
            await expect(netflixService.playVideo('12345')).rejects.toThrow('Failed to play video');
        });
    });
    describe('setQuality', () => {
        beforeEach(async () => {
            await netflixService.initialize();
        });
        it('should set video quality', async () => {
            const quality = {
                width: 1920,
                height: 1080,
                bitrate: 5000000,
                fps: 30
            };
            await netflixService.setQuality(quality);
            expect(mockWindow.webContents.executeJavaScript).toHaveBeenCalledWith(expect.stringContaining('setBitrate'));
        });
        it('should handle quality setting failure', async () => {
            mockWindow.webContents.executeJavaScript.mockRejectedValue(new Error('Failed to set quality'));
            const quality = {
                width: 1920,
                height: 1080,
                bitrate: 5000000,
                fps: 30
            };
            await expect(netflixService.setQuality(quality)).rejects.toThrow('Failed to set quality');
        });
    });
    describe('cleanup', () => {
        it('should clean up resources', async () => {
            await netflixService.initialize();
            await netflixService.cleanup();
            // Add assertions based on cleanup implementation
        });
    });
});
//# sourceMappingURL=netflix.test.js.map