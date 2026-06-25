import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  buffersDiffer,
  canvasScreenshot,
  readSpatialBand,
  screenshotHasVisibleContent,
  setSpatialExponent,
  skipIntro,
} from './helpers';

const SCREENSHOT_DIR = path.join('tests', 'e2e', 'screenshots', 'spatial-zoom');

async function captureSpatialLevel(
  page: import('@playwright/test').Page,
  exponent: number,
  name: string,
): Promise<{ band: { label: string; id: string }; screenshot: Buffer }> {
  await setSpatialExponent(page, exponent);
  const band = await readSpatialBand(page);
  const screenshot = await canvasScreenshot(page);
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.png`), screenshot);
  return { band, screenshot };
}

test.describe('Spatial zoom bands and visuals', () => {
  test('skip intro shows visible cosmos at present era', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await page.waitForTimeout(600);

    await expect(page.getByTestId('heaven-phase')).toHaveAttribute('data-phase', 'reionized');

    const shot = await canvasScreenshot(page);
    expect(screenshotHasVisibleContent(shot)).toBe(true);
  });

  test('spatial zoom changes band label and canvas appearance', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await page.waitForTimeout(400);

    const universe = await captureSpatialLevel(page, 25, 'universe');
    expect(universe.band.label).toBe('Universe');
    expect(universe.band.id).toBe('universe');

    const galaxy = await captureSpatialLevel(page, 22, 'galaxy');
    expect(galaxy.band.label).toBe('Galaxy');
    expect(galaxy.band.id).toBe('galaxy');
    expect(buffersDiffer(universe.screenshot, galaxy.screenshot)).toBe(true);

    const stellar = await captureSpatialLevel(page, 18, 'stellar');
    expect(stellar.band.label).toBe('Stellar');
    expect(stellar.band.id).toBe('stellar');
    expect(buffersDiffer(galaxy.screenshot, stellar.screenshot)).toBe(true);

    const planetary = await captureSpatialLevel(page, 14, 'planetary');
    expect(planetary.band.label).toBe('Planetary');
    expect(planetary.band.id).toBe('planetary');
    expect(buffersDiffer(stellar.screenshot, planetary.screenshot)).toBe(true);
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
  });
});
