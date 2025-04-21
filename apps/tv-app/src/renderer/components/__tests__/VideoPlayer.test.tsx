import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import VideoPlayer from '../VideoPlayer';

// Mock child components
jest.mock('../ContentOverlay', () => {
  return function MockContentOverlay({ isActive }: { isActive: boolean }) {
    return <div data-testid="mock-overlay" data-active={isActive} />;
  };
});

jest.mock('../PrePlayAnalysis', () => {
  return function MockPrePlayAnalysis({ onConfirm, onCancel }: any) {
    return (
      <div data-testid="mock-pre-play">
        <button onClick={() => onConfirm(['violence'])}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

describe('VideoPlayer', () => {
  const mockVideoSource = 'test-video.mp4';
  const mockAnalysisComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows pre-play analysis initially', () => {
    const { getByTestId, queryByTestId } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={mockAnalysisComplete}
      />
    );

    expect(getByTestId('mock-pre-play')).toBeInTheDocument();
    expect(queryByTestId('mock-overlay')).not.toBeInTheDocument();
  });

  it('starts playback when filters are confirmed', () => {
    const { getByText, getByTestId } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={mockAnalysisComplete}
      />
    );

    fireEvent.click(getByText('Confirm'));

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(getByTestId('mock-overlay')).toBeInTheDocument();
  });

  it('starts playback without filters when cancelled', () => {
    const { getByText, getByTestId } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={mockAnalysisComplete}
      />
    );

    fireEvent.click(getByText('Cancel'));

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(getByTestId('mock-overlay')).toBeInTheDocument();
  });

  it('activates overlay when filtered content is playing', async () => {
    const { getByText, getByTestId } = render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={mockAnalysisComplete}
      />
    );

    // Start playback with violence filter
    fireEvent.click(getByText('Confirm'));

    const video = document.querySelector('video') as HTMLVideoElement;
    
    // Simulate video playing at a timestamp with violence
    Object.defineProperty(video, 'currentTime', { value: 120 });
    fireEvent.timeUpdate(video);

    expect(getByTestId('mock-overlay')).toHaveAttribute('data-active', 'true');

    // Simulate video playing at a safe timestamp
    Object.defineProperty(video, 'currentTime', { value: 200 });
    fireEvent.timeUpdate(video);

    expect(getByTestId('mock-overlay')).toHaveAttribute('data-active', 'false');
  });

  it('calls onAnalysisComplete with content warnings', () => {
    render(
      <VideoPlayer
        videoSource={mockVideoSource}
        onAnalysisComplete={mockAnalysisComplete}
      />
    );

    expect(mockAnalysisComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'violence',
          severity: 'moderate',
          count: 3
        }),
        expect.objectContaining({
          type: 'profanity',
          severity: 'mild',
          count: 5
        })
      ])
    );
  });
}); 