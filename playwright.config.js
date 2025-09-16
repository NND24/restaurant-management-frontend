// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // or your test folder name
  timeout: 120 * 1000, // per test
  expect: {
    timeout: 5000
  },
  retries: 0, // set to 1 or 2 if you want auto-retry failed tests
  use: {
    headless: true, // set false for debugging
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    baseURL: 'http://localhost:3000', // update to match your local dev server
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  reporter: [['list'], ['html']],
  // You can add more projects below if you want to test in multiple browsers:
  /* 
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  */
});
