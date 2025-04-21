import React, { useEffect, useRef, useState } from 'react';

interface TestVideoPlayerProps {
  frameRate?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export const TestVideoPlayer: React.FC<TestVideoPlayerProps> = ({
  frameRate = 30,
  onTimeUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Load all frames
    const loadFrames = async () => {
      const loadedFrames: HTMLImageElement[] = [];
      for (let i = 0; i < 600; i++) {
        const img = new Image();
        img.src = `/__fixtures__/frame_${i.toString().padStart(6, '0')}.jpg`;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });
        loadedFrames.push(img);
      }
      setFrames(loadedFrames);
    };

    loadFrames();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime = 0;
    const frameInterval = 1000 / frameRate;

    const animate = (timestamp: number) => {
      if (!isPlaying) return;

      const deltaTime = timestamp - lastFrameTime;

      if (deltaTime >= frameInterval) {
        // Draw current frame
        ctx.drawImage(frames[currentFrame], 0, 0, canvas.width, canvas.height);
        
        // Update frame counter
        setCurrentFrame((prev) => (prev + 1) % frames.length);
        
        // Call time update callback
        onTimeUpdate?.(currentFrame / frameRate);
        
        lastFrameTime = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, frames, frameRate, currentFrame, onTimeUpdate]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="test-video-player">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ width: '100%', height: 'auto' }}
      />
      <div className="controls">
        <button onClick={togglePlayback}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span>Frame: {currentFrame}</span>
        <span>Time: {(currentFrame / frameRate).toFixed(2)}s</span>
      </div>
      <style jsx>{`
        .test-video-player {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
        }
        .controls {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        button {
          padding: 0.5rem 1rem;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #1976D2;
        }
      `}</style>
    </div>
  );
};

export default TestVideoPlayer; 