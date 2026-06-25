import { defineConfig } from '@playwright/test';

const localURL = 'http://127.0.0.1:4173';
const baseURL = process.env.COSMOS_E2E_URL ?? localURL;
const useLocalServer = !process.env.COSMOS_E2E_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--use-gl=angle', '--ignore-gpu-blocklist'],
    },
  },
  webServer: useLocalServer
    ? {
        command: 'npm run preview -- --host 127.0.0.1 --port 4173',
        url: localURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          args: ['--use-gl=angle', '--ignore-gpu-blocklist'],
        },
      },
    },
  ],
});
