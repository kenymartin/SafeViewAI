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
const electron_1 = require("electron");
const path = __importStar(require("path"));
const isDev = __importStar(require("electron-is-dev"));
const manager_1 = require("./services/streaming/manager");
let mainWindow = null;
let streamingManager = null;
async function createWindow() {
    try {
        console.log('Creating main window...');
        // Get the primary display
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        // Create the browser window
        mainWindow = new electron_1.BrowserWindow({
            width: width,
            height: height,
            show: false,
            fullscreen: !isDev,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: true,
                allowRunningInsecureContent: false
            }
        });
        console.log('Main window created successfully');
        // Initialize streaming manager with main window
        streamingManager = new manager_1.StreamingManager(mainWindow);
        // Set aspect ratio for TV displays (16:9)
        mainWindow.setAspectRatio(16 / 9);
        // Set up session cache
        try {
            const session = mainWindow.webContents.session;
            await session.setPermissionRequestHandler((webContents, permission, callback) => {
                const allowedPermissions = ['media', 'display-capture', 'fullscreen'];
                callback(allowedPermissions.includes(permission));
            });
            console.log('Session permissions configured');
        }
        catch (error) {
            console.error('Error setting up session:', error);
        }
        // Load the initialization HTML
        try {
            const htmlPath = path.join(__dirname, '..', 'src', 'renderer', 'initialization.html');
            console.log('Loading HTML from:', htmlPath);
            await mainWindow.loadFile(htmlPath);
            console.log('HTML loaded successfully');
        }
        catch (error) {
            console.error('Error loading HTML:', error);
            throw error;
        }
        // Show window when ready
        mainWindow.once('ready-to-show', () => {
            console.log('Window ready to show');
            if (mainWindow) {
                // Set window to be always on top and transparent
                mainWindow.setAlwaysOnTop(true, 'screen-saver');
                mainWindow.setIgnoreMouseEvents(true);
                // Don't show the window yet - it will be shown when Netflix is detected
            }
        });
        // Handle window close
        mainWindow.on('closed', () => {
            console.log('Window closed');
            mainWindow = null;
        });
        // Set up viewport adaptation
        mainWindow.webContents.on('did-finish-load', () => {
            console.log('Content finished loading, setting up viewport adaptation');
            // Send initial viewport dimensions to renderer
            if (mainWindow) {
                mainWindow.webContents.send('viewport-update', {
                    width: width,
                    height: height,
                    aspectRatio: 16 / 9
                });
            }
        });
        // Handle window state changes
        mainWindow.on('enter-full-screen', () => {
            console.log('Window entered fullscreen mode');
            if (mainWindow) {
                mainWindow.setAlwaysOnTop(true, 'screen-saver');
                mainWindow.setIgnoreMouseEvents(true);
            }
        });
        // Ensure window stays on top
        setInterval(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.setAlwaysOnTop(true, 'screen-saver');
            }
        }, 1000);
        return mainWindow;
    }
    catch (error) {
        console.error('Error in createWindow:', error);
        throw error;
    }
}
// Create window when app is ready
electron_1.app.whenReady().then(async () => {
    try {
        console.log('App is ready, creating window...');
        await createWindow();
        // Initialize Netflix service after window creation
        if (streamingManager) {
            console.log('Initializing Netflix service...');
            try {
                await streamingManager.initializeService('netflix');
                console.log('Netflix service initialized successfully');
            }
            catch (error) {
                console.error('Failed to initialize Netflix service:', error);
            }
        }
        else {
            console.error('Streaming manager not available');
        }
    }
    catch (error) {
        console.error('Error in app initialization:', error);
    }
});
// Handle process crashes
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', async () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    }
});
// Handle IPC events from renderer process
electron_1.ipcMain.on('app-ready', (event) => {
    console.log('Renderer process is ready');
    event.reply('app-ready-reply', 'Main process acknowledged');
});
// Handle streaming service events
electron_1.ipcMain.handle('initialize-service', async (event, serviceName) => {
    try {
        await streamingManager?.initializeService(serviceName);
        return { success: true };
    }
    catch (error) {
        console.error('Error initializing service:', error);
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('play-video', async (event, serviceName, videoId) => {
    try {
        await streamingManager?.playVideo(serviceName, videoId);
        return { success: true };
    }
    catch (error) {
        console.error('Error playing video:', error);
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('get-current-video', async () => {
    try {
        const video = await streamingManager?.getCurrentVideo();
        return { success: true, video };
    }
    catch (error) {
        console.error('Error getting current video:', error);
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('enter-fullscreen', async () => {
    try {
        await streamingManager?.enterFullscreen();
        const isFullscreen = await streamingManager?.isFullscreen();
        if (isFullscreen && mainWindow) {
            // Create and show initialization popup
            const popup = new electron_1.BrowserWindow({
                width: 400,
                height: 200,
                frame: false,
                transparent: true,
                resizable: false,
                alwaysOnTop: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: path.join(__dirname, 'preload.js'),
                },
            });
            // Load initialization HTML
            const htmlPath = path.join(__dirname, '..', 'src', 'renderer', 'initialization.html');
            await popup.loadFile(htmlPath);
            // Center popup on primary display
            const { x, y } = electron_1.screen.getPrimaryDisplay().workArea;
            popup.setPosition(x + (electron_1.screen.getPrimaryDisplay().workArea.width - 400) / 2, y + (electron_1.screen.getPrimaryDisplay().workArea.height - 200) / 2);
            // Auto-close popup after 3 seconds
            setTimeout(() => {
                popup.close();
            }, 3000);
            // Adapt TV viewport to 16:9
            const display = electron_1.screen.getPrimaryDisplay();
            const { width, height } = display.workAreaSize;
            // Calculate 16:9 dimensions
            const aspectRatio = 16 / 9;
            let newWidth = width;
            let newHeight = width / aspectRatio;
            // If height is too large, scale down
            if (newHeight > height) {
                newHeight = height;
                newWidth = height * aspectRatio;
            }
            // Center the window
            const centerX = Math.round((width - newWidth) / 2);
            const centerY = Math.round((height - newHeight) / 2);
            // Set window bounds
            mainWindow.setBounds({ x: centerX, y: centerY, width: newWidth, height: newHeight });
            // Notify renderer about viewport change
            mainWindow.webContents.send('viewport-update', {
                width: newWidth,
                height: newHeight,
                x: centerX,
                y: centerY
            });
            mainWindow.show();
            mainWindow.setFullScreen(true);
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error entering fullscreen:', error);
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('exit-fullscreen', async () => {
    try {
        await streamingManager?.exitFullscreen();
        if (mainWindow) {
            mainWindow.hide();
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error exiting fullscreen:', error);
        return { success: false, error: error.message };
    }
});
// Handle GPU info updates (only log on significant changes)
let lastGpuInfo = '';
electron_1.app.on('gpu-info-update', async () => {
    try {
        const gpuInfo = await electron_1.app.getGPUInfo('complete');
        const currentInfo = JSON.stringify(gpuInfo);
        if (currentInfo !== lastGpuInfo) {
            const activeGpu = gpuInfo.gpuDevice.find(device => device.active);
            if (activeGpu) {
                console.log('Active GPU:', activeGpu.driverVendor, activeGpu.driverVersion);
            }
            lastGpuInfo = currentInfo;
        }
    }
    catch (error) {
        console.error('Error getting GPU info:', error);
    }
});
// Clean up on app quit
electron_1.app.on('will-quit', async () => {
    try {
        if (streamingManager) {
            await streamingManager.cleanup();
        }
    }
    catch (error) {
        console.error('Error during cleanup:', error);
    }
});
//# sourceMappingURL=main.js.map