import { Page, expect } from '@playwright/test';

export async function waitForVideoPlayerLoad(page: Page) {
  const viewport = page.locator('[data-testid="video-player-viewport"]');
  await expect(viewport).toBeVisible({ timeout: 10000 });
  return viewport;
}

export async function toggleFullscreen(page: Page) {
  const viewport = await waitForVideoPlayerLoad(page);
  await viewport.dblclick();
  
  // Wait for fullscreen transition
  await page.waitForTimeout(500);
  
  // Verify fullscreen styles
  await expect(viewport).toHaveCSS('position', 'fixed');
  await expect(viewport).toHaveCSS('top', '0px');
  await expect(viewport).toHaveCSS('left', '0px');
  await expect(viewport).toHaveCSS('width', '100vw');
  await expect(viewport).toHaveCSS('height', '100vh');
}

export async function getAspectRatio(page: Page) {
  const viewport = await waitForVideoPlayerLoad(page);
  const box = await viewport.boundingBox();
  return box ? box.width / box.height : null;
}

export async function clickPlayButton(page: Page) {
  const playButton = page.locator('[data-testid="play-button"]');
  await playButton.click();
  
  // Wait for video to start playing
  await page.waitForTimeout(1000);
  
  const video = page.locator('video');
  const currentTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
  expect(currentTime).toBeGreaterThan(0);
} 