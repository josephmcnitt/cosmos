import { test, expect } from '@playwright/test';
import { enterWalkMode, skipIntro } from './helpers';

test.describe('Age travel', () => {
  test('embodied age label shows Grove', async ({ page }) => {
    await enterWalkMode(page);
    await expect(page.getByTestId('embodied-age-label')).toContainText('Grove');
  });

  test('journal toggle opens panel', async ({ page }) => {
    await enterWalkMode(page);
    await page.getByTestId('journal-toggle').click({ force: true });
    await expect(page.getByTestId('journal-panel')).toBeVisible();
  });
});

test.describe('Persistence', () => {
  test('discovered stone persists after reload', async ({ page }) => {
    await enterWalkMode(page);

    await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) throw new Error('Expected save blob after walk mode');
      const data = JSON.parse(raw);
      data.discoveredEventIds = [...new Set([...(data.discoveredEventIds ?? []), 'hermetic-corpus'])];
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    });

    await page.reload();
    await skipIntro(page);
    await page.waitForTimeout(1000);

    await page.getByTestId('journal-toggle').click({ force: true });
    await expect(page.getByTestId('journal-panel')).toContainText('hermetic-corpus');
  });
});
