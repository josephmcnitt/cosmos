export type WheelZoomAction = 'spatial' | 'temporal' | 'camera';

/** Selectors where wheel should scroll content, not zoom the cosmos. */
export const WHEEL_SCROLL_BLOCK_SELECTORS = [
  '.event-list-items',
  '.event-list',
  '.event-detail',
  '.ui-sidebar-left',
  '.event-tradition-chips',
  '.time-controls',
] as const;

export interface WheelZoomInput {
  observerMode: 'cosmic' | 'earth' | 'embodied';
  shiftKey: boolean;
}

export function resolveWheelZoomAction(input: WheelZoomInput): WheelZoomAction {
  if (input.observerMode === 'embodied') {
    return input.shiftKey ? 'temporal' : 'camera';
  }
  if (input.observerMode === 'earth') {
    return input.shiftKey ? 'temporal' : 'camera';
  }
  return input.shiftKey ? 'temporal' : 'spatial';
}

/** Map wheel deltaY to the adjustment passed to observer store actions. */
export function wheelDeltaToAdjustment(deltaY: number, action: WheelZoomAction): number {
  const delta = -deltaY * 0.002;
  switch (action) {
    case 'spatial':
      return delta;
    case 'temporal':
      return delta * 0.5;
    case 'camera':
      return -delta * 6;
  }
}

export function isWheelScrollBlockTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return WHEEL_SCROLL_BLOCK_SELECTORS.some((selector) => target.closest(selector) != null);
}

export function findRangeInputFromTarget(target: EventTarget | null): HTMLInputElement | null {
  if (!(target instanceof Element)) return null;
  if (target instanceof HTMLInputElement && target.type === 'range') {
    return target;
  }
  const ancestor = target.closest('input[type="range"]');
  if (ancestor instanceof HTMLInputElement) return ancestor;
  if (target instanceof HTMLLabelElement && target.control instanceof HTMLInputElement) {
    return target.control.type === 'range' ? target.control : null;
  }
  const nested = target.querySelector('input[type="range"]');
  return nested instanceof HTMLInputElement ? nested : null;
}

export interface WheelTargetPrep {
  blocked: boolean;
  blurredRangeInput: boolean;
}

/**
 * Prepare wheel target: blur focused range sliders (so native wheel does not
 * keep adjusting time/spatial sliders) and detect scroll-only UI regions.
 */
export function prepareWheelTarget(target: EventTarget | null): WheelTargetPrep {
  if (isWheelScrollBlockTarget(target)) {
    return { blocked: true, blurredRangeInput: false };
  }

  const rangeInput = findRangeInputFromTarget(target);
  if (rangeInput) {
    rangeInput.blur();
    return { blocked: false, blurredRangeInput: true };
  }

  return { blocked: false, blurredRangeInput: false };
}

export function handleWheelZoomEvent(
  event: Pick<WheelEvent, 'target' | 'shiftKey' | 'deltaY'>,
  observerMode: 'cosmic' | 'earth' | 'embodied',
): { blocked: true } | { blocked: false; action: WheelZoomAction; adjustment: number } {
  const prep = prepareWheelTarget(event.target);
  if (prep.blocked) return { blocked: true };

  const action = resolveWheelZoomAction({ observerMode, shiftKey: event.shiftKey });
  return {
    blocked: false,
    action,
    adjustment: wheelDeltaToAdjustment(event.deltaY, action),
  };
}
