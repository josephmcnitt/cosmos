import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';

export interface TimelineState {
  min: number;
  max: number;
  playhead: number;
  normalized: number;
}

export async function skipIntro(page: Page): Promise<void> {
  const overlay = page.getByTestId('intro-overlay');
  await overlay.waitFor({ state: 'visible', timeout: 15_000 });
  // Keyboard skip avoids click-through into the HUD once the overlay unmounts.
  await page.keyboard.press('Space');
  await overlay.waitFor({ state: 'hidden', timeout: 10_000 });
  await page.getByTestId('heaven-phase').waitFor({ state: 'attached', timeout: 10_000 });
  await waitForCanvasFrame(page, 12);
  await page.waitForTimeout(5000);
}

export async function setHumanSpatialScale(page: Page): Promise<void> {
  const slider = page.getByTestId('spatial-slider');
  await slider.waitFor({ state: 'visible' });
  await slider.fill('4');
}

export async function jumpToPresentIfNeeded(page: Page): Promise<void> {
  const jumpBtn = page.getByTestId('jump-to-present');
  if (await jumpBtn.isVisible().catch(() => false)) {
    await jumpBtn.click();
  }
  const spiritualJump = page.getByTestId('spiritual-jump-to-present');
  if (await spiritualJump.isVisible().catch(() => false)) {
    await spiritualJump.click();
  }
}

export async function enableFullDepth(page: Page): Promise<void> {
  const depthFull = page.getByTestId('depth-toggle-full');
  if (await depthFull.first().isVisible().catch(() => false)) {
    await depthFull.first().click();
    return;
  }
  const reveal = page.getByRole('button', { name: /Reveal.*esoteric/i });
  if (await reveal.first().isVisible().catch(() => false)) {
    await reveal.first().click();
  }
}

export async function setSpiritualFullDepth(page: Page): Promise<void> {
  await page.getByTestId('history-track-spiritual').first().click();
  await setHumanSpatialScale(page);
  await jumpToPresentIfNeeded(page);
  await enableFullDepth(page);
}

export async function enterWalkMode(page: Page): Promise<void> {
  await page.goto('/');
  await skipIntro(page);
  await setSpiritualFullDepth(page);
  await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });
}

export function attachConsoleErrorGuard(page: Page, errors: string[]): void {
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
}

export async function readTimelineState(page: Page): Promise<TimelineState> {
  const min = parseFloat((await page.getByTestId('timeline-min').getAttribute('data-seconds')) ?? 'NaN');
  const max = parseFloat((await page.getByTestId('timeline-max').getAttribute('data-seconds')) ?? 'NaN');
  const playhead = parseFloat(
    (await page.getByTestId('timeline-playhead').getAttribute('data-seconds')) ?? 'NaN',
  );
  const normalized = parseFloat(
    (await page.getByTestId('timeline-playhead').getAttribute('data-normalized')) ?? 'NaN',
  );
  return { min, max, playhead, normalized };
}

export async function readTemporalZoom(page: Page): Promise<number> {
  return parseFloat(await page.getByTestId('temporal-zoom').inputValue());
}

export async function clickTimelineAt(page: Page, fraction: number): Promise<void> {
  const track = page.getByTestId('scrubber-track');
  await track.waitFor({ state: 'visible' });
  const box = await track.boundingBox();
  if (!box) throw new Error('Scrubber track not found');
  const frac = Math.max(0, Math.min(0.98, fraction));
  const x = frac <= 0 ? box.x : box.x + box.width * frac;
  const y = box.y + box.height / 2;
  await page.mouse.click(x, y);
}

/** Rightmost scrub — present end of the log timeline. */
export async function clickTimelineRightEdge(page: Page): Promise<void> {
  const track = page.getByTestId('scrubber-track');
  await track.waitFor({ state: 'visible' });
  const box = await track.boundingBox();
  if (!box) throw new Error('Scrubber track not found');
  await page.mouse.click(box.x + box.width - 0.5, box.y + box.height / 2);
}

/** Leftmost scrub — must hit rect.left (t=0); log timeline jumps era within ~0.001 width. */
export async function clickTimelineLeftEdge(page: Page): Promise<void> {
  const track = page.getByTestId('scrubber-track');
  await track.waitFor({ state: 'visible' });
  const box = await track.boundingBox();
  if (!box) throw new Error('Scrubber track not found');
  await page.mouse.click(box.x, box.y + box.height / 2);
}

/** Leftmost pixel — needed for pre-stellar eras on the years-ago log timeline. */
export async function readSpatialBand(page: Page): Promise<{ label: string; id: string }> {
  const el = page.getByTestId('hud-spatial-band');
  await el.waitFor({ state: 'visible' });
  const label = (await el.textContent()) ?? '';
  const id = (await el.getAttribute('data-band-id')) ?? '';
  return { label: label.trim(), id };
}

export async function setSpatialExponent(page: Page, exponent: number): Promise<void> {
  const slider = page.getByTestId('spatial-slider');
  await slider.waitFor({ state: 'visible' });
  await slider.fill(String(exponent));
  await page.waitForTimeout(400);
}

export async function waitForCanvasFrame(page: Page, frames = 4): Promise<void> {
  await page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        let remaining = count;
        const step = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    frames,
  );
}

function peakCenterFromPng(png: PNG): number {
  const x0 = Math.floor(png.width * 0.35);
  const y0 = Math.floor(png.height * 0.18);
  const rw = Math.floor(png.width * 0.3);
  const rh = Math.floor(png.height * 0.42);
  let peak = 0;
  for (let y = y0; y < y0 + rh; y += 2) {
    for (let x = x0; x < x0 + rw; x += 2) {
      const i = (png.width * y + x) << 2;
      peak = Math.max(peak, png.data[i]!, png.data[i + 1]!, png.data[i + 2]!);
    }
  }
  return peak;
}

/** Sample max RGB from the central viewport (avoids HUD chrome at edges). */
async function sampleCanvasCenterPeak(page: Page): Promise<number> {
  const canvas = page.locator('.canvas canvas');
  const shot = await canvas.screenshot({ type: 'png' });
  const png = PNG.sync.read(shot);
  return peakCenterFromPng(png);
}

function meanCenterFromPng(png: PNG): number {
  const x0 = Math.floor(png.width * 0.35);
  const y0 = Math.floor(png.height * 0.18);
  const rw = Math.floor(png.width * 0.3);
  const rh = Math.floor(png.height * 0.42);
  let sum = 0;
  let count = 0;
  for (let y = y0; y < y0 + rh; y += 2) {
    for (let x = x0; x < x0 + rw; x += 2) {
      const i = (png.width * y + x) << 2;
      sum += (png.data[i]! + png.data[i + 1]! + png.data[i + 2]!) / 3;
      count += 1;
    }
  }
  return count > 0 ? sum / count : 0;
}

/** Sample max RGB once after frames settle (avoids maxing over scrub transition frames). */
export async function canvasCenterBrightnessOnce(page: Page, settleMs = 1200): Promise<number> {
  await page.waitForTimeout(settleMs);
  await waitForCanvasFrame(page, 8);
  return sampleCanvasCenterPeak(page);
}

/** Mean center luminance once after settle — smoother than peak for era comparisons. */
export async function canvasCenterMeanOnce(page: Page, settleMs = 1200): Promise<number> {
  await page.waitForTimeout(settleMs);
  await waitForCanvasFrame(page, 8);
  const canvas = page.locator('.canvas canvas');
  const shot = await canvas.screenshot({ type: 'png' });
  const png = PNG.sync.read(shot);
  return meanCenterFromPng(png);
}

/** Sample max RGB from the rendered WebGL canvas (requires preserveDrawingBuffer). */
export async function canvasMaxBrightness(page: Page): Promise<number> {
  const canvas = page.locator('.canvas canvas');
  await canvas.waitFor({ state: 'visible' });

  let best = 0;
  for (let attempt = 0; attempt < 16; attempt++) {
    if (attempt > 0) await page.waitForTimeout(300);
    await waitForCanvasFrame(page, 2);
    best = Math.max(best, await sampleCanvasCenterPeak(page));
    if (best > MIN_CANVAS_BRIGHTNESS) return best;
  }

  return best;
}

export async function canvasScreenshot(page: Page): Promise<Buffer> {
  await waitForCanvasFrame(page);
  const canvas = page.locator('.canvas canvas');
  await canvas.waitFor({ state: 'visible' });
  return canvas.screenshot();
}

/** Minimum max RGB (0–255) for a non-black WebGL frame. */
export const MIN_CANVAS_BRIGHTNESS = 24;

export function buffersDiffer(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return true;
  return !a.equals(b);
}
