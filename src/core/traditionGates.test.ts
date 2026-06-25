import { describe, expect, it } from 'vitest';
import { UNIVERSE_AGE_SECONDS } from './TimeSpace';
import { isCorrespondenceLensActive, meetsTraditionGate } from './traditionGates';

describe('traditionGates', () => {
  it('platonism gate after one session', () => {
    expect(
      meetsTraditionGate({
        tradition: 'platonism',
        spiritualDepth: 0.3,
        sessionsCompleted: 1,
        simTimeSeconds: UNIVERSE_AGE_SECONDS,
        spatialExponent: 12,
        mode: 'cosmic',
      }),
    ).toBe(true);
  });

  it('hermetic gate needs two sessions', () => {
    expect(
      meetsTraditionGate({
        tradition: 'hermetic',
        spiritualDepth: 0.4,
        sessionsCompleted: 1,
        simTimeSeconds: UNIVERSE_AGE_SECONDS,
        spatialExponent: 12,
        mode: 'cosmic',
      }),
    ).toBe(false);
  });

  it('correspondence lens at present Earth scale after practice', () => {
    expect(
      isCorrespondenceLensActive({
        spiritualDepth: 0.35,
        sessionsCompleted: 1,
        simTimeSeconds: UNIVERSE_AGE_SECONDS,
        spatialExponent: 12,
        mode: 'cosmic',
        introComplete: true,
        dominantTradition: 'platonism',
      }),
    ).toBe(true);
  });
});
