import { test, expect } from '@playwright/test';
import { waitForVideoPlayerLoad, toggleFullscreen, getAspectRatio, clickPlayButton } from './test-utils';

test.describe('Video Player E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load video player and display content', async ({ page }) => {
    const viewport = await waitForVideoPlayerLoad(page);
    await expect(viewport).toBeVisible();
    
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });

  test('should toggle fullscreen on double click', async ({ page }) => {
    await toggleFullscreen(page);
    
    // Exit fullscreen
    await page.keyboard.press('Escape');
    const viewport = page.locator('[data-testid="video-player-viewport"]');
    await expect(viewport).not.toHaveCSS('position', 'fixed');
  });

  test('should maintain aspect ratio on window resize', async ({ page }) => {
    const initialRatio = await getAspectRatio(page);
    expect(initialRatio).toBeCloseTo(16/9, 1);

    // Resize window
    await page.setViewportSize({ width: 1280, height: 720 });
    const newRatio = await getAspectRatio(page);
    expect(newRatio).toBeCloseTo(initialRatio!, 1);
  });

  test('should play video and show controls', async ({ page }) => {
    await clickPlayButton(page);
    
    // Check if controls are visible
    const controls = page.locator('[data-testid="video-controls"]');
    await expect(controls).toBeVisible();
    
    // Verify progress bar updates
    const progressBar = page.locator('[data-testid="progress-bar"]');
    const initialValue = await progressBar.getAttribute('value');
    await page.waitForTimeout(2000);
    const newValue = await progressBar.getAttribute('value');
    expect(Number(newValue)).toBeGreaterThan(Number(initialValue));
  });

  test('should apply AI content filtering', async ({ page }) => {
    await clickPlayButton(page);
    
    // Wait for AI processing indicator
    const aiIndicator = page.locator('[data-testid="ai-processing-indicator"]');
    await expect(aiIndicator).toBeVisible();
    
    // Verify filtered content overlay
    const filteredOverlay = page.locator('[data-testid="filtered-content-overlay"]');
    await expect(filteredOverlay).toBeVisible();
    
    // Check if filtering stats are updated
    const filterStats = page.locator('[data-testid="filter-stats"]');
    await expect(filterStats).toContainText('Filtered frames:');
  });
}); 