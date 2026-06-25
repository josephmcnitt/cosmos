import type { Page } from '@playwright/test';

export interface TimelineState {
  min: number;
  max: number;
  playhead: number;
  normalized: number;
}

export async function skipIntro(page: Page): Promise<void> {
  const overlay = page.getByTestId('intro-overlay');
  await overlay.waitFor({ state: 'visible', timeout: 15_000 });
  await page.getByTestId('intro-skip').click();
  await overlay.waitFor({ state: 'hidden', timeout: 10_000 });
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
  const x = box.x + box.width * Math.max(0.001, Math.min(0.98, fraction));
  const y = box.y + box.height / 2;
  await page.mouse.click(x, y);
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

export async function canvasScreenshot(page: Page): Promise<Buffer> {
  const canvas = page.locator('.canvas');
  await canvas.waitFor({ state: 'visible' });
  return canvas.screenshot();
}

/** Rough check that a PNG screenshot is not a uniform black frame. */
export function screenshotHasVisibleContent(png: Buffer): boolean {
  if (png.length < 500) return false;
  let brightSamples = 0;
  for (let i = 200; i < Math.min(png.length, 8000); i += 8) {
    if (png[i]! > 20) brightSamples++;
  }
  return brightSamples > 8;
}

export function buffersDiffer(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return true;
  return !a.equals(b);
}

/** Leftmost pixel — needed for pre-stellar eras on the years-ago log timeline. */
export async function clickTimelineLeftEdge(page: Page): Promise<void> {
  const track = page.getByTestId('scrubber-track');
  await track.waitFor({ state: 'visible' });
  const box = await track.boundingBox();
  if (!box) throw new Error('Scrubber track not found');
  await page.mouse.click(box.x + 2, box.y + box.height / 2);
}
