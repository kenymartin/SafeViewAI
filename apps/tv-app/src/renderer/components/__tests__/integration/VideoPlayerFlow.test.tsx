import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import VideoPlayer from '../../VideoPlayer';
import { ContentWarning } from '../../PrePlayAnalysis';

// Don't mock the child components for integration testing
jest.unmock('../../ContentOverlay');
jest.unmock('../../PrePlayAnalysis');

describe('VideoPlayer Integration Flow', () => {
  const mockVideoSource = 'test-video.mp4';
  let mockContentWarnings: ContentWarning[];

  beforeEach(() => {
    mockContentWarnings = [
      {
        type: 'violence',
        severity: 'moderate',
        count: 3,
        timestamps: [120, 350, 780]
      },
      {
        type: 'profanity',
        severity: 'mild',
        count: 5,
        timestamps: [45, 160, 280, 420, 600]
      }
    ];

    // Mock video element methods and properties
    window.HTMLMediaElement.prototype.play = jest.fn();
    window.HTMLMediaElement.prototype.pause = jest.fn();
    Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
      writable: true,
      value: 1000
    });
  });

  it('completes full flow from analysis to playback with filters', async () => {
    const onAnalysisComplete = jest.fn();
    
    const { getByText, getByTestId, getByLabelText } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={onAnalysisComplete}
      />
    );

    // 1. Verify pre-play analysis shows up with correct warnings
    expect(getByText('Content Analysis')).toBeInTheDocument();
    expect(getByText('Violence')).toBeInTheDocument();
    expect(getByText('Profanity')).toBeInTheDocument();
    expect(getByText('3 instances')).toBeInTheDocument();
    expect(getByText('5 instances')).toBeInTheDocument();

    // 2. Select filters
    const violenceCheckbox = getByLabelText('Violence');
    const profanityCheckbox = getByLabelText('Profanity');
    
    fireEvent.click(violenceCheckbox);
    fireEvent.click(profanityCheckbox);

    // 3. Confirm filter selection
    fireEvent.click(getByText('Apply Selected Filters'));

    // 4. Verify video player appears
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();

    // 5. Test overlay activation at different timestamps
    act(() => {
      // Set time to violence timestamp
      Object.defineProperty(video!, 'currentTime', { value: 120 });
      fireEvent.timeUpdate(video!);
    });

    // Verify overlay is visible
    const overlay = getByTestId('content-overlay');
    expect(overlay).toHaveStyle({ opacity: '1' });

    act(() => {
      // Move to safe timestamp
      Object.defineProperty(video!, 'currentTime', { value: 200 });
      fireEvent.timeUpdate(video!);
    });

    // Verify overlay is hidden
    expect(overlay).toHaveStyle({ opacity: '0' });

    // 6. Verify analysis callback was called
    expect(onAnalysisComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'violence',
          severity: 'moderate'
        }),
        expect.objectContaining({
          type: 'profanity',
          severity: 'mild'
        })
      ])
    );
  });

  it('handles maximized video player correctly', async () => {
    const { getByText, getByTestId } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={jest.fn()}
      />
    );

    // Skip pre-play analysis
    fireEvent.click(getByText('Continue Without Filters'));

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();

    // Simulate video element going fullscreen
    act(() => {
      Object.defineProperty(video!, 'getBoundingClientRect', {
        value: () => ({
          width: 1920,
          height: 1080,
          top: 0,
          left: 0,
          right: 1920,
          bottom: 1080
        })
      });
      
      // Trigger resize observer
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });

    // Verify overlay adapts to fullscreen size
    const overlay = getByTestId('content-overlay');
    expect(overlay).toHaveStyle({
      width: '1920px',
      height: '1080px'
    });
  });

  it('maintains overlay position during video seeking', async () => {
    const { getByText, getByTestId } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={jest.fn()}
      />
    );

    // Apply filters
    fireEvent.click(getByLabelText('Violence'));
    fireEvent.click(getByText('Apply Selected Filters'));

    const video = document.querySelector('video');
    const overlay = getByTestId('content-overlay');

    // Simulate rapid seeking through video
    for (const time of [100, 120, 150, 200, 350]) {
      act(() => {
        Object.defineProperty(video!, 'currentTime', { value: time });
        fireEvent.timeUpdate(video!);
      });

      // Verify overlay state matches content
      const shouldBeVisible = [120, 350].includes(time);
      expect(overlay).toHaveStyle({
        opacity: shouldBeVisible ? '1' : '0'
      });
    }
  });
}); 