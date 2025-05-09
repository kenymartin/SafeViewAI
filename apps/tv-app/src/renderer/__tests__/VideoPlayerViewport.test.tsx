import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { VideoPlayerViewport } from '../components/VideoPlayerViewport/VideoPlayerViewport';
import { mockBrowserWindow } from '../../setupTests';

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
global.ResizeObserver = mockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock electron IPC
jest.mock('electron', () => ({
  ipcRenderer: {
    send: jest.fn(),
  },
}));

describe('VideoPlayerViewport', () => {
  const defaultProps = {
    dimensions: { width: 1280, height: 720, x: 0, y: 0 },
    isFullscreen: false,
    onFullscreenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct dimensions', () => {
    render(<VideoPlayerViewport {...defaultProps} />);
    const viewport = screen.getByTestId('video-viewport');
    
    expect(viewport).toHaveStyle({
      width: '1280px',
      height: '720px',
      position: 'relative',
    });
  });

  it('handles fullscreen toggle via double click', async () => {
    const onFullscreenChange = jest.fn();
    render(
      <VideoPlayerViewport
        {...defaultProps}
        onFullscreenChange={onFullscreenChange}
      />
    );
    
    const viewport = screen.getByTestId('video-viewport');
    await act(async () => {
      fireEvent.doubleClick(viewport);
    });

    expect(onFullscreenChange).toHaveBeenCalledWith(true);
  });

  it('updates styles when dimensions change', () => {
    const { rerender } = render(<VideoPlayerViewport {...defaultProps} />);
    
    const newDimensions = { width: 1920, height: 1080, x: 0, y: 0 };
    rerender(
      <VideoPlayerViewport
        {...defaultProps}
        dimensions={newDimensions}
      />
    );

    const viewport = screen.getByTestId('video-viewport');
    expect(viewport).toHaveStyle({
      width: '1920px',
      height: '1080px',
    });
  });

  it('applies fullscreen styles correctly', () => {
    render(
      <VideoPlayerViewport
        {...defaultProps}
        isFullscreen={true}
      />
    );

    const viewport = screen.getByTestId('video-viewport');
    expect(viewport).toHaveStyle({
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      zIndex: '9999',
    });
  });

  it('handles escape key to exit fullscreen', async () => {
    const onFullscreenChange = jest.fn();
    render(
      <VideoPlayerViewport
        {...defaultProps}
        isFullscreen={true}
        onFullscreenChange={onFullscreenChange}
      />
    );

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(onFullscreenChange).toHaveBeenCalledWith(false);
  });

  it('cleans up event listeners on unmount', async () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <VideoPlayerViewport
        {...defaultProps}
      />
    );

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
    });
  });
}); 