const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a canvas
const canvas = createCanvas(1280, 720);
const ctx = canvas.getContext('2d');

// Create frames for a test pattern
function createFrame(frameNumber) {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 1280, 720);

    // Draw some test content
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText(`Frame ${frameNumber}`, 540, 360);

    // Add some "inappropriate" content markers for testing
    if (frameNumber >= 120 && frameNumber < 150) {
        ctx.fillStyle = 'red';
        ctx.fillText('Violence Scene', 520, 420);
    }

    if (frameNumber >= 280 && frameNumber < 310) {
        ctx.fillStyle = 'orange';
        ctx.fillText('Profanity Scene', 520, 420);
    }

    return canvas.toBuffer('image/jpeg');
}

// Create directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'src', 'renderer', '__fixtures__');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Save frames
const numFrames = 600; // 20 seconds at 30fps
console.log('Generating test video frames...');

for (let i = 0; i < numFrames; i++) {
    const frame = createFrame(i);
    fs.writeFileSync(path.join(outputDir, `frame_${i.toString().padStart(6, '0')}.jpg`), frame);
    if (i % 30 === 0) {
        console.log(`Progress: ${Math.round((i / numFrames) * 100)}%`);
    }
}

console.log('Frames generated successfully.');
console.log('Now use FFmpeg to combine frames into a video, or use the HTML5 video player with individual frames.'); 