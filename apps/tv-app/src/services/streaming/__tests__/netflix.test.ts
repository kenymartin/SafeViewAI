import { NetflixService } from '../netflix';
import { BrowserWindow, screen } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock electron modules
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    setBounds: jest.fn(),
    setAlwaysOnTop: jest.fn(),
    setIgnoreMouseEvents: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    webContents: {
      send: jest.fn()
    },
    getBounds: jest.fn().mockReturnValue({ x: 0, y: 0, width: 1920, height: 1080 }),
    close: jest.fn()
  })),
  screen: {
    getPrimaryDisplay: jest.fn().mockReturnValue({
      workArea: { x: 0, y: 0, width: 1920, height: 1080 },
      workAreaSize: { width: 1920, height: 1080 }
    })
  }
}));

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('NetflixService', () => {
  let netflixService: NetflixService;
  const TEST_TIMEOUT = 30000; // 30 seconds timeout

  beforeEach(() => {
    netflixService = new NetflixService();
  });

  afterEach(() => {
    netflixService.cleanup();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      // Mock successful process check
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        if (cmd.includes('tasklist')) {
          callback(null, 'netflix.exe');
        } else {
          callback(null, '');
        }
      });

      await netflixService.initialize();
      expect(netflixService.isInitialized()).toBe(true);
    }, TEST_TIMEOUT);

    it('should handle initialization failure', async () => {
      // Mock failed process check
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        callback(new Error('Process check failed'));
      });

      await expect(netflixService.initialize()).rejects.toThrow('Process check failed');
      expect(netflixService.isInitialized()).toBe(false);
    }, TEST_TIMEOUT);
  });

  describe('window state detection', () => {
    beforeEach(async () => {
      // Initialize service
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        if (cmd.includes('tasklist')) {
          callback(null, 'netflix.exe');
        } else {
          callback(null, '');
        }
      });
      await netflixService.initialize();
    }, TEST_TIMEOUT);

    it('should detect window state changes', async () => {
      // Mock window state change
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        if (cmd.includes('tasklist')) {
          callback(null, 'netflix.exe');
        } else if (cmd.includes('Get-WindowState')) {
          callback(null, 'Maximized');
        } else {
          callback(null, '');
        }
      });

      // Wait for state change detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(netflixService.isMaximized()).toBe(true);
    }, TEST_TIMEOUT);

    it('should handle process termination', async () => {
      // Mock process termination
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        if (cmd.includes('tasklist')) {
          callback(null, '');
        } else {
          callback(null, '');
        }
      });

      // Wait for process termination detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(netflixService.isInitialized()).toBe(false);
    }, TEST_TIMEOUT);
  });

  describe('viewport adaptation', () => {
    beforeEach(async () => {
      // Initialize service
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        if (cmd.includes('tasklist')) {
          callback(null, 'netflix.exe');
        } else {
          callback(null, '');
        }
      });
      await netflixService.initialize();
    }, TEST_TIMEOUT);

    it('should adapt viewport to 16:9 ratio', async () => {
      const mockWindow = {
        setBounds: jest.fn(),
        center: jest.fn(),
      };
      (BrowserWindow as jest.Mock).mockReturnValue(mockWindow);

      await netflixService.adaptViewport();
      expect(mockWindow.setBounds).toHaveBeenCalled();
      expect(mockWindow.center).toHaveBeenCalled();
    }, TEST_TIMEOUT);

    it('should handle viewport adaptation errors', async () => {
      const mockWindow = {
        setBounds: jest.fn().mockImplementation(() => {
          throw new Error('Viewport adaptation failed');
        }),
        center: jest.fn(),
      };
      (BrowserWindow as jest.Mock).mockReturnValue(mockWindow);

      await expect(netflixService.adaptViewport()).rejects.toThrow('Viewport adaptation failed');
    }, TEST_TIMEOUT);
  });

  describe('initialization popup', () => {
    beforeEach(async () => {
      // Initialize service
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        if (cmd.includes('tasklist')) {
          callback(null, 'netflix.exe');
        } else {
          callback(null, '');
        }
      });
      await netflixService.initialize();
    }, TEST_TIMEOUT);

    it('should show and hide initialization popup', async () => {
      const mockWindow = {
        show: jest.fn(),
        hide: jest.fn(),
        close: jest.fn(),
      };
      (BrowserWindow as jest.Mock).mockReturnValue(mockWindow);

      await netflixService.showInitializationPopup();
      expect(mockWindow.show).toHaveBeenCalled();

      await netflixService.hideInitializationPopup();
      expect(mockWindow.hide).toHaveBeenCalled();
      expect(mockWindow.close).toHaveBeenCalled();
    }, TEST_TIMEOUT);
  });

  describe('error recovery', () => {
    it('should attempt recovery after error', async () => {
      // Mock error in process check
      (exec as jest.Mock).mockImplementation((cmd, callback) => {
        callback(new Error('Process check failed'));
      });

      await netflixService.initialize();
      expect(netflixService.isInitialized()).toBe(false);
    }, TEST_TIMEOUT);
  });
}); 