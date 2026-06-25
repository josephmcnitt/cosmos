import type { Page } from '@playwright/test';

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
