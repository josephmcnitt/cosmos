import { test, expect } from '@playwright/test';
import { clickTimelineAt, readTimelineState, readTemporalZoom, skipIntro } from './helpers';

test.describe('Time zoom and timeline scrubbing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
  });

  test('narrows visible range when time zoom increases', async ({ page }) => {
    const wide = await readTimelineState(page);

    await page.getByTestId('temporal-zoom').fill(String(12));
    await page.waitForTimeout(150);
    const narrow = await readTimelineState(page);

    expect(narrow.max - narrow.min).toBeLessThan(wide.max - wide.min);
    expect(narrow.playhead).toBeGreaterThanOrEqual(narrow.min);
    expect(narrow.playhead).toBeLessThanOrEqual(narrow.max);
  });

  test('scrubbing earlier/later changes playhead but not window edges when zoomed', async ({ page }) => {
    await page.getByTestId('temporal-zoom').fill(String(14));
    await page.waitForTimeout(150);
    await clickTimelineAt(page, 0.55);
    await page.waitForTimeout(100);

    const before = await readTimelineState(page);
    await clickTimelineAt(page, 0.12);
    await page.waitForTimeout(100);
    const low = await readTimelineState(page);

    expect(low.min).toBeCloseTo(before.min, -4);
    expect(low.max).toBeCloseTo(before.max, -4);
    expect(low.playhead).toBeLessThan(before.playhead);

    await clickTimelineAt(page, 0.88);
    await page.waitForTimeout(100);
    const high = await readTimelineState(page);

    expect(high.min).toBeCloseTo(before.min, -4);
    expect(high.max).toBeCloseTo(before.max, -4);
    expect(high.playhead).toBeGreaterThan(before.playhead);
    expect(high.playhead).toBeGreaterThan(low.playhead);
  });

  test('zooming in at right side narrows span and keeps playhead near right edge', async ({ page }) => {
    await page.getByTestId('temporal-zoom').fill(String(10));
    await page.waitForTimeout(100);
    await clickTimelineAt(page, 0.92);
    await page.waitForTimeout(100);

    const mid = await readTimelineState(page);
    await page.getByTestId('temporal-zoom').fill(String(16));
    await page.waitForTimeout(150);
    const tight = await readTimelineState(page);

    expect(tight.max - tight.min).toBeLessThan(mid.max - mid.min);
    expect(tight.normalized).toBeGreaterThan(0.85);
  });

  test('zooming in at left side narrows span and preserves playhead fraction', async ({ page }) => {
    await page.getByTestId('temporal-zoom').fill(String(10));
    await page.waitForTimeout(100);
    await clickTimelineAt(page, 0.08);
    await page.waitForTimeout(100);

    const mid = await readTimelineState(page);
    await page.getByTestId('temporal-zoom').fill(String(16));
    await page.waitForTimeout(150);
    const tight = await readTimelineState(page);

    expect(tight.max - tight.min).toBeLessThan(mid.max - mid.min);
    expect(tight.normalized).toBeCloseTo(mid.normalized, 1);
  });

  test('HUD and rail playhead label update when scrubbing wide cosmic timeline', async ({ page }) => {
    await clickTimelineAt(page, 0.05);
    await page.waitForTimeout(100);
    const hudEarly = await page.getByTestId('hud-time').textContent();
    const railEarly = await page.getByTestId('timeline-playhead-label').textContent();

    await clickTimelineAt(page, 0.72);
    await page.waitForTimeout(100);
    const hudLater = await page.getByTestId('hud-time').textContent();
    const railLater = await page.getByTestId('timeline-playhead-label').textContent();

    expect(hudLater).not.toBe(hudEarly);
    expect(railLater).not.toBe(railEarly);
    expect(hudLater).toBe(railLater);
  });

  test('canvas scroll does not change timeline bounds when zoomed', async ({ page }) => {
    await page.getByTestId('temporal-zoom').fill(String(13));
    await page.waitForTimeout(150);
    const before = await readTimelineState(page);
    const temporalBefore = await readTemporalZoom(page);

    const canvas = page.locator('.canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(150);

    const after = await readTimelineState(page);
    const temporalAfter = await readTemporalZoom(page);

    expect(after.min).toBeCloseTo(before.min, -4);
    expect(after.max).toBeCloseTo(before.max, -4);
    expect(after.playhead).toBeCloseTo(before.playhead, -4);
    expect(temporalAfter).toBeCloseTo(temporalBefore, 1);
  });
});
