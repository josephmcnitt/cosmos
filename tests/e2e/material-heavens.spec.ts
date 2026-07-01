import { test, expect } from '@playwright/test';
import {
  canvasCenterBrightnessOnce,
  canvasCenterMeanOnce,
  clickTimelineAt,
  clickTimelineLeftEdge,
  clickTimelineRightEdge,
  jumpToPresentIfNeeded,
  MIN_CANVAS_BRIGHTNESS,
  setSpatialExponent,
  skipIntro,
} from './helpers';

test.describe('Material heavens phase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
  });

  test('early cosmic timeline shows darkAges phase', async ({ page }) => {
    await clickTimelineLeftEdge(page);
    await expect(page.getByTestId('heaven-phase')).toHaveAttribute('data-phase', 'darkAges', {
      timeout: 5000,
    });
    await expect(page.getByTestId('bigbang-replay-active')).toHaveAttribute('data-active', 'true');
  });

  test('big bang replay inactive at present', async ({ page }) => {
    await jumpToPresentIfNeeded(page);
    await clickTimelineRightEdge(page);
    await expect(page.getByTestId('bigbang-replay-active')).toHaveAttribute('data-active', 'false');
  });

  test('mid cosmic timeline shows post-dark-ages phase', async ({ page }) => {
    await clickTimelineAt(page, 0.55);
    await page.waitForTimeout(150);

    const phase = await page.getByTestId('heaven-phase').getAttribute('data-phase');
    expect(phase).not.toBe('darkAges');
    expect(phase === 'firstLight' || phase === 'reionized').toBe(true);
  });

  test('dark ages scrub dims canvas but stays above brightness floor', async ({ page }) => {
    await setSpatialExponent(page, 25);
    await clickTimelineLeftEdge(page);
    await expect(page.getByTestId('heaven-phase')).toHaveAttribute('data-phase', 'darkAges', {
      timeout: 5000,
    });
    const darkStarfield = parseFloat(
      (await page.getByTestId('starfield-brightness').getAttribute('data-brightness')) ?? '0',
    );
    const darkPeak = await canvasCenterBrightnessOnce(page, 2000);
    const darkMean = await canvasCenterMeanOnce(page, 400);

    await jumpToPresentIfNeeded(page);
    await clickTimelineRightEdge(page);
    await expect(page.getByTestId('heaven-phase')).toHaveAttribute('data-phase', 'reionized', {
      timeout: 5000,
    });
    const presentStarfield = parseFloat(
      (await page.getByTestId('starfield-brightness').getAttribute('data-brightness')) ?? '0',
    );
    const presentMean = await canvasCenterMeanOnce(page, 2000);

    expect(presentStarfield).toBeGreaterThan(darkStarfield);
    expect(presentMean).toBeGreaterThan(darkMean - 0.5);
    expect(darkPeak).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);
  });

  test('heaven phase indicator hidden in walk mode', async ({ page }) => {
    await page.goto('/?earth=0');
    await skipIntro(page);
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

test.describe('Ephemeris sky', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?earth=0');
    await skipIntro(page);
    await jumpToPresentIfNeeded(page);
  });

  test('active at present Earth scale', async ({ page }) => {
    await setSpatialExponent(page, 12);
    await expect(page.getByTestId('ephemeris-active')).toHaveAttribute('data-active', 'true');
  });

  test('inactive at universe zoom', async ({ page }) => {
    await setSpatialExponent(page, 25);
    await expect(page.getByTestId('ephemeris-active')).toHaveAttribute('data-active', 'false');
  });

  test('indicator hidden in walk mode', async ({ page }) => {
    await page.goto('/?earth=0');
    await skipIntro(page);
    await jumpToPresentIfNeeded(page);
    await page.getByTestId('history-track-spiritual').first().click();
    await page.getByTestId('spatial-slider').fill('4');
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.getByTestId('ephemeris-active')).toHaveCount(0);
  });
});
