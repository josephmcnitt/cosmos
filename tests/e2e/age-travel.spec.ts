import { test, expect } from '@playwright/test';
import { enterWalkMode, setSpiritualFullDepth, skipIntro } from './helpers';

test.describe('Initiation', () => {
  test('no stone prompt before grove initiation', async ({ page }) => {
    await enterWalkMode(page);
    await expect(page.getByTestId('embodied-initiation-hint')).toBeVisible();
    await expect(page.getByTestId('embodied-discover')).toHaveCount(0);
  });

  test('stones available after initiation completes', async ({ page }) => {
    await enterWalkMode(page);

    await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) throw new Error('Expected save blob');
      const data = JSON.parse(raw);
      data.initiationStatus = {
        ...(data.initiationStatus ?? {}),
        grove: 'completed',
      };
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    });

    await page.reload();
    await skipIntro(page);
    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 20000 });

    await expect(page.getByTestId('embodied-initiation-hint')).toHaveCount(0);
  });
});

test.describe('Age travel', () => {
  test('embodied age label shows Plato Grove', async ({ page }) => {
    await enterWalkMode(page);
    await expect(page.getByTestId('embodied-age-label')).toContainText("Plato's Grove");
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
      data.saveVersion = 3;
      data.discoveredEventIds = [...new Set([...(data.discoveredEventIds ?? []), 'hermetic-corpus'])];
      data.initiationStatus = { ...(data.initiationStatus ?? {}), grove: 'completed' };
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    });

    await page.reload();
    await skipIntro(page);
    await page.waitForFunction(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.discoveredEventIds?.includes('hermetic-corpus');
    });

    await page.getByTestId('journal-toggle').click({ force: true });
    await expect(page.getByTestId('journal-panel')).toContainText('Hermetic Corpus');
  });
});
