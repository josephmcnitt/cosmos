/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { yearsAgo } from '../../data/history/time';
import { MEDITERRANEAN_PACK } from '../../data/earth/mediterranean300bce';
import { getInitialObserverState, useObserverStore } from '../ObserverState';
import { isInHumanEra } from '../spatialTimeCoupling';
import { UNIVERSE_AGE_SECONDS } from '../TimeSpace';
import { EARTH_GLOBE_ENTER_EXPONENT, EARTH_GLOBE_EXIT_EXPONENT } from './earthMode';
import { getSiteAnchorsAtTime } from './polityTime';

function resetStore(overrides: Partial<ReturnType<typeof getInitialObserverState>> = {}) {
  useObserverStore.setState({ ...getInitialObserverState(), ...overrides });
}

function setSearch(search: string) {
  window.history.replaceState({}, '', search || '/');
}

beforeEach(() => {
  setSearch('');
  resetStore();
});

afterEach(() => {
  setSearch('');
});

describe('enterEarthMode', () => {
  it('snaps deep time to present so site pins exist', () => {
    resetStore({ simTimeSeconds: 1, mode: 'cosmic', spatialExponent: 14 });
    useObserverStore.getState().enterEarthMode();

    const state = useObserverStore.getState();
    expect(state.mode).toBe('earth');
    expect(state.spatialExponent).toBe(EARTH_GLOBE_ENTER_EXPONENT);
    expect(isInHumanEra(state.simTimeSeconds)).toBe(true);
    expect(state.simTimeSeconds).toBe(UNIVERSE_AGE_SECONDS);

    const anchors = getSiteAnchorsAtTime(MEDITERRANEAN_PACK.sites, state.simTimeSeconds);
    expect(anchors.some((s) => s.id === 'athens')).toBe(true);
  });

  it('keeps present-era time when already in human era', () => {
    resetStore({ simTimeSeconds: yearsAgo(100), mode: 'cosmic', spatialExponent: 14 });
    useObserverStore.getState().enterEarthMode();

    const state = useObserverStore.getState();
    expect(state.mode).toBe('earth');
    expect(state.simTimeSeconds).toBe(yearsAgo(100));
    expect(getSiteAnchorsAtTime(MEDITERRANEAN_PACK.sites, state.simTimeSeconds).some((s) => s.id === 'athens')).toBe(
      true,
    );
  });

  it('is a no-op when globe feature is disabled', () => {
    setSearch('?earth=0');
    resetStore({ mode: 'cosmic', spatialExponent: 14 });
    useObserverStore.getState().enterEarthMode();
    expect(useObserverStore.getState().mode).toBe('cosmic');
  });
});

describe('spatial zoom earth entry', () => {
  it('auto-enters when crossing the exit threshold from cosmic', () => {
    resetStore({ spatialExponent: 18, mode: 'cosmic' });
    useObserverStore.getState().setSpatialExponent(14);

    const state = useObserverStore.getState();
    expect(state.mode).toBe('earth');
    expect(state.preEarthExponent).toBe(18);
  });

  it('stays cosmic at planetary scale when earthSync=0', () => {
    setSearch('?earthSync=0');
    resetStore({ spatialExponent: 18, mode: 'cosmic' });
    useObserverStore.getState().setSpatialExponent(14);

    const state = useObserverStore.getState();
    expect(state.mode).toBe('cosmic');
    expect(state.spatialExponent).toBe(14);
  });

  it('wheel-style adjustSpatialExponent auto-enters at threshold', () => {
    resetStore({ spatialExponent: EARTH_GLOBE_EXIT_EXPONENT + 0.5, mode: 'cosmic' });
    useObserverStore.getState().adjustSpatialExponent(-0.6);

    expect(useObserverStore.getState().mode).toBe('earth');
  });

  it('wheel-style adjustSpatialExponent respects earthSync=0', () => {
    setSearch('?earthSync=0');
    resetStore({ spatialExponent: EARTH_GLOBE_EXIT_EXPONENT + 0.5, mode: 'cosmic' });
    useObserverStore.getState().adjustSpatialExponent(-0.6);

    const state = useObserverStore.getState();
    expect(state.mode).toBe('cosmic');
    expect(state.spatialExponent).toBeCloseTo(EARTH_GLOBE_EXIT_EXPONENT - 0.1);
  });

  it('snaps deep time when auto-entering via spatial zoom', () => {
    resetStore({ spatialExponent: 18, mode: 'cosmic', simTimeSeconds: 1 });
    useObserverStore.getState().setSpatialExponent(14);

    const state = useObserverStore.getState();
    expect(state.mode).toBe('earth');
    expect(state.simTimeSeconds).toBe(UNIVERSE_AGE_SECONDS);
    expect(getSiteAnchorsAtTime(MEDITERRANEAN_PACK.sites, state.simTimeSeconds).some((s) => s.id === 'athens')).toBe(
      true,
    );
  });

  it('exits earth when zooming back above exit threshold', () => {
    resetStore({ spatialExponent: 14, mode: 'earth', preEarthExponent: 14 });
    useObserverStore.getState().setSpatialExponent(18);

    const state = useObserverStore.getState();
    expect(state.mode).toBe('cosmic');
    expect(state.spatialExponent).toBe(18);
  });
});
