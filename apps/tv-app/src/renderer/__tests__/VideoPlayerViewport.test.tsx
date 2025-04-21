import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VideoPlayerPage from '../pages/VideoPlayerPage';
import { VideoPlayerViewport } from '../components/VideoPlayerViewport/VideoPlayerViewport';
import { ipcRenderer } from 'electron';

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

// Mock fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

// Mock electron IPC
jest.mock('electron', () => ({
  ipcRenderer: {
    send: jest.fn(),
  },
}));

describe('VideoPlayerPage Viewport Adjustment', () => {
  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('adjusts to standard 16:9 viewport', () => {
    render(
      <BrowserRouter>
        <VideoPlayerPage />
      </BrowserRouter>
    );
    
    const container = screen.getByTestId('video-container');
    expect(container).toBeInTheDocument();
    
    // Check initial dimensions
    expect(container).toHaveStyle({
      width: '1920px',
      height: '1080px',
    });
  });

  it('adjusts to widescreen viewport', async () => {
    // Set widescreen dimensions
    Object.defineProperty(window, 'innerWidth', { value: 2560, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    
    render(
      <BrowserRouter>
        <VideoPlayerPage />
      </BrowserRouter>
    );
    
    // Trigger resize event
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    
    const container = screen.getByTestId('video-container');
    
    // Should maintain 16:9 aspect ratio
    expect(container).toHaveStyle({
      width: '1920px', // 1080 * 16/9
      height: '1080px',
    });
  });

  it('adjusts to portrait viewport', async () => {
    // Set portrait dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1080, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1920, writable: true });
    
    render(
      <BrowserRouter>
        <VideoPlayerPage />
      </BrowserRouter>
    );
    
    // Trigger resize event
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    
    const container = screen.getByTestId('video-container');
    
    // Should maintain 16:9 aspect ratio
    expect(container).toHaveStyle({
      width: '1080px',
      height: '607.5px', // 1080 * 9/16
    });
  });

  it('handles fullscreen mode correctly', async () => {
    render(
      <BrowserRouter>
        <VideoPlayerPage />
      </BrowserRouter>
    );
    
    const container = screen.getByTestId('video-container');
    const fullscreenButton = screen.getByTestId('fullscreen-button');
    
    // Mock fullscreen API on the container
    const mockRequestFullscreen = jest.fn();
    container.requestFullscreen = mockRequestFullscreen;
    
    // Click fullscreen button
    await act(async () => {
      fireEvent.click(fullscreenButton);
      
      // Simulate entering fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        value: container,
        writable: true,
      });
      
      // Trigger fullscreen change event
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
    
    // Check that the container has the fullscreen class
    expect(container.className).toContain('safe-border');
    expect(window.getComputedStyle(container).position).toBe('absolute');
  });

  it('centers content in viewport', () => {
    render(
      <BrowserRouter>
        <VideoPlayerPage />
      </BrowserRouter>
    );
    
    const container = screen.getByTestId('video-container');
    
    // Check centering
    expect(container).toHaveStyle({
      position: 'absolute',
      left: '0px', // (1920 - 1920) / 2
      top: '0px', // (1080 - 1080) / 2
    });
  });
});

describe('VideoPlayerViewport', () => {
  const mockDimensions = {
    width: 1920,
    height: 1080,
    x: 0,
    y: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.fullscreenElement = null;
  });

  it('renders with correct dimensions', () => {
    const { container } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={jest.fn()}
      />
    );

    expect(container.firstChild).toHaveStyle({
      width: '1920px',
      height: '1080px',
      left: '0px',
      top: '0px',
      position: 'absolute',
    });
  });

  it('handles fullscreen toggle', async () => {
    const onFullscreenChange = jest.fn();
    const { container } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={onFullscreenChange}
      />
    );

    await act(async () => {
      fireEvent.doubleClick(container.firstChild as HTMLElement);
    });

    expect(mockRequestFullscreen).toHaveBeenCalled();
    expect(onFullscreenChange).toHaveBeenCalledWith(true);
    expect(ipcRenderer.send).toHaveBeenCalledWith('enter-fullscreen');
  });

  it('exits fullscreen when Escape is pressed', () => {
    const onFullscreenChange = jest.fn();
    render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={true}
        onFullscreenChange={onFullscreenChange}
      />
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(onFullscreenChange).toHaveBeenCalledWith(false);
    expect(ipcRenderer.send).toHaveBeenCalledWith('exit-fullscreen');
  });

  it('applies fullscreen styles when isFullscreen is true', () => {
    const { container } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={true}
        onFullscreenChange={jest.fn()}
      />
    );

    expect(container.firstChild).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      transform: 'none',
      zIndex: '9999',
    });
    expect(container.firstChild).toHaveClass('safe-border');
  });

  it('updates dimensions when props change', () => {
    const { container, rerender } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={jest.fn()}
      />
    );

    const newDimensions = {
      width: 1280,
      height: 720,
      x: 100,
      y: 100,
    };

    rerender(
      <VideoPlayerViewport
        dimensions={newDimensions}
        isFullscreen={false}
        onFullscreenChange={jest.fn()}
      />
    );

    expect(container.firstChild).toHaveStyle({
      width: '1280px',
      height: '720px',
      left: '100px',
      top: '100px',
      position: 'absolute',
    });
  });
}); 