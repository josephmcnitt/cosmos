import { describe, expect, it } from 'vitest';
import { UNIVERSE_AGE_SECONDS } from './TimeSpace';
import {
  clampAvatarToSite,
  EMBODIED_ENTER_EXPONENT,
  EMBODIED_EXIT_EXPONENT,
  shouldEnterEmbodied,
  shouldExitEmbodiedFromSpatial,
  shouldExitEmbodiedFromTime,
  SITE_HALF_SIZE,
} from './embodiment';

const introComplete = { introComplete: true, isFlying: false };

describe('shouldEnterEmbodied', () => {
  it('requires human era and high spatial exponent', () => {
    expect(
      shouldEnterEmbodied(
        { mode: 'cosmic', spatialExponent: EMBODIED_ENTER_EXPONENT, simTimeSeconds: UNIVERSE_AGE_SECONDS },
        introComplete,
      ),
    ).toBe(true);
  });

  it('blocks when already embodied', () => {
    expect(
      shouldEnterEmbodied(
        { mode: 'embodied', spatialExponent: 5, simTimeSeconds: UNIVERSE_AGE_SECONDS },
        introComplete,
      ),
    ).toBe(false);
  });

  it('blocks in deep time', () => {
    expect(
      shouldEnterEmbodied(
        { mode: 'cosmic', spatialExponent: 5, simTimeSeconds: 1 },
        introComplete,
      ),
    ).toBe(false);
  });

  it('blocks before intro complete', () => {
    expect(
      shouldEnterEmbodied(
        { mode: 'cosmic', spatialExponent: 5, simTimeSeconds: UNIVERSE_AGE_SECONDS },
        { introComplete: false, isFlying: false },
      ),
    ).toBe(false);
  });
});

describe('shouldExitEmbodiedFromSpatial', () => {
  it('exits when zooming out below exit exponent', () => {
    expect(
      shouldExitEmbodiedFromSpatial({
        mode: 'embodied',
        spatialExponent: EMBODIED_EXIT_EXPONENT - 0.1,
      }),
    ).toBe(true);
  });

  it('stays when above exit exponent', () => {
    expect(
      shouldExitEmbodiedFromSpatial({
        mode: 'embodied',
        spatialExponent: EMBODIED_EXIT_EXPONENT + 0.5,
      }),
    ).toBe(false);
  });
});

describe('shouldExitEmbodiedFromTime', () => {
  it('exits when leaving human era', () => {
    expect(
      shouldExitEmbodiedFromTime({ mode: 'embodied', simTimeSeconds: 100 }),
    ).toBe(true);
  });
});

describe('clampAvatarToSite', () => {
  it('clamps to site bounds', () => {
    const out = clampAvatarToSite(SITE_HALF_SIZE + 10, -(SITE_HALF_SIZE + 10));
    expect(out.x).toBe(SITE_HALF_SIZE);
    expect(out.z).toBe(-SITE_HALF_SIZE);
  });
});
