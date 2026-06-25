import { test, expect } from '@playwright/test';
import { skipIntro } from './helpers';

async function readSlider(page: import('@playwright/test').Page, testId: string): Promise<number> {
  return parseFloat(await page.getByTestId(testId).inputValue());
}

async function wheelOnCanvas(page: import('@playwright/test').Page, deltaY: number): Promise<void> {
  const canvas = page.locator('.canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, deltaY);
}

test.describe('Scroll and zoom routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
  });

  test('wheel on canvas adjusts spatial zoom after time zoom slider was used', async ({ page }) => {
    const temporal = page.getByTestId('temporal-zoom');
    const spatial = page.getByTestId('spatial-slider');

    await temporal.focus();
    await temporal.fill('8');
    const temporalAfterFill = await readSlider(page, 'temporal-zoom');
    const spatialBefore = await readSlider(page, 'spatial-slider');

    await wheelOnCanvas(page, -120);

    const temporalAfterWheel = await readSlider(page, 'temporal-zoom');
    const spatialAfterWheel = await readSlider(page, 'spatial-slider');

    expect(temporalAfterWheel).toBeCloseTo(temporalAfterFill, 1);
    expect(spatialAfterWheel).not.toBeCloseTo(spatialBefore, 1);
  });

  test('wheel on canvas does not change temporal zoom without shift', async ({ page }) => {
    await page.getByTestId('temporal-zoom').fill('3');
    const temporalBefore = await readSlider(page, 'temporal-zoom');

    await wheelOnCanvas(page, -200);
    await page.waitForTimeout(100);

    const temporalAfter = await readSlider(page, 'temporal-zoom');
    expect(temporalAfter).toBeCloseTo(temporalBefore, 1);
  });

  test('shift+wheel on canvas adjusts temporal zoom', async ({ page }) => {
    const temporalBefore = await readSlider(page, 'temporal-zoom');

    const canvas = page.locator('.canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, -150);
    await page.keyboard.up('Shift');
    await page.waitForTimeout(100);

    const temporalAfter = await readSlider(page, 'temporal-zoom');
    expect(temporalAfter).not.toBeCloseTo(temporalBefore, 1);
  });

  test('wheel on focused temporal slider does not nudge temporal value', async ({ page }) => {
    const temporal = page.getByTestId('temporal-zoom');
    await temporal.focus();
    await temporal.fill('6');
    const temporalAfterFill = await readSlider(page, 'temporal-zoom');

    const box = await temporal.boundingBox();
    if (!box) throw new Error('Temporal slider not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(100);

    const temporalAfterWheel = await readSlider(page, 'temporal-zoom');
    expect(temporalAfterWheel).toBeCloseTo(temporalAfterFill, 1);
  });

  test('wheel on event list does not change spatial zoom', async ({ page }) => {
    const spatialBefore = await readSlider(page, 'spatial-slider');
    const list = page.locator('.event-list-items').first();
    await list.waitFor({ state: 'visible' });

    const box = await list.boundingBox();
    if (!box) throw new Error('Event list not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -120);
    await page.waitForTimeout(100);

    const spatialAfter = await readSlider(page, 'spatial-slider');
    expect(spatialAfter).toBeCloseTo(spatialBefore, 1);
  });

  test('timeline header and HUD time update when time zoom narrows', async ({ page }) => {
    const header = page.getByTestId('timeline-header');
    const hudTime = page.getByTestId('hud-time');
    const wideHeader = await header.textContent();
    const wideHudTime = await hudTime.textContent();

    await page.getByTestId('temporal-zoom').fill(String(12));
    await page.waitForTimeout(100);

    const narrowHeader = await header.textContent();
    const narrowHudTime = await hudTime.textContent();

    expect(narrowHeader).not.toBe(wideHeader);
    expect(narrowHudTime).not.toBe(wideHudTime);
    expect(narrowHeader).not.toContain('13.8 Gya – 13.8 Gya');
  });

  test('wheel over timeline bar does not change spatial zoom', async ({ page }) => {
    const spatialBefore = await readSlider(page, 'spatial-slider');
    const bar = page.locator('.time-controls');
    const box = await bar.boundingBox();
    if (!box) throw new Error('Timeline bar not found');
    await page.mouse.move(box.x + box.width / 2, box.y + 20);
    await page.mouse.wheel(0, -120);
    await page.waitForTimeout(100);

    const spatialAfter = await readSlider(page, 'spatial-slider');
    expect(spatialAfter).toBeCloseTo(spatialBefore, 1);
  });
});
