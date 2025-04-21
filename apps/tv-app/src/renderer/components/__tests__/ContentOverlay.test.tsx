import React from 'react';
import { render, act } from '@testing-library/react';
import ContentOverlay from '../ContentOverlay';

describe('ContentOverlay', () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('renders with default border color when active', () => {
    const { getByTestId } = render(<ContentOverlay isActive={true} />);
    const overlay = getByTestId('content-overlay');
    
    expect(overlay).toHaveStyle({
      border: '4px solid #ff0000',
      opacity: '1'
    });
  });

  it('renders with custom border color', () => {
    const { getByTestId } = render(
      <ContentOverlay isActive={true} borderColor="#00ff00" />
    );
    const overlay = getByTestId('content-overlay');
    
    expect(overlay).toHaveStyle({
      border: '4px solid #00ff00'
    });
  });

  it('is hidden when not active', () => {
    const { getByTestId } = render(<ContentOverlay isActive={false} />);
    const overlay = getByTestId('content-overlay');
    
    expect(overlay).toHaveStyle({
      opacity: '0'
    });
  });

  it('updates dimensions when window resizes', () => {
    const { getByTestId } = render(<ContentOverlay isActive={true} />);
    
    act(() => {
      // Simulate window resize
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      global.dispatchEvent(new Event('resize'));
    });

    const overlay = getByTestId('content-overlay');
    expect(overlay).toHaveStyle({
      width: '1920px',
      height: '1080px'
    });
  });

  it('updates dimensions when video element resizes', () => {
    // Create mock video element
    const videoElement = document.createElement('video');
    Object.defineProperty(videoElement, 'getBoundingClientRect', {
      value: () => ({
        width: 1280,
        height: 720,
        top: 0,
        left: 0,
        right: 1280,
        bottom: 720
      })
    });
    document.body.appendChild(videoElement);

    const { getByTestId } = render(<ContentOverlay isActive={true} />);
    const overlay = getByTestId('content-overlay');

    expect(overlay).toHaveStyle({
      width: '1280px',
      height: '720px'
    });

    document.body.removeChild(videoElement);
  });
}); 