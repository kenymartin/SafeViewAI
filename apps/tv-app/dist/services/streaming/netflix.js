"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetflixService = void 0;
const electron_1 = require("electron");
const process_1 = require("../process");
const analyzer_1 = require("../content/analyzer");
const path = __importStar(require("path"));
const isDev = __importStar(require("electron-is-dev"));
class NetflixService {
    constructor(mainWindow) {
        this.name = 'netflix';
        this.isInitialized = false;
        this.netflixProcess = null;
        this.checkInterval = null;
        this.currentVideo = null;
        this.isAnalyzing = false;
        this.mainWindow = mainWindow;
        this.contentAnalyzer = new analyzer_1.ContentAnalyzer();
    }
    async initialize() {
        if (this.isInitialized) {
            console.log('Netflix service already initialized');
            return;
        }
        try {
            console.log('Initializing Netflix service...');
            // Show initialization popup
            await this.showInitializationPopup();
            // Initialize content analyzer
            await this.contentAnalyzer.initialize();
            // Load Netflix URL
            await this.mainWindow.loadURL('https://www.netflix.com');
            // Wait for Netflix to be ready
            await this.mainWindow.webContents.executeJavaScript(`
        new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });
      `);
            // Start monitoring for Netflix process
            this.startMonitoring();
            this.isInitialized = true;
            console.log('Netflix service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Netflix service:', error);
            throw error;
        }
    }
    async showInitializationPopup() {
        const popup = new electron_1.BrowserWindow({
            width: 400,
            height: 200,
            frame: false,
            transparent: true,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });
        // Load initialization HTML with correct path
        const htmlPath = isDev
            ? path.join(__dirname, '..', '..', '..', '..', 'tv-app', 'src', 'renderer', 'initialization.html')
            : path.join(__dirname, '..', '..', '..', 'tv-app', 'dist', 'renderer', 'initialization.html');
        console.log('Loading initialization HTML from:', htmlPath);
        await popup.loadFile(htmlPath);
        // Center popup on primary display
        const { x, y } = popup.getBounds();
        popup.setPosition(x + 200, y + 100);
        // Auto-close after 5 seconds
        setTimeout(() => {
            popup.close();
        }, 5000);
    }
    adaptViewport() {
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        // Calculate 16:9 dimensions
        const aspectRatio = 16 / 9;
        let newWidth = width;
        let newHeight = width / aspectRatio;
        // If height is too large, scale down
        if (newHeight > height) {
            newHeight = height;
            newWidth = height * aspectRatio;
        }
        // Center the window horizontally
        const x = Math.round((width - newWidth) / 2);
        // Position window at the top of the screen
        const y = 0;
        // Set window bounds
        this.mainWindow.setBounds({ x, y, width: newWidth, height: newHeight });
        // Set window to be always on top and transparent
        this.mainWindow.setAlwaysOnTop(true, 'screen-saver');
        this.mainWindow.setIgnoreMouseEvents(true);
        // Show the window
        this.mainWindow.show();
    }
    startMonitoring() {
        // Check for Netflix process every second
        this.checkInterval = setInterval(async () => {
            try {
                const netflixProcess = await (0, process_1.findProcess)('Netflix.exe');
                if (netflixProcess) {
                    console.log('Netflix process found');
                    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                        this.adaptViewport();
                        this.mainWindow.show();
                    }
                }
                else {
                    console.log('Netflix process not found');
                    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                        this.mainWindow.hide();
                    }
                }
            }
            catch (error) {
                console.error('Error checking Netflix process:', error);
            }
        }, 1000);
    }
    async cleanup() {
        console.log('Cleaning up Netflix service...');
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.isAnalyzing) {
            await this.contentAnalyzer.stopAnalysis();
        }
        this.isInitialized = false;
        this.netflixProcess = null;
        console.log('Netflix service cleanup completed');
    }
    async playVideo(videoId) {
        if (!this.isInitialized) {
            throw new Error('Netflix service not initialized');
        }
        try {
            // Start content analysis
            await this.contentAnalyzer.startAnalysis();
            this.isAnalyzing = true;
            // Navigate to the video URL
            await this.mainWindow.loadURL(`https://www.netflix.com/watch/${videoId}`);
            // Wait for video to be ready
            await this.mainWindow.webContents.executeJavaScript(`
        new Promise((resolve) => {
          const video = document.querySelector('video');
          if (video && video.readyState >= 2) {
            resolve();
          } else {
            const checkVideo = setInterval(() => {
              const video = document.querySelector('video');
              if (video && video.readyState >= 2) {
                clearInterval(checkVideo);
                resolve();
              }
            }, 100);
          }
        });
      `);
            this.currentVideo = {
                id: videoId,
                isPlaying: true
            };
            console.log('Video playback started:', videoId);
        }
        catch (error) {
            console.error('Failed to play video:', error);
            throw error;
        }
    }
    async getCurrentVideo() {
        if (!this.isInitialized) {
            throw new Error('Netflix service not initialized');
        }
        try {
            const videoInfo = await this.mainWindow.webContents.executeJavaScript(`
        (() => {
          const video = document.querySelector('video');
          if (!video) return null;
          
    return {
            title: document.title,
      platform: 'netflix',
      quality: {
              width: video.videoWidth,
              height: video.videoHeight,
              fps: video.getVideoPlaybackQuality().totalVideoFrames / video.currentTime,
              bitrate: video.getVideoPlaybackQuality().totalVideoFrames * video.videoWidth * video.videoHeight * 3
      },
            resolution: video.videoWidth + 'x' + video.videoHeight,
            aspectRatio: video.videoWidth / video.videoHeight + ':1',
            isPlaying: !video.paused,
            currentTime: video.currentTime,
            duration: video.duration
          };
        })();
      `);
            return videoInfo || this.currentVideo;
        }
        catch (error) {
            console.error('Failed to get current video info:', error);
            return this.currentVideo;
        }
    }
    async setQuality(quality) {
        if (!this.isInitialized) {
            throw new Error('Netflix service not initialized');
        }
        try {
            await this.mainWindow.webContents.executeJavaScript(`
        (() => {
          const video = document.querySelector('video');
          if (!video) return;
          
          // Set video quality based on the provided quality object
          const bitrate = ${quality.bitrate};
          const resolution = ${quality.width} + 'x' + ${quality.height};
          
          // Netflix uses a custom API for quality control
          if (window.netflix && window.netflix.appQuality) {
            window.netflix.appQuality.setBitrate(bitrate);
            window.netflix.appQuality.setResolution(resolution);
          }
        })();
      `);
            console.log('Video quality set to:', quality);
        }
        catch (error) {
            console.error('Failed to set video quality:', error);
            throw error;
        }
    }
    async getContentWarnings() {
        if (!this.isAnalyzing) {
            return [];
        }
        try {
            // Capture current frame
            const frame = await this.mainWindow.webContents.executeJavaScript(`
        (() => {
          const video = document.querySelector('video');
          if (!video) return null;
          
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          return {
            data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
            width: canvas.width,
            height: canvas.height,
            timestamp: Date.now()
          };
        })();
      `);
            if (frame) {
                return await this.contentAnalyzer.analyzeFrame(frame);
            }
            return [];
        }
        catch (error) {
            console.error('Failed to get content warnings:', error);
            return [];
        }
    }
    async enterFullscreen() {
        if (!this.isInitialized) {
            throw new Error('Netflix service not initialized');
        }
        console.log('Entering fullscreen mode');
    }
    async exitFullscreen() {
        if (!this.isInitialized) {
            throw new Error('Netflix service not initialized');
        }
        console.log('Exiting fullscreen mode');
    }
    async isFullscreen() {
        if (!this.isInitialized) {
            throw new Error('Netflix service not initialized');
        }
        return this.mainWindow.isFullScreen();
    }
}
exports.NetflixService = NetflixService;
//# sourceMappingURL=netflix.js.map