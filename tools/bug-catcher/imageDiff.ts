import { existsSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

export interface ImageDiffResult {
  available: boolean;
  dimensionsMatch: boolean;
  changedPercent: number;
  beforeSize: { width: number; height: number } | null;
  afterSize: { width: number; height: number } | null;
}

const MEANINGFUL_KEYS = new Set([
  'w',
  'a',
  's',
  'd',
  'e',
  'q',
  ' ',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Shift',
  'Tab',
  'Enter',
  'Escape',
  '~',
  '`',
]);

export function diffImages(beforePath: string, afterPath: string): ImageDiffResult {
  if (!existsSync(beforePath) || !existsSync(afterPath)) {
    return {
      available: false,
      dimensionsMatch: false,
      changedPercent: 0,
      beforeSize: null,
      afterSize: null,
    };
  }

  const before = PNG.sync.read(readFileSync(beforePath));
  const after = PNG.sync.read(readFileSync(afterPath));
  const beforeSize = { width: before.width, height: before.height };
  const afterSize = { width: after.width, height: after.height };

  if (before.width !== after.width || before.height !== after.height) {
    return {
      available: true,
      dimensionsMatch: false,
      changedPercent: 100,
      beforeSize,
      afterSize,
    };
  }

  let changed = 0;
  let total = 0;
  const step = 3;
  const threshold = 18;

  for (let y = 0; y < before.height; y += step) {
    for (let x = 0; x < before.width; x += step) {
      const i = (before.width * y + x) << 2;
      total += 1;
      const delta =
        Math.abs(before.data[i]! - after.data[i]!) +
        Math.abs(before.data[i + 1]! - after.data[i + 1]!) +
        Math.abs(before.data[i + 2]! - after.data[i + 2]!);
      if (delta > threshold) changed += 1;
    }
  }

  return {
    available: true,
    dimensionsMatch: true,
    changedPercent: total > 0 ? (changed / total) * 100 : 0,
    beforeSize,
    afterSize,
  };
}

export function isMeaningfulActivityKey(detail: string): boolean {
  return MEANINGFUL_KEYS.has(detail) || detail.length > 1;
}
