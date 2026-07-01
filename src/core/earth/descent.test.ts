/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { ceYear, yearsAgo } from '../../data/history/time';
import { getInitialObserverState, useObserverStore } from '../ObserverState';
import { useWorldStore } from '../world/WorldState';
import { getEarthDescentEligibility } from './descent';
import { EARTH_SITE_COORDS } from '../../data/earth/siteCoordinates';
import type { GeoFocus } from './earthMode';

const GROVE_FOCUS: GeoFocus = {
  ...EARTH_SITE_COORDS.athens,
  siteAnchorId: 'athens',
  ageId: 'grove',
};

const ROME_FOCUS: GeoFocus = {
  ...EARTH_SITE_COORDS.rome,
  siteAnchorId: 'rome',
  ageId: 'rome',
};

function resetStore(overrides: Partial<ReturnType<typeof getInitialObserverState>> = {}) {
  useObserverStore.setState({ ...getInitialObserverState(), ...overrides });
}

function resetWorld(overrides: Partial<ReturnType<typeof useWorldStore.getState>> = {}) {
  useWorldStore.setState({
    currentWorldId: 'grove',
    unlockedWorldIds: ['grove'],
    visitedWorldIds: ['grove'],
    initiationStatus: {
      grove: 'available',
      alexandria: 'locked',
      rome: 'locked',
      desert: 'locked',
    },
    ...overrides,
  } as Partial<ReturnType<typeof useWorldStore.getState>>);
}

beforeEach(() => {
  resetStore();
  resetWorld();
});

describe('getEarthDescentEligibility', () => {
  it('allows grove at present', () => {
    expect(getEarthDescentEligibility(GROVE_FOCUS, yearsAgo(0)).canDescend).toBe(true);
  });

  it('blocks when site is outside its time window', () => {
    expect(getEarthDescentEligibility(GROVE_FOCUS, ceYear(-600)).canDescend).toBe(false);
  });

  it('blocks locked ages', () => {
    expect(getEarthDescentEligibility(ROME_FOCUS, yearsAgo(0)).canDescend).toBe(false);
  });

  it('allows unlocked rome after grove initiation', () => {
    resetWorld({
      unlockedWorldIds: ['grove', 'rome'],
      initiationStatus: {
        grove: 'completed',
        alexandria: 'locked',
        rome: 'available',
        desert: 'locked',
      },
    });
    expect(getEarthDescentEligibility(ROME_FOCUS, yearsAgo(0)).canDescend).toBe(true);
  });

  it('blocks non-grove ages before grove initiation completes', () => {
    resetWorld({
      unlockedWorldIds: ['grove', 'rome'],
      initiationStatus: {
        grove: 'available',
        alexandria: 'locked',
        rome: 'available',
        desert: 'locked',
      },
    });
    const result = getEarthDescentEligibility(ROME_FOCUS, yearsAgo(0));
    expect(result.canDescend).toBe(false);
    expect(result.reason).toMatch(/Grove initiation/i);
  });
});

describe('beginEarthDescent', () => {
  it('starts descent and travels to grove', () => {
    resetStore({
      mode: 'earth',
      earthPhase: 'globe',
      geoFocus: GROVE_FOCUS,
      simTimeSeconds: yearsAgo(0),
    });

    const ok = useObserverStore.getState().beginEarthDescent();
    expect(ok).toBe(true);
    expect(useObserverStore.getState().earthPhase).toBe('descent');
    expect(useWorldStore.getState().currentWorldId).toBe('grove');
  });

  it('completes into embodied walk mode', () => {
    resetStore({
      mode: 'earth',
      earthPhase: 'descent',
      geoFocus: GROVE_FOCUS,
      preEarthExponent: 14,
    });

    useObserverStore.getState().completeEarthDescent();
    const state = useObserverStore.getState();
    expect(state.mode).toBe('embodied');
    expect(state.earthPhase).toBe('globe');
    expect(state.geoFocus).toBeNull();
    expect(state.spatialExponent).toBe(4);
  });

  it('rejects descent when age is locked', () => {
    resetStore({
      mode: 'earth',
      earthPhase: 'globe',
      geoFocus: ROME_FOCUS,
      simTimeSeconds: yearsAgo(0),
    });

    expect(useObserverStore.getState().beginEarthDescent()).toBe(false);
    expect(useObserverStore.getState().earthPhase).toBe('globe');
  });
});
