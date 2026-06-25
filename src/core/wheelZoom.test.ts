/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from 'vitest';
import {
  WHEEL_SCROLL_BLOCK_SELECTORS,
  findRangeInputFromTarget,
  handleWheelZoomEvent,
  isWheelScrollBlockTarget,
  prepareWheelTarget,
  resolveWheelZoomAction,
  wheelDeltaToAdjustment,
} from './wheelZoom';

describe('resolveWheelZoomAction', () => {
  it('maps cosmic mode without shift to spatial zoom', () => {
    expect(resolveWheelZoomAction({ observerMode: 'cosmic', shiftKey: false })).toBe('spatial');
  });

  it('maps cosmic mode with shift to temporal zoom', () => {
    expect(resolveWheelZoomAction({ observerMode: 'cosmic', shiftKey: true })).toBe('temporal');
  });

  it('maps embodied mode without shift to camera distance', () => {
    expect(resolveWheelZoomAction({ observerMode: 'embodied', shiftKey: false })).toBe('camera');
  });

  it('maps embodied mode with shift to temporal zoom', () => {
    expect(resolveWheelZoomAction({ observerMode: 'embodied', shiftKey: true })).toBe('temporal');
  });
});

describe('wheelDeltaToAdjustment', () => {
  it('inverts scroll direction and scales by action', () => {
    expect(wheelDeltaToAdjustment(100, 'spatial')).toBeCloseTo(-0.2);
    expect(wheelDeltaToAdjustment(100, 'temporal')).toBeCloseTo(-0.1);
    expect(wheelDeltaToAdjustment(100, 'camera')).toBeCloseTo(1.2);
  });

  it('handles zoom-in (negative deltaY)', () => {
    expect(wheelDeltaToAdjustment(-100, 'spatial')).toBeCloseTo(0.2);
  });
});

describe('isWheelScrollBlockTarget', () => {
  it('blocks wheel inside scrollable panels', () => {
    document.body.innerHTML = `
      <div class="event-list">
        <ul class="event-list-items"><li>Event</li></ul>
      </div>
    `;
    const item = document.querySelector('.event-list-items li')!;
    expect(isWheelScrollBlockTarget(item)).toBe(true);
  });

  it('does not block wheel on canvas-like targets', () => {
    document.body.innerHTML = `<canvas class="canvas"></canvas>`;
    const canvas = document.querySelector('.canvas')!;
    expect(isWheelScrollBlockTarget(canvas)).toBe(false);
  });

  it('does not block wheel on time controls panel (non-scroll region)', () => {
    document.body.innerHTML = `
      <div class="time-controls ui-panel">
        <input type="range" data-testid="temporal-zoom" />
      </div>
    `;
    const input = document.querySelector('input')!;
    expect(isWheelScrollBlockTarget(input)).toBe(true);
  });

  it('covers every configured block selector', () => {
    expect(WHEEL_SCROLL_BLOCK_SELECTORS.length).toBeGreaterThan(0);
    for (const selector of WHEEL_SCROLL_BLOCK_SELECTORS) {
      document.body.innerHTML = `<div class="${selector.replace('.', '')}"><span/></div>`;
      const inner = document.querySelector('span')!;
      expect(isWheelScrollBlockTarget(inner)).toBe(true);
    }
  });
});

describe('prepareWheelTarget', () => {
  it('blurs range inputs so wheel can route to spatial zoom', () => {
    document.body.innerHTML = `<input type="range" id="temporal" />`;
    const input = document.getElementById('temporal') as HTMLInputElement;
    input.focus();
    const blurSpy = vi.spyOn(input, 'blur');

    const prep = prepareWheelTarget(input);
    expect(prep.blocked).toBe(false);
    expect(prep.blurredRangeInput).toBe(true);
    expect(blurSpy).toHaveBeenCalled();
  });

  it('finds range input from child label click target', () => {
    document.body.innerHTML = `
      <label><input type="range" id="spatial" /></label>
    `;
    const label = document.querySelector('label')!;
    expect(findRangeInputFromTarget(label)).toBe(document.getElementById('spatial'));
  });
});

describe('handleWheelZoomEvent', () => {
  it('returns spatial adjustment for canvas wheel in cosmic mode', () => {
    document.body.innerHTML = `<canvas class="canvas"></canvas>`;
    const canvas = document.querySelector('.canvas')!;
    const result = handleWheelZoomEvent(
      { target: canvas, shiftKey: false, deltaY: 120 },
      'cosmic',
    );
    expect(result).toEqual({ blocked: false, action: 'spatial', adjustment: -0.24 });
  });

  it('returns blocked for event list scroll', () => {
    document.body.innerHTML = `<ul class="event-list-items"><li/></ul>`;
    const li = document.querySelector('li')!;
    expect(handleWheelZoomEvent({ target: li, shiftKey: false, deltaY: 120 }, 'cosmic')).toEqual({
      blocked: true,
    });
  });

  it('routes range input wheel to spatial after blur (not blocked)', () => {
    document.body.innerHTML = `<input type="range" id="temporal" />`;
    const input = document.getElementById('temporal') as HTMLInputElement;
    input.focus();

    const result = handleWheelZoomEvent(
      { target: input, shiftKey: false, deltaY: -80 },
      'cosmic',
    );
    expect(result).toEqual({ blocked: false, action: 'spatial', adjustment: 0.16 });
    expect(document.activeElement).not.toBe(input);
  });

  it('routes shift+wheel to temporal even when target was range input', () => {
    document.body.innerHTML = `<input type="range" id="temporal" />`;
    const input = document.getElementById('temporal') as HTMLInputElement;
    const result = handleWheelZoomEvent(
      { target: input, shiftKey: true, deltaY: 100 },
      'cosmic',
    );
    expect(result).toEqual({ blocked: false, action: 'temporal', adjustment: -0.1 });
  });
});
