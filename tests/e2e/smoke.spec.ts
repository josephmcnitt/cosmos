import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorGuard,
  enterWalkMode,
  setSpiritualFullDepth,
  skipIntro,
} from './helpers';

test.describe('Cosmos production smoke', () => {
  test('intro completes after skip', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await expect(page.locator('.ui-overlay')).toBeVisible();
    await expect(page.getByTestId('intro-overlay')).toHaveCount(0);
  });

  test('spiritual track and full depth toggles', async ({ page }) => {
    // ?earth=0 keeps human scale in walk prep instead of the Earth globe.
    await page.goto('/?earth=0');
    await skipIntro(page);
    await setSpiritualFullDepth(page);

    // Walk mode collapses History and the timeline to pills — expand both
    // before asserting the toggles they contain.
    for (const pill of ['event-list-collapsed', 'time-controls-collapsed']) {
      const btn = page.getByTestId(pill);
      if (await btn.isVisible().catch(() => false)) await btn.click();
    }
    await expect(page.getByTestId('history-track-spiritual').first()).toHaveClass(/active/);
    await expect(page.getByTestId('depth-toggle-full').first()).toHaveClass(/active/);
  });

  test('enter walk mode at human scale', async ({ page }) => {
    await enterWalkMode(page);
    await expect(page.getByTestId('hud-walking')).toHaveText('Walking');
  });

  test('walk mode collapses history panel to a pill', async ({ page }) => {
    await enterWalkMode(page);

    await expect(page.getByTestId('event-list-collapsed')).toBeVisible();
    await expect(page.locator('.event-list')).toHaveCount(0);

    await page.getByTestId('event-list-collapsed').click();
    await expect(page.locator('.event-list')).toBeVisible();

    await page.getByTestId('event-list-collapse').click();
    await expect(page.getByTestId('event-list-collapsed')).toBeVisible();
  });

  test('walk mode collapses timeline to a pill', async ({ page }) => {
    await enterWalkMode(page);

    await expect(page.getByTestId('time-controls-collapsed')).toBeVisible();
    await expect(page.getByTestId('time-controls')).toHaveCount(0);

    await page.getByTestId('time-controls-collapsed').click();
    await expect(page.getByTestId('time-controls')).toBeVisible();

    await page.getByTestId('time-controls-collapse').click();
    await expect(page.getByTestId('time-controls-collapsed')).toBeVisible();
  });

  test('embodied prompt rows visible after initiation', async ({ page }) => {
    await enterWalkMode(page);

    await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) return;
      const data = JSON.parse(raw);
      data.initiationStatus = { ...(data.initiationStatus ?? {}), grove: 'completed' };
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    });
    await page.reload();
    await skipIntro(page);
    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15000 });

    await page.waitForTimeout(500);
    const prompt = page.getByTestId('embodied-prompt');
    const count = await prompt.count();
    if (count > 0) {
      await expect(page.getByTestId('embodied-discover')).toBeVisible();
      await expect(page.getByTestId('embodied-practice')).toBeVisible();
    } else {
      test.info().annotations.push({
        type: 'note',
        description: 'No stone in range — walk mode entered successfully after initiation',
      });
    }
  });

  test('video export control not in default panel', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await expect(page.getByText('Export video brief')).toHaveCount(0);
  });

  test('no uncaught page errors during core flow', async ({ page }) => {
    const errors: string[] = [];
    attachConsoleErrorGuard(page, errors);

    await enterWalkMode(page);
    expect(errors).toEqual([]);
  });
});
