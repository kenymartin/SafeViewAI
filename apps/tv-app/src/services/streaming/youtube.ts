import { StreamingService, VideoMetadata, StreamingQuality } from './types';
import { BrowserWindow, screen } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class YouTubeService implements StreamingService {
  name = 'youtube';
  private initialized = false;
  private mainWindow: BrowserWindow | null = null;
  private youtubeProcessId: number | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize YouTube detection
    this.setupYouTubeDetection();
    this.initialized = true;
  }

  private setupYouTubeDetection() {
    if (!this.mainWindow) return;

    // Check for YouTube process
    const checkYouTubeProcess = async () => {
      try {
        // On Windows, look for Chrome/Edge with YouTube
        if (process.platform === 'win32') {
          const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq chrome.exe" /NH');
          const chromeRunning = stdout.includes('chrome.exe');
          
          if (chromeRunning) {
            // Check if any Chrome window has YouTube open
            const windows = BrowserWindow.getAllWindows();
            const youtubeWindow = windows.find(win => {
              try {
                const url = win.webContents.getURL();
                return url.includes('youtube.com/watch');
              } catch (e) {
                return false;
              }
            });
            
            if (youtubeWindow && !this.youtubeProcessId) {
              console.log('YouTube video detected');
              this.youtubeProcessId = 1; // Placeholder
              this.showInitializationPopup();
              this.adaptViewport();
            } else if (!youtubeWindow && this.youtubeProcessId) {
              console.log('YouTube video closed');
              this.youtubeProcessId = null;
              if (this.mainWindow) {
                this.mainWindow.hide();
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking YouTube process:', error);
      }
    };

    // Check every second for YouTube process
    this.checkInterval = setInterval(checkYouTubeProcess, 1000);
  }

  private async showInitializationPopup() {
    if (!this.mainWindow) return;

    const popup = new BrowserWindow({
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

  private adaptViewport() {
    if (!this.mainWindow) return;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    // Calculate 16:9 dimensions
    const aspectRatio = 16/9;
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

  // Clean up resources when service is no longer needed
  async cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async playVideo(videoId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('YouTube service not initialized');
    }

    console.log(`Playing YouTube video: ${videoId}`);
  }

  async getCurrentVideo(): Promise<VideoMetadata | null> {
    if (!this.initialized) {
      throw new Error('YouTube service not initialized');
    }

    return {
      title: 'Sample YouTube Title',
      platform: 'youtube',
      quality: {
        width: 1920,
        height: 1080,
        fps: 60,
        bitrate: 15000000 // 15 Mbps
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    };
  }

  async setQuality(quality: StreamingQuality): Promise<void> {
    if (!this.initialized) {
      throw new Error('YouTube service not initialized');
    }

    console.log('Setting YouTube quality:', quality);
  }

  async enterFullscreen(): Promise<void> {
    if (!this.initialized) {
      throw new Error('YouTube service not initialized');
    }

    console.log('Entering YouTube fullscreen');
  }

  async exitFullscreen(): Promise<void> {
    if (!this.initialized) {
      throw new Error('YouTube service not initialized');
    }

    console.log('Exiting YouTube fullscreen');
  }

  async isFullscreen(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('YouTube service not initialized');
    }

    return false;
  }
} 