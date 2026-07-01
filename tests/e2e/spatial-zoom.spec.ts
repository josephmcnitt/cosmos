import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  canvasMaxBrightness,
  canvasScreenshot,
  buffersDiffer,
  MIN_CANVAS_BRIGHTNESS,
  readSpatialBand,
  setSpatialExponent,
  skipIntro,
  waitForCanvasFrame,
} from './helpers';

const SCREENSHOT_DIR = path.join('tests', 'e2e', 'screenshots', 'spatial-zoom');

async function captureSpatialLevel(
  page: import('@playwright/test').Page,
  exponent: number,
  name: string,
): Promise<{ band: { label: string; id: string }; screenshot: Buffer; brightness: number }> {
  await setSpatialExponent(page, exponent);
  await waitForCanvasFrame(page);
  const band = await readSpatialBand(page);
  const brightness = await canvasMaxBrightness(page);
  const screenshot = await canvasScreenshot(page);
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.png`), screenshot);
  return { band, screenshot, brightness };
}

test.describe('Spatial zoom bands and visuals', () => {
  test('skip intro shows visible cosmos at present era', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);

    await expect(page.getByTestId('heaven-phase')).toHaveAttribute('data-phase', 'reionized');

    const brightness = await canvasMaxBrightness(page);
    expect(brightness).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);
  });

  test('spatial zoom changes band label and canvas appearance', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await waitForCanvasFrame(page);

    const universe = await captureSpatialLevel(page, 25, 'universe');
    expect(universe.band.label).toBe('Universe');
    expect(universe.band.id).toBe('universe');
    expect(universe.brightness).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);

    const galaxy = await captureSpatialLevel(page, 22, 'galaxy');
    expect(galaxy.band.label).toBe('Galaxy');
    expect(galaxy.band.id).toBe('galaxy');
    expect(galaxy.brightness).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);

    const stellar = await captureSpatialLevel(page, 18, 'stellar');
    expect(stellar.band.label).toBe('Stellar');
    expect(stellar.band.id).toBe('stellar');
    expect(stellar.brightness).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);

    const planetary = await captureSpatialLevel(page, 14, 'planetary');
    expect(planetary.band.label).toBe('Earth');
    expect(planetary.band.id).toBe('earth');
    expect(planetary.brightness).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);

    expect(buffersDiffer(universe.screenshot, galaxy.screenshot)).toBe(true);
    expect(buffersDiffer(galaxy.screenshot, stellar.screenshot)).toBe(true);
  });

  test('wheel zoom on canvas changes spatial band', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await setSpatialExponent(page, 25);

    const before = await readSpatialBand(page);
    expect(before.id).toBe('universe');

    const canvas = page.locator('.canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(200);

    const after = await readSpatialBand(page);
    expect(after.id).not.toBe(before.id);

    const brightness = await canvasMaxBrightness(page);
    expect(brightness).toBeGreaterThan(MIN_CANVAS_BRIGHTNESS);
  });
});
