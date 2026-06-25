import { test, expect } from '@playwright/test';
import { clickTimelineAt, clickTimelineLeftEdge, skipIntro } from './helpers';

test.describe('Material heavens phase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
  });

  test('early cosmic timeline shows darkAges phase', async ({ page }) => {
    await clickTimelineLeftEdge(page);
    await page.waitForTimeout(150);

    const indicator = page.getByTestId('heaven-phase');
    await expect(indicator).toHaveAttribute('data-phase', 'darkAges');
  });

  test('mid cosmic timeline shows post-dark-ages phase', async ({ page }) => {
    await clickTimelineAt(page, 0.55);
    await page.waitForTimeout(150);

    const phase = await page.getByTestId('heaven-phase').getAttribute('data-phase');
    expect(phase).not.toBe('darkAges');
    expect(phase === 'firstLight' || phase === 'reionized').toBe(true);
  });

  test('heaven phase indicator hidden in walk mode', async ({ page }) => {
    await page.getByTestId('history-track-spiritual').first().click();
    await page.getByTestId('spatial-slider').fill('4');
    const jumpBtn = page.getByTestId('jump-to-present');
    if (await jumpBtn.isVisible().catch(() => false)) {
      await jumpBtn.click();
    }
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });

    await expect(page.getByTestId('heaven-phase')).toHaveCount(0);
  });
});
