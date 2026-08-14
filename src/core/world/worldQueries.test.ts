import { beforeEach, describe, expect, it } from 'vitest';
import { GROVE_AGE } from '../../data/ages/grove';
import { spawnEntitiesForAge } from './WorldRegistry';
import { useWorldStore } from './WorldState';
import { getNearestMarker } from './worldQueries';

describe('worldQueries — progression-hidden markers', () => {
  beforeEach(() => {
    useWorldStore.setState({
      currentWorldId: 'grove',
      entities: spawnEntitiesForAge(GROVE_AGE),
      initiationStatus: {
        grove: 'completed',
        alexandria: 'locked',
        rome: 'locked',
        desert: 'locked',
      },
      revealedMarkerIds: [],
    });
  });

  it('finds visible markers normally', () => {
    expect(getNearestMarker(7, 4, 1)?.entityId).toBe('grove-plato');
  });

  it('excludes hidden markers from nearest-marker queries until revealed', () => {
    // grove-via-liber-ii sits at (3, 2) and is hidden until its node completes.
    expect(getNearestMarker(3, 2, 1)).toBeUndefined();

    useWorldStore.setState({ revealedMarkerIds: ['grove-via-liber-ii'] });
    expect(getNearestMarker(3, 2, 1)?.entityId).toBe('grove-via-liber-ii');
  });
});
