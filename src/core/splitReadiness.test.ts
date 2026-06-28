import { describe, expect, it } from 'vitest';
import { nextSplitRequirement, showSplitPrep } from './splitReadiness';
import type { SplitReadinessContext } from './splitReadiness';

const baseCtx: SplitReadinessContext = {
  mode: 'embodied',
  initiated: true,
  worldLayer: 'material',
  realmPhase: 'material',
  sustainElapsedSec: 0,
  spiritualDepth: 0.4,
  sessionsCompleted: 2,
  simTimeSeconds: 0,
  spatialExponent: 15,
  dominantTradition: 'hermetic',
  entanglementsCount: 0,
};

describe('showSplitPrep', () => {
  it('hides prep on material layer until player toggles veil', () => {
    expect(showSplitPrep(baseCtx)).toBe(false);
    expect(showSplitPrep({ ...baseCtx, worldLayer: 'esoteric' })).toBe(true);
  });

  it('shows rejoin hint regardless of layer when split is active', () => {
    expect(showSplitPrep({ ...baseCtx, entanglementsCount: 1 })).toBe(true);
  });
});

describe('nextSplitRequirement', () => {
  it('returns the first unmet requirement', () => {
    expect(nextSplitRequirement(baseCtx)?.id).toBe('esoteric');
  });
});
