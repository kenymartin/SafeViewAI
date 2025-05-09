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
const fs = __importStar(require("fs"));
const manager_1 = require("./services/streaming/manager");
// import { NetflixService } from './services/streaming/netflix';
let mainWindow = null;
let streamingManager = null;
const WINDOW_STATE_FILE = path.join(electron_1.app.getPath('userData'), 'window-state.json');
async function loadWindowState() {
    try {
        if (fs.existsSync(WINDOW_STATE_FILE)) {
            const data = await fs.promises.readFile(WINDOW_STATE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Error loading window state:', error);
    }
    return null;
}
async function saveWindowState() {
    if (!mainWindow)
        return;
    try {
        const state = {
            width: mainWindow.getBounds().width,
            height: mainWindow.getBounds().height,
            x: mainWindow.getBounds().x,
            y: mainWindow.getBounds().y,
            isMaximized: mainWindow.isMaximized(),
            isFullscreen: mainWindow.isFullScreen()
        };
        await fs.promises.writeFile(WINDOW_STATE_FILE, JSON.stringify(state));
    }
    catch (error) {
        console.error('Error saving window state:', error);
    }
}
async function createWindow() {
    try {
        // Get the primary display
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        // Load saved window state
        const savedState = await loadWindowState();
        // Create a standard browser window
        mainWindow = new electron_1.BrowserWindow({
            width: savedState?.width || width,
            height: savedState?.height || height,
            x: savedState?.x,
            y: savedState?.y,
            show: false,
            frame: false,
            fullscreen: savedState?.isFullscreen || true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: true,
                allowRunningInsecureContent: false
            },
            backgroundColor: '#000000'
        });
        // Restore window state
        if (savedState?.isMaximized) {
            mainWindow.maximize();
        }
        // Save window state on changes
        mainWindow.on('resize', saveWindowState);
        mainWindow.on('move', saveWindowState);
        mainWindow.on('maximize', saveWindowState);
        mainWindow.on('unmaximize', saveWindowState);
        mainWindow.on('enter-full-screen', saveWindowState);
        mainWindow.on('leave-full-screen', saveWindowState);
        // Initialize streaming manager with main window
        streamingManager = new manager_1.StreamingManager(mainWindow);
        // Set up session cache
        try {
            const session = mainWindow.webContents.session;
            await session.setPermissionRequestHandler((webContents, permission, callback) => {
                const allowedPermissions = ['media', 'display-capture', 'fullscreen'];
                callback(allowedPermissions.includes(permission));
            });
        }
        catch (error) {
            console.error('Error setting up session:', error);
        }
        // Load the initialization HTML
        try {
            const htmlPath = isDev
                ? path.join(__dirname, '..', 'src', 'renderer', 'initialization.html')
                : path.join(__dirname, '..', 'renderer', 'initialization.html');
            console.log('Loading HTML from:', htmlPath);
            await mainWindow.loadFile(htmlPath);
        }
        catch (error) {
            console.error('Error loading HTML:', error);
            throw error;
        }
        // Show window when ready
        mainWindow.once('ready-to-show', () => {
            if (mainWindow) {
                // Show the window immediately
                mainWindow.show();
            }
        });
        // Handle window close
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
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
        await createWindow();
        // Initialize Netflix service after window creation
        if (streamingManager) {
            await streamingManager.initializeService('netflix');
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
// Handle content analysis events
electron_1.ipcMain.handle('get-content-warnings', async () => {
    try {
        const netflixService = streamingManager?.getService('netflix');
        if (netflixService) {
            const warnings = await netflixService.getContentWarnings();
            return { success: true, warnings };
        }
        return { success: false, error: 'Netflix service not available' };
    }
    catch (error) {
        console.error('Error getting content warnings:', error);
        return { success: false, error: error.message };
    }
});
// Handle filter application
electron_1.ipcMain.handle('apply-filter', async () => {
    try {
        const netflixService = streamingManager?.getService('netflix');
        if (netflixService) {
            // Apply filter to Netflix service
            // This would involve modifying the video stream or applying overlays
            return { success: true };
        }
        return { success: false, error: 'Netflix service not available' };
    }
    catch (error) {
        console.error('Error applying filter:', error);
        return { success: false, error: error.message };
    }
});
// Handle video control events
electron_1.ipcMain.handle('video-control', async (event, action) => {
    try {
        const netflixService = streamingManager?.getService('netflix');
        if (netflixService) {
            switch (action) {
                case 'play':
                    // Handle play action
                    break;
                case 'pause':
                    // Handle pause action
                    break;
                case 'seek':
                    // Handle seek action
                    break;
            }
            return { success: true };
        }
        return { success: false, error: 'Netflix service not available' };
    }
    catch (error) {
        console.error('Error handling video control:', error);
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