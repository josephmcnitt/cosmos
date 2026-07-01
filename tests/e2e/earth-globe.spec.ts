import { test, expect } from '@playwright/test';
import { buildPanelScript } from '../../tools/bug-catcher/panelScript';
import { buildPlaytestLayoutInitScript } from '../../tools/bug-catcher/playtestLayout';
import {
  clickTimelineAt,
  clickTimelineLeftEdge,
  clickCanvasCenter,
  readObserverState,
  setSpatialExponent,
  skipIntro,
  waitForObserverMode,
  zoomCanvasUntilEarthMode,
} from './helpers';

test.describe('Earth globe — feature gate', () => {
  test('enabled by default on /', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    const state = await readObserverState(page);
    expect(state.earthEnabled).toBe(true);
    await expect(page.getByTestId('enter-earth-mode')).toBeVisible();
  });

  test('disabled with ?earth=0 hides entry points', async ({ page }) => {
    await page.goto('/?earth=0');
    await skipIntro(page);
    const state = await readObserverState(page);
    expect(state.earthEnabled).toBe(false);
    await expect(page.getByTestId('enter-earth-mode')).toHaveCount(0);
  });
});

test.describe('Earth globe — HUD entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
  });

  test('Earth → button switches observer mode to earth', async ({ page }) => {
    expect((await readObserverState(page)).mode).toBe('cosmic');
    await page.getByTestId('enter-earth-mode').click();
    await waitForObserverMode(page, 'earth');
    await expect(page.getByTestId('earth-nav-prompt')).toBeVisible();
    await expect(page.getByTestId('hud-spatial-band')).toHaveAttribute('data-band-id', 'earth');
    await expect(page.getByTestId('earth-pin-athens')).toBeVisible();
  });

  test('Cosmos ↑ exits earth mode', async ({ page }) => {
    await page.getByTestId('enter-earth-mode').click();
    await waitForObserverMode(page, 'earth');
    await page.getByTestId('exit-earth-mode').click();
    await waitForObserverMode(page, 'cosmic');
    await expect(page.getByTestId('earth-nav-prompt')).toHaveCount(0);
  });
});

test.describe('Earth globe — zoom entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
  });

  test('spatial slider to planetary band auto-enters earth', async ({ page }) => {
    await setSpatialExponent(page, 14);
    await waitForObserverMode(page, 'earth');
    await expect(page.getByTestId('earth-nav-prompt')).toBeVisible();
  });

  test('mouse wheel zoom in from universe reaches earth mode', async ({ page }) => {
    await setSpatialExponent(page, 25);
    expect((await readObserverState(page)).mode).toBe('cosmic');
    await zoomCanvasUntilEarthMode(page);
    await expect(page.getByTestId('earth-nav-prompt')).toBeVisible();
  });

  test('enter earth from deep time via button shows site pins at present', async ({ page }) => {
    await clickTimelineLeftEdge(page);
    await page.getByTestId('enter-earth-mode').click();
    await waitForObserverMode(page, 'earth');
    await expect(page.getByTestId('earth-pin-athens')).toBeVisible();
  });

  test('wheel zoom to earth from deep time shows site pins at present', async ({ page }) => {
    await clickTimelineLeftEdge(page);
    await setSpatialExponent(page, 25);
    await zoomCanvasUntilEarthMode(page);
    await expect(page.getByTestId('earth-pin-athens')).toBeVisible();
  });
});

test.describe('Earth globe — manual entry (earthSync=0)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?earthSync=0');
    await skipIntro(page);
  });

  test('stellar band shows earth prompt; open button enters globe', async ({ page }) => {
    await setSpatialExponent(page, 18);
    await expect(page.getByTestId('earth-globe-prompt')).toBeVisible();
    await page.getByRole('button', { name: /Open Earth globe/i }).click();
    await waitForObserverMode(page, 'earth');
  });

  test('clicking canvas center at planetary scale opens globe', async ({ page }) => {
    await setSpatialExponent(page, 20);
    await setSpatialExponent(page, 14);
    const before = await readObserverState(page);
    expect(before.mode).toBe('cosmic');
    expect(before.earthEnabled).toBe(true);

    await clickCanvasCenter(page);
    await waitForObserverMode(page, 'earth');
    await expect(page.getByTestId('earth-nav-prompt')).toBeVisible();
  });

  test('planetary slider does not auto-enter when earthSync=0', async ({ page }) => {
    await setSpatialExponent(page, 14);
    const state = await readObserverState(page);
    expect(state.mode).toBe('cosmic');
    await expect(page.getByTestId('earth-globe-prompt')).toBeVisible();
  });
});

test.describe('Earth globe — site selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await page.getByTestId('enter-earth-mode').click();
    await waitForObserverMode(page, 'earth');
  });

  test('HTML site pin opens detail panel', async ({ page }) => {
    await page.getByTestId('earth-pin-athens').click();
    const panel = page.getByTestId('earth-detail-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Plato's Grove");
    await expect(page.getByTestId('earth-descend-btn')).toBeEnabled();
    await expect(page.getByTestId('earth-descend-btn')).toContainText('Descend → walk');
  });

  test('descend from athens pin enters walk mode in Grove', async ({ page }) => {
    await page.getByTestId('earth-pin-athens').click();
    await page.getByTestId('earth-descend-btn').click();
    await waitForObserverMode(page, 'embodied', 8000);
    await expect(page.getByTestId('hud-walking')).toBeVisible();
    await expect(page.getByTestId('embodied-age-label')).toContainText("Plato's Grove");
  });

  test('scrub timeline hides site pins in deep time', async ({ page }) => {
    await clickTimelineAt(page, 0.98);
    await page.waitForTimeout(300);
    await expect(page.getByTestId('earth-pin-athens')).toBeVisible();

    await clickTimelineAt(page, 0.02);
    await page.waitForTimeout(300);
    await expect(page.getByTestId('earth-pin-athens')).toBeHidden();
  });
});

test.describe('Earth globe — playtest layout (bug catcher)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: buildPlaytestLayoutInitScript() });
    await page.addInitScript({ content: buildPanelScript({ mode: 'guidance' }) });
    await page.goto('/');
    await skipIntro(page);
  });

  test('Earth → works with playtest panel mounted', async ({ page }) => {
    await expect(page.locator('#bug-catcher-panel')).toBeVisible();
    await page.getByTestId('enter-earth-mode').click();
    await waitForObserverMode(page, 'earth');
    await expect(page.getByTestId('earth-nav-prompt')).toBeVisible();
  });

  test('wheel zoom reaches earth with playtest layout', async ({ page }) => {
    await expect(page.locator('#bug-catcher-panel')).toBeVisible();
    await setSpatialExponent(page, 25);
    await zoomCanvasUntilEarthMode(page);
    await expect(page.getByTestId('earth-nav-prompt')).toBeVisible();
    await expect(page.getByTestId('earth-pin-athens')).toBeVisible();
  });
});

test.describe('Earth globe — playtest canvas click', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: buildPlaytestLayoutInitScript() });
    await page.addInitScript({ content: buildPanelScript({ mode: 'guidance' }) });
    await page.goto('/?earthSync=0');
    await skipIntro(page);
  });

  test('canvas click at planetary opens globe with playtest panel', async ({ page }) => {
    await expect(page.locator('#bug-catcher-panel')).toBeVisible();
    await setSpatialExponent(page, 14);
    await clickCanvasCenter(page);
    await waitForObserverMode(page, 'earth');
  });
});
