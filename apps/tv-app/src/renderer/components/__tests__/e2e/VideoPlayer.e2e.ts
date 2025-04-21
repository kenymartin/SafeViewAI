import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('VideoPlayer E2E Tests', () => {
  const TEST_VIDEO_PATH = path.join(__dirname, '../../../__fixtures__/test-video.mp4');

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
  });

  test('loads and plays video with content filtering', async ({ page }) => {
    // Upload test video
    await page.setInputFiles('input[type="file"]', TEST_VIDEO_PATH);
    
    // Wait for content analysis
    await expect(page.getByText('Content Analysis')).toBeVisible();
    
    // Verify warning categories are shown
    await expect(page.getByText('Violence')).toBeVisible();
    await expect(page.getByText('Profanity')).toBeVisible();

    // Select filters
    await page.getByLabel('Violence').check();
    await page.getByLabel('Profanity').check();

    // Apply filters
    await page.getByText('Apply Selected Filters').click();

    // Verify video player is visible
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Wait for video to be ready
    await video.evaluate(v => v.readyState >= 2);

    // Test fullscreen behavior
    await video.evaluate(v => v.requestFullscreen());
    
    // Verify overlay adapts to fullscreen
    const overlay = page.getByTestId('content-overlay');
    await expect(overlay).toHaveCSS('width', '1920px');
    await expect(overlay).toHaveCSS('height', '1080px');

    // Test seeking and overlay visibility
    await video.evaluate(v => v.currentTime = 120); // Known violence timestamp
    await expect(overlay).toHaveCSS('opacity', '1');

    await video.evaluate(v => v.currentTime = 200); // Safe timestamp
    await expect(overlay).toHaveCSS('opacity', '0');
  });

  test('measures overlay adaptation performance', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', TEST_VIDEO_PATH);
    await page.getByText('Continue Without Filters').click();

    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Create performance observer
    await page.evaluate(() => {
      window.performanceEntries = [];
      const observer = new PerformanceObserver((list) => {
        window.performanceEntries.push(...list.getEntries());
      });
      observer.observe({ entryTypes: ['measure'] });
    });

    // Test rapid size changes
    for (const size of [
      { width: 640, height: 360 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
      { width: 3840, height: 2160 }
    ]) {
      await video.evaluate((v, size) => {
        performance.mark('resize-start');
        Object.defineProperty(v, 'getBoundingClientRect', {
          value: () => ({
            width: size.width,
            height: size.height,
            top: 0,
            left: 0,
            right: size.width,
            bottom: size.height
          })
        });
        const event = new Event('resize');
        window.dispatchEvent(event);
        performance.mark('resize-end');
        performance.measure('resize', 'resize-start', 'resize-end');
      }, size);

      // Wait for overlay to update
      const overlay = page.getByTestId('content-overlay');
      await expect(overlay).toHaveCSS('width', `${size.width}px`);
      await expect(overlay).toHaveCSS('height', `${size.height}px`);
    }

    // Get performance measurements
    const measurements = await page.evaluate(() => window.performanceEntries);
    
    // Verify performance
    for (const measure of measurements) {
      expect(measure.duration).toBeLessThan(16); // Target: 60fps (16.67ms)
    }
  });

  test('handles streaming service integration', async ({ page, context }) => {
    // Mock a streaming service page
    await context.route('**/*', route => {
      if (route.request().resourceType() === 'document') {
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `
            <!DOCTYPE html>
            <html>
              <body>
                <div id="streaming-player">
                  <video src="${TEST_VIDEO_PATH}" style="width: 100%; height: 100%"></video>
                </div>
              </body>
            </html>
          `
        });
      } else {
        route.continue();
      }
    });

    await page.goto('http://localhost:3000');
    
    // Wait for SafeView overlay to detect and attach to video
    const overlay = page.getByTestId('content-overlay');
    await expect(overlay).toBeVisible();

    // Test maximizing player
    await page.evaluate(() => {
      const player = document.getElementById('streaming-player');
      Object.assign(player!.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '9999'
      });
    });

    // Verify overlay adapts to maximized player
    await expect(overlay).toHaveCSS('position', 'fixed');
    await expect(overlay).toHaveCSS('width', '100vw');
    await expect(overlay).toHaveCSS('height', '100vh');
  });
}); 