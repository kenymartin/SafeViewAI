import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { VideoPlayerViewport } from '../VideoPlayerViewport';
import { ipcRenderer } from 'electron';

jest.mock('electron', () => ({
  ipcRenderer: {
    send: jest.fn(),
  },
}));

describe('VideoPlayerViewport', () => {
  const mockDimensions = {
    width: 1280,
    height: 720,
    x: 100,
    y: 50,
  };

  const mockOnFullscreenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock requestFullscreen
    Element.prototype.requestFullscreen = jest.fn().mockResolvedValue(undefined);
    // Mock document.exitFullscreen
    document.exitFullscreen = jest.fn().mockResolvedValue(undefined);
    // Mock document.fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null,
    });
  });

  it('should render with correct viewport styles when not fullscreen', () => {
    const { getByTestId } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    const viewport = getByTestId('video-player-viewport');
    expect(viewport).toHaveStyle({
      position: 'absolute',
      width: '1280px',
      height: '720px',
      left: '100px',
      top: '50px',
      transform: 'none',
    });
    expect(viewport).not.toHaveClass('safe-border');
  });

  it('should render with correct viewport styles when fullscreen', () => {
    const { getByTestId } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={true}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    const viewport = getByTestId('video-player-viewport');
    expect(viewport).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      transform: 'none',
      zIndex: 9999,
    });
    expect(viewport).toHaveClass('safe-border');
  });

  it('should handle entering fullscreen on double click', async () => {
    const { getByTestId } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    const viewport = getByTestId('video-player-viewport');
    await act(async () => {
      fireEvent.doubleClick(viewport);
    });

    expect(viewport.requestFullscreen).toHaveBeenCalled();
    expect(mockOnFullscreenChange).toHaveBeenCalledWith(true);
    expect(ipcRenderer.send).toHaveBeenCalledWith('enter-fullscreen');
  });

  it('should handle exiting fullscreen on double click', async () => {
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: true,
    });

    const { getByTestId } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={true}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    const viewport = getByTestId('video-player-viewport');
    await act(async () => {
      fireEvent.doubleClick(viewport);
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(mockOnFullscreenChange).toHaveBeenCalledWith(false);
    expect(ipcRenderer.send).toHaveBeenCalledWith('exit-fullscreen');
  });

  it('should handle Escape key to exit fullscreen', () => {
    render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={true}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnFullscreenChange).toHaveBeenCalledWith(false);
    expect(ipcRenderer.send).toHaveBeenCalledWith('exit-fullscreen');
  });

  it('should not handle Escape key when not in fullscreen', () => {
    render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnFullscreenChange).not.toHaveBeenCalled();
    expect(ipcRenderer.send).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const { unmount } = render(
      <VideoPlayerViewport
        dimensions={mockDimensions}
        isFullscreen={false}
        onFullscreenChange={mockOnFullscreenChange}
      />
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
}); 