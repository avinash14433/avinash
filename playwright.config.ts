import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // proves every test runs on its own and in any order
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // retries only in CI; flaky passes are flagged in the report
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test', // Sauce Demo exposes stable data-test attributes
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
