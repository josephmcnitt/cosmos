/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import {
  isKeyboardZoomBlocked,
  KEYBOARD_WHEEL_DELTA,
  resolveKeyboardZoomAction,
  resolveKeyboardZoomDirection,
} from './keyboardZoom';
import { wheelDeltaToAdjustment } from './wheelZoom';

describe('resolveKeyboardZoomDirection', () => {
  it('maps bracket keys and page keys', () => {
    expect(resolveKeyboardZoomDirection('[')).toBe('out');
    expect(resolveKeyboardZoomDirection(']')).toBe('in');
    expect(resolveKeyboardZoomDirection('PageUp')).toBe('in');
    expect(resolveKeyboardZoomDirection('PageDown')).toBe('out');
  });

  it('ignores unrelated keys', () => {
    expect(resolveKeyboardZoomDirection('w')).toBeNull();
  });
});

describe('resolveKeyboardZoomAction', () => {
  it('matches wheel zoom routing', () => {
    expect(resolveKeyboardZoomAction(false, 'cosmic')).toBe('spatial');
    expect(resolveKeyboardZoomAction(true, 'cosmic')).toBe('temporal');
    expect(resolveKeyboardZoomAction(false, 'embodied')).toBe('camera');
  });
});

describe('KEYBOARD_WHEEL_DELTA', () => {
  it('matches one wheel notch via wheelDeltaToAdjustment', () => {
    expect(wheelDeltaToAdjustment(KEYBOARD_WHEEL_DELTA.in, 'spatial')).toBeCloseTo(0.2);
    expect(wheelDeltaToAdjustment(KEYBOARD_WHEEL_DELTA.out, 'spatial')).toBeCloseTo(-0.2);
  });
});

describe('isKeyboardZoomBlocked', () => {
  it('blocks form fields and bug catcher panel', () => {
    document.body.innerHTML = `
      <div id="bug-catcher-panel"><span id="inside-panel"/></div>
      <input id="text" type="text" />
    `;
    expect(isKeyboardZoomBlocked(document.getElementById('inside-panel'))).toBe(true);
    expect(isKeyboardZoomBlocked(document.getElementById('text'))).toBe(true);
    expect(isKeyboardZoomBlocked(document.body)).toBe(false);
  });
});
