import { describe, expect, it } from 'vitest';
import { SITE_MARKERS } from '../data/embodied/siteMarkers';
import { useWorldStore } from './world/WorldState';
import {
  applyResonanceDecay,
  canStartPractice,
  clampResonance,
  computeNextRealmPhase,
  computeSpiritualDepth,
  LIMINAL_EXIT_THRESHOLD,
  LIMINAL_THRESHOLD,
  SPIRITUAL_EXIT_THRESHOLD,
  SPIRITUAL_SUSTAIN_SEC,
  SPIRITUAL_THRESHOLD,
} from './practice';

describe('clampResonance', () => {
  it('clamps to 0..1', () => {
    expect(clampResonance(-0.5)).toBe(0);
    expect(clampResonance(1.5)).toBe(1);
    expect(clampResonance(0.4)).toBe(0.4);
  });
});

describe('computeSpiritualDepth', () => {
  it('returns max tradition value', () => {
    expect(computeSpiritualDepth({ kabbalah: 0.3, platonism: 0.7 })).toBe(0.7);
  });

  it('returns 0 when empty', () => {
    expect(computeSpiritualDepth({})).toBe(0);
  });
});

describe('computeNextRealmPhase', () => {
  it('stays material below liminal threshold', () => {
    expect(computeNextRealmPhase('material', 0.1, 0, false)).toBe('material');
  });

  it('enters liminal at threshold', () => {
    expect(computeNextRealmPhase('material', LIMINAL_THRESHOLD, 0, false)).toBe('liminal');
  });

  it('enters spiritual when sustained at stone', () => {
    expect(
      computeNextRealmPhase(
        'liminal',
        SPIRITUAL_THRESHOLD,
        SPIRITUAL_SUSTAIN_SEC,
        true,
      ),
    ).toBe('spiritual');
  });

  it('drops from liminal to material below exit threshold', () => {
    expect(computeNextRealmPhase('liminal', LIMINAL_EXIT_THRESHOLD - 0.01, 0, false)).toBe(
      'material',
    );
  });

  it('holds spiritual while depth and stone conditions met', () => {
    expect(
      computeNextRealmPhase('spiritual', SPIRITUAL_EXIT_THRESHOLD, 0, true),
    ).toBe('spiritual');
  });

  it('falls from spiritual to liminal when depth dips', () => {
    expect(
      computeNextRealmPhase('spiritual', LIMINAL_THRESHOLD + 0.05, 0, false),
    ).toBe('liminal');
  });
});

describe('applyResonanceDecay', () => {
  it('decays embodied slower than cosmic', () => {
    const start = { kabbalah: 0.5 };
    const embodied = applyResonanceDecay(start, 60, true);
    const cosmic = applyResonanceDecay(start, 60, false);
    expect(embodied.kabbalah ?? 0).toBeGreaterThan(cosmic.kabbalah ?? 0);
  });
});

describe('canStartPractice', () => {
  const zohar = SITE_MARKERS.find((m) => m.eventId === 'zohar')!;

  it('allows at esoteric stone in embodied mode when initiated', () => {
    useWorldStore.setState({
      initiationStatus: { grove: 'completed', alexandria: 'locked', rome: 'locked', desert: 'locked' },
      currentWorldId: 'grove',
    });
    expect(canStartPractice('embodied', zohar, false)).toBe(true);
  });

  it('blocks before initiation', () => {
    useWorldStore.setState({
      initiationStatus: { grove: 'available', alexandria: 'locked', rome: 'locked', desert: 'locked' },
      currentWorldId: 'grove',
    });
    expect(canStartPractice('embodied', zohar, false)).toBe(false);
  });

  it('blocks when moving', () => {
    expect(canStartPractice('embodied', zohar, true)).toBe(false);
  });

  it('blocks in cosmic mode', () => {
    expect(canStartPractice('cosmic', zohar, false)).toBe(false);
  });
});
