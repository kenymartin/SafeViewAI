import { PlaywrightTestConfig } from '@playwright/test';
import baseConfig from './playwright.config';

const config: PlaywrightTestConfig = {
  ...baseConfig,
  testDir: './src/renderer/components/__tests__/performance',
  workers: 1, // Run performance tests serially
  retries: 0, // Don't retry performance tests
  reporter: [
    ['list'],
    ['json', { outputFile: 'performance-results/results.json' }],
    ['html', { open: 'never' }]
  ],
  projects: [
    {
      name: 'chromium-perf',
      use: {
        ...baseConfig.projects![0].use,
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox'
          ]
        }
      }
    }
  ],
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100
    }
  }
};

export default config; 