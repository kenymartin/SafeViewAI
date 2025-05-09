import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VideoPlayerViewport } from '../VideoPlayerViewport';
import { ipcRenderer } from 'electron';

jest.mock('electron', () => ({
  ipcRenderer: {
    send: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

describe('VideoPlayerViewport', () => {
  const defaultProps = {
    dimensions: {
      width: 1920,
      height: 1080,
      x: 0,
      y: 0,
    },
    fullscreen: false,
    onFullscreenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct dimensions', async () => {
    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} />);
    });

    const viewport = screen.getByTestId('video-player-viewport');
    
    expect(viewport).toHaveStyle({
      width: '1920px',
      height: '1080px',
      position: 'absolute',
      top: '0px',
      left: '0px',
    });
  });

  it('handles fullscreen toggle', async () => {
    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} />);
  });

    const viewport = screen.getByTestId('video-player-viewport');

    await act(async () => {
      fireEvent.doubleClick(viewport);
    });

    expect(ipcRenderer.send).toHaveBeenCalledWith('toggle-fullscreen');
    expect(defaultProps.onFullscreenChange).toHaveBeenCalledWith(true);

    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} fullscreen={true} />);
    });

    expect(viewport).toHaveStyle({
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: '0px',
      left: '0px',
    });
  });

  it('updates dimensions when props change', async () => {
    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} />);
    });

    const viewport = screen.getByTestId('video-player-viewport');

    const newDimensions = {
      width: 1280,
      height: 720,
      x: 100,
      y: 100,
    };

    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} dimensions={newDimensions} />);
    });

    expect(viewport).toHaveStyle({
      width: '1280px',
      height: '720px',
      position: 'absolute',
      top: '100px',
      left: '100px',
    });
  });

  it('handles escape key press in fullscreen', async () => {
    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} fullscreen={true} />);
    });
    
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(ipcRenderer.send).toHaveBeenCalledWith('toggle-fullscreen');
    expect(defaultProps.onFullscreenChange).toHaveBeenCalledWith(false);
  });

  it('cleans up event listeners on unmount', async () => {
    await act(async () => {
      render(<VideoPlayerViewport {...defaultProps} />);
    });
    
    const { unmount } = render(<VideoPlayerViewport {...defaultProps} />);

    unmount();

    expect(ipcRenderer.removeListener).toHaveBeenCalled();
  });
}); 