import type { WheelZoomAction } from './wheelZoom';
import { resolveWheelZoomAction } from './wheelZoom';
import { isTypingTarget } from './typingTarget';

export type KeyboardZoomDirection = 'in' | 'out';

/** Equivalent wheel deltaY per keypress — matches one scroll notch in wheelZoom. */
export const KEYBOARD_WHEEL_DELTA: Record<KeyboardZoomDirection, number> = {
  in: -100,
  out: 100,
};

export function isKeyboardZoomBlocked(target: EventTarget | null): boolean {
  return isTypingTarget(target);
}

export function resolveKeyboardZoomDirection(key: string): KeyboardZoomDirection | null {
  if (key === '[' || key === '-' || key === 'PageDown') return 'out';
  if (key === ']' || key === '=' || key === '+' || key === 'PageUp') return 'in';
  return null;
}

export function resolveKeyboardZoomAction(
  shiftKey: boolean,
  observerMode: 'cosmic' | 'earth' | 'embodied',
): WheelZoomAction {
  return resolveWheelZoomAction({ observerMode, shiftKey });
}
