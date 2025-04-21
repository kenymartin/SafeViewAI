"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetflixService = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class NetflixService {
    constructor(mainWindow) {
        this.name = 'netflix';
        this.initialized = false;
        this.mainWindow = null;
        this.netflixProcessId = null;
        this.checkInterval = null;
        this.isMonitoring = false;
        this.recoveryAttempts = 0;
        this.MAX_RECOVERY_ATTEMPTS = 3;
        this.lastWindowState = {
            isMaximized: false,
            isFullscreen: false
        };
        this.mainWindow = mainWindow;
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Initialize Netflix detection
            await this.setupNetflixDetection();
            this.initialized = true;
            console.log('Netflix service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Netflix service:', error);
            throw error;
        }
    }
    async setupNetflixDetection() {
        if (!this.mainWindow) {
            throw new Error('Main window not available');
        }
        if (this.isMonitoring) {
            console.log('Netflix monitoring already active');
            return;
        }
        this.isMonitoring = true;
        this.recoveryAttempts = 0;
        // Check for Netflix process
        const checkNetflixProcess = async () => {
            try {
                if (process.platform === 'win32') {
                    // Check for Netflix desktop app with more detailed process info
                    const { stdout: processList } = await execAsync('tasklist /FI "IMAGENAME eq Netflix.exe" /NH /FO CSV /V');
                    const netflixRunning = processList.includes('Netflix.exe');
                    if (netflixRunning) {
                        console.log('Netflix process detected');
                        // ALWAYS show main window when Netflix is running
                        if (this.mainWindow) {
                            this.mainWindow.show();
                            this.mainWindow.setAlwaysOnTop(true, 'screen-saver');
                            console.log('Main window shown and set to always on top');
                        }
                        // Get detailed process info including PID and window state
                        const { stdout: processInfo } = await execAsync('powershell -command "Get-Process Netflix | Select-Object Id,MainWindowTitle,MainWindowHandle,Responding"');
                        console.log('Process info:', processInfo);
                        // Check if Netflix window exists and is visible
                        const hasMainWindow = processInfo.includes('MainWindowHandle') && !processInfo.includes('0');
                        if (hasMainWindow) {
                            const pidMatch = processInfo.match(/Id\s+MainWindowTitle\s*\n\s*(\d+)\s+/);
                            if (pidMatch) {
                                const currentPid = parseInt(pidMatch[1], 10);
                                console.log('Netflix PID:', currentPid);
                                // Get window state using PowerShell with more detailed info
                                const { stdout: windowState } = await execAsync(`
                  powershell -command "
                    $process = Get-Process -Id ${currentPid};
                    $handle = $process.MainWindowHandle;
                    if ($handle -ne 0) {
                      $maximized = $process.MainWindowHandle -ne 0;
                      $fullscreen = $maximized -and $process.MainWindowTitle -match 'Netflix';
                      $title = $process.MainWindowTitle;
                      @{
                        Maximized = $maximized;
                        Fullscreen = $fullscreen;
                        Handle = $handle;
                        Title = $title;
                        Responding = $process.Responding
                      } | ConvertTo-Json
                    }
                  "
                `);
                                if (windowState && windowState.trim()) {
                                    const state = JSON.parse(windowState.trim());
                                    console.log('Window state:', state);
                                    const windowChanged = state.Maximized !== this.lastWindowState.isMaximized ||
                                        state.Fullscreen !== this.lastWindowState.isFullscreen;
                                    this.lastWindowState = {
                                        isMaximized: state.Maximized,
                                        isFullscreen: state.Fullscreen
                                    };
                                    if (this.netflixProcessId !== currentPid || windowChanged) {
                                        console.log('Netflix window state changed:', this.lastWindowState);
                                        this.netflixProcessId = currentPid;
                                        // Show popup and adapt viewport
                                        if (this.mainWindow) {
                                            await this.showInitializationPopup();
                                            await this.adaptViewport();
                                        }
                                    }
                                }
                            }
                        }
                        else if (this.netflixProcessId) {
                            console.log('Netflix window no longer visible');
                            this.netflixProcessId = null;
                            // Don't hide the main window, just keep it visible
                        }
                    }
                    else if (this.netflixProcessId) {
                        console.log('Netflix process no longer running');
                        this.netflixProcessId = null;
                        if (this.mainWindow) {
                            this.mainWindow.hide();
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error checking Netflix process:', error);
                await this.attemptRecovery();
            }
        };
        // Initial check
        await checkNetflixProcess();
        // Set up interval for continuous monitoring (check more frequently)
        this.checkInterval = setInterval(checkNetflixProcess, 500);
    }
    async attemptRecovery() {
        try {
            // Check if we've exceeded maximum recovery attempts
            if (this.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
                console.error('Maximum recovery attempts reached. Stopping recovery.');
                this.cleanup();
                return;
            }
            this.recoveryAttempts++;
            console.log(`Recovery attempt ${this.recoveryAttempts} of ${this.MAX_RECOVERY_ATTEMPTS}`);
            // Clear existing interval
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }
            // Reset state
            this.isMonitoring = false;
            this.netflixProcessId = null;
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Restart monitoring
            await this.setupNetflixDetection();
        }
        catch (error) {
            console.error('Recovery attempt failed:', error);
            // If recovery fails, increment attempts and try again
            this.recoveryAttempts++;
            if (this.recoveryAttempts < this.MAX_RECOVERY_ATTEMPTS) {
                await this.attemptRecovery();
            }
            else {
                console.error('Maximum recovery attempts reached. Stopping recovery.');
                this.cleanup();
            }
        }
    }
    async showInitializationPopup() {
        if (!this.mainWindow)
            return;
        try {
            console.log('Creating initialization popup...');
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
            const htmlPath = path_1.default.join(__dirname, '..', 'renderer', 'initialization.html');
            console.log('Loading initialization HTML from:', htmlPath);
            await popup.loadFile(htmlPath);
            // Get primary display work area
            const primaryDisplay = electron_1.screen.getPrimaryDisplay();
            const { x, y, width, height } = primaryDisplay.workArea;
            // Calculate center position
            const popupX = x + Math.floor((width - 400) / 2);
            const popupY = y + Math.floor((height - 200) / 2);
            // Set position with animation
            popup.setPosition(popupX, popupY);
            popup.setOpacity(0);
            popup.show();
            // Fade in
            let opacity = 0;
            const fadeInterval = setInterval(() => {
                opacity += 0.1;
                if (opacity >= 1) {
                    clearInterval(fadeInterval);
                }
                popup.setOpacity(opacity);
            }, 50);
            // Auto-close after 3 seconds with fade out
            setTimeout(() => {
                const fadeOutInterval = setInterval(() => {
                    opacity -= 0.1;
                    if (opacity <= 0) {
                        clearInterval(fadeOutInterval);
                        popup.close();
                    }
                    popup.setOpacity(opacity);
                }, 50);
            }, 3000);
        }
        catch (error) {
            console.error('Error showing initialization popup:', error);
        }
    }
    async adaptViewport() {
        if (!this.mainWindow)
            return;
        try {
            console.log('Adapting viewport for Netflix...');
            // Get the primary display
            const primaryDisplay = electron_1.screen.getPrimaryDisplay();
            const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
            // Calculate 16:9 dimensions
            let viewportWidth = screenWidth;
            let viewportHeight = screenWidth * (9 / 16);
            // If height is too large, scale based on height instead
            if (viewportHeight > screenHeight) {
                viewportHeight = screenHeight;
                viewportWidth = screenHeight * (16 / 9);
            }
            // Center the viewport
            const x = Math.max(0, (screenWidth - viewportWidth) / 2);
            const y = Math.max(0, (screenHeight - viewportHeight) / 2);
            console.log('Setting viewport dimensions:', {
                width: viewportWidth,
                height: viewportHeight,
                x,
                y
            });
            // Set the window bounds
            this.mainWindow.setBounds({
                x: Math.round(x),
                y: Math.round(y),
                width: Math.round(viewportWidth),
                height: Math.round(viewportHeight)
            });
            // Ensure window is visible and on top
            this.mainWindow.show();
            this.mainWindow.setAlwaysOnTop(true, 'screen-saver');
            // Send viewport update to renderer
            this.mainWindow.webContents.send('viewport-update', {
                width: viewportWidth,
                height: viewportHeight,
                x,
                y,
                aspectRatio: 16 / 9
            });
            console.log('Viewport adaptation complete');
        }
        catch (error) {
            console.error('Error adapting viewport:', error);
        }
    }
    async cleanup() {
        this.isMonitoring = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.netflixProcessId = null;
        this.initialized = false;
    }
    async playVideo(videoId) {
        if (!this.initialized) {
            throw new Error('Netflix service not initialized');
        }
        // Play video using Netflix API
        // This would use Netflix's official API or a compatible library
        console.log(`Playing Netflix video: ${videoId}`);
    }
    async getCurrentVideo() {
        if (!this.initialized) {
            throw new Error('Netflix service not initialized');
        }
        // Get current video info from Netflix API
        // This would use Netflix's official API or a compatible library
        // For now, return mock data
        return {
            title: 'Sample Netflix Title',
            platform: 'netflix',
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
    async setQuality(quality) {
        if (!this.initialized) {
            throw new Error('Netflix service not initialized');
        }
        // Set video quality using Netflix API
        // This would use Netflix's official API or a compatible library
        console.log('Setting Netflix quality:', quality);
    }
    async enterFullscreen() {
        if (!this.initialized) {
            throw new Error('Netflix service not initialized');
        }
        // Enter fullscreen using Netflix API
        // This would use Netflix's official API or a compatible library
        console.log('Entering Netflix fullscreen');
    }
    async exitFullscreen() {
        if (!this.initialized) {
            throw new Error('Netflix service not initialized');
        }
        // Exit fullscreen using Netflix API
        // This would use Netflix's official API or a compatible library
        console.log('Exiting Netflix fullscreen');
    }
    async isFullscreen() {
        if (!this.initialized) {
            throw new Error('Netflix service not initialized');
        }
        // Check fullscreen state using Netflix API
        // This would use Netflix's official API or a compatible library
        return false;
    }
}
exports.NetflixService = NetflixService;
//# sourceMappingURL=netflix.js.map