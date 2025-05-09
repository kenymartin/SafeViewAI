import { test, expect } from '@playwright/test';

test.describe('VideoPlayer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('loads video player and enters fullscreen', async ({ page }) => {
    // Wait for video player to be visible
    const videoPlayer = await page.waitForSelector('[data-testid="video-viewport"]');
    expect(await videoPlayer.isVisible()).toBeTruthy();

    // Check initial dimensions
    const initialBounds = await videoPlayer.boundingBox();
    expect(initialBounds.width).toBeGreaterThan(0);
    expect(initialBounds.height).toBeGreaterThan(0);

    // Double click to enter fullscreen
    await videoPlayer.dblclick();
    
    // Verify fullscreen state
    await expect(page.locator('[data-testid="video-viewport"]')).toHaveCSS('position', 'fixed');
    await expect(page.locator('[data-testid="video-viewport"]')).toHaveCSS('width', '100%');
    await expect(page.locator('[data-testid="video-viewport"]')).toHaveCSS('height', '100%');
  });

  test('handles video playback controls', async ({ page }) => {
    const videoPlayer = await page.waitForSelector('[data-testid="video-viewport"]');
    
    // Play video
    await page.click('[data-testid="play-button"]');
    await expect(page.locator('[data-testid="video-element"]')).toHaveAttribute('data-playing', 'true');

    // Pause video
    await page.click('[data-testid="pause-button"]');
    await expect(page.locator('[data-testid="video-element"]')).toHaveAttribute('data-playing', 'false');
  });

  test('maintains aspect ratio during window resize', async ({ page }) => {
    const videoPlayer = await page.waitForSelector('[data-testid="video-viewport"]');
    
    // Get initial aspect ratio
    const initialBounds = await videoPlayer.boundingBox();
    const initialAspectRatio = initialBounds.width / initialBounds.height;

    // Resize window
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check if aspect ratio is maintained
    const newBounds = await videoPlayer.boundingBox();
    const newAspectRatio = newBounds.width / newBounds.height;
    
    expect(Math.abs(newAspectRatio - initialAspectRatio)).toBeLessThan(0.01);
  });

  test('handles AI content filtering overlay', async ({ page }) => {
    // Wait for video player and overlay
    const videoPlayer = await page.waitForSelector('[data-testid="video-viewport"]');
    const overlay = await page.waitForSelector('[data-testid="ai-overlay"]');

    // Verify overlay position matches video player
    const playerBounds = await videoPlayer.boundingBox();
    const overlayBounds = await overlay.boundingBox();

    expect(overlayBounds.width).toBe(playerBounds.width);
    expect(overlayBounds.height).toBe(playerBounds.height);
    expect(overlayBounds.x).toBe(playerBounds.x);
    expect(overlayBounds.y).toBe(playerBounds.y);
  });
}); 