import { app, BrowserWindow, ipcMain, screen, session } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import * as fs from 'fs';
import { StreamingManager } from './services/streaming/manager';
import { NetflixService } from './services/streaming/netflix';

let mainWindow: BrowserWindow | null = null;
let streamingManager: StreamingManager | null = null;

async function createWindow() {
  try {
    console.log('Creating main window...');
    
    // Get the primary display
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    // Create a standard browser window
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      frame: true, // Use standard window frame
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false
      },
      backgroundColor: '#00FF00' // Green background for visibility
    });

    console.log('Main window created successfully');

    // Initialize streaming manager with main window
    streamingManager = new StreamingManager(mainWindow);

    // Set up session cache
    try {
      const session = mainWindow.webContents.session;
      await session.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['media', 'display-capture', 'fullscreen'];
        callback(allowedPermissions.includes(permission));
      });
      console.log('Session permissions configured');
    } catch (error) {
      console.error('Error setting up session:', error);
    }

    // Load the initialization HTML
    try {
      const htmlPath = path.join(__dirname, '..', 'renderer', 'initialization.html');
      console.log('Loading HTML from:', htmlPath);
      await mainWindow.loadFile(htmlPath);
      console.log('HTML loaded successfully');
    } catch (error) {
      console.error('Error loading HTML:', error);
      throw error;
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      console.log('Window ready to show');
      if (mainWindow) {
        // Show the window immediately
        mainWindow.show();
        console.log('Main window shown');
      }
    });

    // Handle window close
    mainWindow.on('closed', () => {
      console.log('Window closed');
      mainWindow = null;
    });

    return mainWindow;
  } catch (error) {
    console.error('Error in createWindow:', error);
    throw error;
  }
}

// Create window when app is ready
app.whenReady().then(async () => {
  try {
    console.log('App is ready, creating window...');
    await createWindow();
    
    // Initialize Netflix service after window creation
    if (streamingManager) {
      console.log('Initializing Netflix service...');
      try {
        await streamingManager.initializeService('netflix');
        console.log('Netflix service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Netflix service:', error);
      }
    } else {
      console.error('Streaming manager not available');
    }
  } catch (error) {
    console.error('Error in app initialization:', error);
  }
});

// Handle process crashes
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// Handle IPC events from renderer process
ipcMain.on('app-ready', (event) => {
  console.log('Renderer process is ready');
  event.reply('app-ready-reply', 'Main process acknowledged');
});

// Handle streaming service events
ipcMain.handle('initialize-service', async (event, serviceName: string) => {
  try {
    await streamingManager?.initializeService(serviceName);
    return { success: true };
  } catch (error: any) {
    console.error('Error initializing service:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('play-video', async (event, serviceName: string, videoId: string) => {
  try {
    await streamingManager?.playVideo(serviceName, videoId);
    return { success: true };
  } catch (error: any) {
    console.error('Error playing video:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-current-video', async () => {
  try {
    const video = await streamingManager?.getCurrentVideo();
    return { success: true, video };
  } catch (error: any) {
    console.error('Error getting current video:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('enter-fullscreen', async () => {
  try {
    await streamingManager?.enterFullscreen();
    const isFullscreen = await streamingManager?.isFullscreen();
    
    if (isFullscreen && mainWindow) {
      // Create and show initialization popup
      const popup = new BrowserWindow({
        width: 400,
        height: 200,
        frame: true, // Use standard window frame
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        },
      });

      // Load initialization HTML
      const htmlPath = path.join(__dirname, '..', 'renderer', 'initialization.html');
      await popup.loadFile(htmlPath);

      // Center popup on primary display
      const { x, y } = screen.getPrimaryDisplay().workArea;
      popup.setPosition(x + (screen.getPrimaryDisplay().workArea.width - 400) / 2, 
                       y + (screen.getPrimaryDisplay().workArea.height - 200) / 2);

      // Auto-close popup after 3 seconds
      setTimeout(() => {
        popup.close();
      }, 3000);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error entering fullscreen:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('exit-fullscreen', async () => {
  try {
    await streamingManager?.exitFullscreen();
    if (mainWindow) {
      mainWindow.hide();
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error exiting fullscreen:', error);
    return { success: false, error: error.message };
  }
});

// Handle GPU info updates (only log on significant changes)
let lastGpuInfo = '';
app.on('gpu-info-update', async () => {
  try {
    const gpuInfo = await app.getGPUInfo('complete') as {
      gpuDevice: Array<{
        active: boolean;
        deviceId: number;
        driverVendor: string;
        driverVersion: string;
      }>;
    };
    
    const currentInfo = JSON.stringify(gpuInfo);
    if (currentInfo !== lastGpuInfo) {
      const activeGpu = gpuInfo.gpuDevice.find(device => device.active);
      if (activeGpu) {
        console.log('Active GPU:', activeGpu.driverVendor, activeGpu.driverVersion);
      }
      lastGpuInfo = currentInfo;
    }
  } catch (error) {
    console.error('Error getting GPU info:', error);
  }
});

// Clean up on app quit
app.on('will-quit', async () => {
  try {
    if (streamingManager) {
      await streamingManager.cleanup();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}); 