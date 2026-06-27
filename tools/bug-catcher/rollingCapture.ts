import type { Page } from '@playwright/test';

/** How often Playwright reads pixels for the rolling before-shot buffer. */
export type CaptureMode = 'debounced' | 'on-log' | 'interval';

export interface RollingCaptureOptions {
  mode: CaptureMode;
  /** @deprecated Full-page polling — causes WebGL/HUD flicker; kept for debugging only. */
  intervalMs?: number;
  debounceMs?: number;
  minIntervalMs?: number;
}

export class RollingCapture {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private lastCaptureAt = 0;
  buffer: Buffer | null = null;

  constructor(
    private readonly page: Page,
    private readonly options: RollingCaptureOptions,
  ) {}

  start(): void {
    if (this.options.mode === 'interval') {
      const ms = this.options.intervalMs ?? 2500;
      this.interval = setInterval(() => {
        void this.captureNow();
      }, ms);
    }
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.interval) clearInterval(this.interval);
    this.timer = null;
    this.interval = null;
  }

  /** Call when the player interacts with the app (not the catcher panel). */
  onActivity(): void {
    if (this.options.mode !== 'debounced') return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.captureNow();
    }, this.options.debounceMs ?? 700);
  }

  /** Ensure a before-buffer exists immediately before logging an issue. */
  async ensureBeforeBuffer(): Promise<void> {
    if (this.buffer && this.options.mode !== 'on-log') return;
    await this.captureNow();
  }

  async captureNow(): Promise<void> {
    const minGap = this.options.minIntervalMs ?? 1800;
    const now = Date.now();
    if (now - this.lastCaptureAt < minGap) return;
    this.lastCaptureAt = now;
    this.buffer = await captureCanvasOrViewport(this.page);
  }
}

async function waitForCanvasFrames(page: Page, frames = 4): Promise<void> {
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

/** Canvas-only when possible — avoids full-page compositor flashes that blink the HUD. */
export async function captureCanvasOrViewport(page: Page): Promise<Buffer> {
  const canvas = page.locator('.canvas canvas');
  if (await canvas.count()) {
    try {
      await canvas.first().waitFor({ state: 'visible', timeout: 2000 });
      await waitForCanvasFrames(page);
      return await canvas.first().screenshot({ type: 'png' });
    } catch {
      // fall through
    }
  }
  return page.screenshot({ fullPage: false, type: 'png' });
}

export async function captureCanvasToFile(page: Page, path: string): Promise<boolean> {
  const canvas = page.locator('.canvas canvas');
  if (!(await canvas.count())) return false;
  try {
    await canvas.first().waitFor({ state: 'visible', timeout: 2000 });
    await waitForCanvasFrames(page);
    await canvas.first().screenshot({ path, type: 'png' });
    return true;
  } catch {
    return false;
  }
}

export function defaultCaptureMode(_sessionMode: 'qa' | 'guidance'): CaptureMode {
  // Full-page / frequent capture forces WebGL compositing and blinks the HUD in Playwright.
  return 'on-log';
}
