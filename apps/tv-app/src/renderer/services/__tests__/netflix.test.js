const { BrowserWindow } = require('electron');
const NetflixService = require('../netflix');

jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    webContents: {
      executeJavaScript: jest.fn().mockResolvedValue(true),
      on: jest.fn(),
      removeAllListeners: jest.fn(),
    },
    on: jest.fn(),
    isFullScreen: jest.fn().mockReturnValue(false),
    setFullScreen: jest.fn(),
    destroy: jest.fn(),
  })),
}));

describe('NetflixService', () => {
  let netflixService;
  let mockWindow;

  beforeEach(() => {
    mockWindow = new BrowserWindow();
    netflixService = new NetflixService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create a new window and load Netflix', async () => {
      await netflixService.initialize();
      expect(BrowserWindow).toHaveBeenCalled();
      expect(mockWindow.loadURL).toHaveBeenCalledWith('https://www.netflix.com');
    });

    it('should set up event listeners', async () => {
      await netflixService.initialize();
      expect(mockWindow.webContents.on).toHaveBeenCalled();
      expect(mockWindow.on).toHaveBeenCalled();
    });
  });

  describe('toggleFullscreen', () => {
    it('should toggle fullscreen state', async () => {
      await netflixService.initialize();
      await netflixService.toggleFullscreen();
      expect(mockWindow.setFullScreen).toHaveBeenCalledWith(true);
      expect(mockWindow.isFullScreen).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should destroy the window and remove listeners', async () => {
      await netflixService.initialize();
      netflixService.cleanup();
      expect(mockWindow.webContents.removeAllListeners).toHaveBeenCalled();
      expect(mockWindow.destroy).toHaveBeenCalled();
    });
  });
}); 