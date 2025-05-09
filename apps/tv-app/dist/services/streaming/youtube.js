"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeService = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class YouTubeService {
    constructor(mainWindow) {
        this.name = 'youtube';
        this.isInitialized = false;
        this.youtubeProcessId = null;
        this.checkInterval = null;
        this.currentVideo = null;
        this.mainWindow = mainWindow;
    }
    async initialize() {
        if (this.isInitialized) {
            console.log('YouTube service already initialized');
            return;
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        try {
            console.log('Initializing YouTube service...');
            await this.mainWindow.loadURL('https://www.youtube.com');
            this.isInitialized = true;
            console.log('YouTube service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize YouTube service:', error);
            throw error;
        }
    }
    setupYouTubeDetection() {
        if (!this.mainWindow)
            return;
        // Check for YouTube process
        const checkYouTubeProcess = async () => {
            try {
                // On Windows, look for Chrome/Edge with YouTube
                if (process.platform === 'win32') {
                    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq chrome.exe" /NH');
                    const chromeRunning = stdout.includes('chrome.exe');
                    if (chromeRunning) {
                        // Check if any Chrome window has YouTube open
                        const windows = electron_1.BrowserWindow.getAllWindows();
                        const youtubeWindow = windows.find(win => {
                            try {
                                const url = win.webContents.getURL();
                                return url.includes('youtube.com/watch');
                            }
                            catch (e) {
                                return false;
                            }
                        });
                        if (youtubeWindow && !this.youtubeProcessId) {
                            console.log('YouTube video detected');
                            this.youtubeProcessId = 1; // Placeholder
                            this.showInitializationPopup();
                            this.adaptViewport();
                        }
                        else if (!youtubeWindow && this.youtubeProcessId) {
                            console.log('YouTube video closed');
                            this.youtubeProcessId = null;
                            if (this.mainWindow) {
                                this.mainWindow.hide();
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error checking YouTube process:', error);
            }
        };
        // Check every second for YouTube process
        this.checkInterval = setInterval(checkYouTubeProcess, 1000);
    }
    async showInitializationPopup() {
        if (!this.mainWindow)
            return;
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
        // Load initialization HTML
        await popup.loadFile('src/renderer/initialization.html');
        // Center popup on primary display
        const { x, y } = popup.getBounds();
        popup.setPosition(x + 200, y + 100);
        // Auto-close after 5 seconds
        setTimeout(() => {
            popup.close();
        }, 5000);
    }
    adaptViewport() {
        if (!this.mainWindow)
            return;
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
    async playVideo(videoId) {
        if (!this.isInitialized) {
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        try {
            await this.mainWindow.loadURL(`https://www.youtube.com/watch?v=${videoId}`);
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
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        try {
            const videoInfo = await this.mainWindow.webContents.executeJavaScript(`
        (() => {
          const video = document.querySelector('video');
          if (!video) return null;
          
          return {
            title: document.title,
            platform: 'youtube',
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
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        try {
            await this.mainWindow.webContents.executeJavaScript(`
        (() => {
          const video = document.querySelector('video');
          if (!video) return;
          
          // Set video quality based on the provided quality object
          const bitrate = ${quality.bitrate};
          const resolution = ${quality.width} + 'x' + ${quality.height};
          
          // YouTube uses a custom API for quality control
          if (window.ytplayer && window.ytplayer.config) {
            window.ytplayer.config.args.quality = resolution;
            window.ytplayer.config.args.bitrate = bitrate;
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
    async enterFullscreen() {
        if (!this.isInitialized) {
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        console.log('Entering fullscreen mode');
    }
    async exitFullscreen() {
        if (!this.isInitialized) {
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        console.log('Exiting fullscreen mode');
    }
    async isFullscreen() {
        if (!this.isInitialized) {
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        return this.mainWindow.isFullScreen();
    }
    async getContentWarnings() {
        if (!this.isInitialized) {
            throw new Error('YouTube service not initialized');
        }
        if (!this.mainWindow) {
            throw new Error('Main window not available');
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
                // In a real implementation, this would use the AI processor
                // For now, return mock warnings
                return [
                    {
                        type: 'content_warning',
                        confidence: 0.85,
                        description: 'Content that may require viewer discretion'
                    }
                ];
            }
            return [];
        }
        catch (error) {
            console.error('Failed to get content warnings:', error);
            return [];
        }
    }
    async cleanup() {
        console.log('Cleaning up YouTube service...');
        this.isInitialized = false;
        this.currentVideo = null;
        console.log('YouTube service cleanup completed');
    }
}
exports.YouTubeService = YouTubeService;
//# sourceMappingURL=youtube.js.map