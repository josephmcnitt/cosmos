import type { WheelEvent as ReactWheelEvent } from 'react';

/** Prevent native range-input wheel nudging; release focus for canvas zoom routing. */
export function onRangeInputWheel(e: ReactWheelEvent<HTMLInputElement>): void {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.blur();
}
