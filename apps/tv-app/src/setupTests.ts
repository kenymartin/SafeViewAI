import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver;

// Mock matchMedia
global.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
});

// Mock Electron
const mockBrowserWindow = {
  loadURL: jest.fn(),
  executeJavaScript: jest.fn(),
  setFullScreen: jest.fn(),
  isFullScreen: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  webContents: {
    isFullScreen: jest.fn(),
    executeJavaScript: jest.fn(),
  },
  destroy: jest.fn(),
};

jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => mockBrowserWindow),
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
    removeListener: jest.fn(),
  },
  remote: {
    getCurrentWindow: jest.fn().mockReturnValue(mockBrowserWindow),
  },
}));

// Export mock for use in tests
export { mockBrowserWindow }; 