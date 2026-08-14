import { describe, expect, it } from 'vitest';
import { PUZZLE_TEMPLATES } from '../../data/ages/index';
import { getEventById } from '../../data/history/index';
import { UNIVERSE_AGE_SECONDS } from '../TimeSpace';
import {
  checkGematria,
  checkRingAlignment,
  isWithinEraWitnessWindow,
  rotateRing,
} from './index';

/**
 * R rotates rings in a fixed 0→1→2 cycle (AgeInteractionControls), so a
 * ring-alignment target must be reachable under that interleaving — the
 * full state cycle repeats every 12 presses. An unreachable sequence makes
 * the puzzle silently unsolvable (this happened with [0, 2, 1]).
 */
describe('ring-alignment reachability', () => {
  const ringTemplates = PUZZLE_TEMPLATES.filter((t) => t.type === 'ring-alignment');

  it('has at least one ring-alignment template', () => {
    expect(ringTemplates.length).toBeGreaterThan(0);
  });

  it.each(ringTemplates.map((t) => [t.id] as const))(
    '%s is solvable by cycling R',
    (puzzleId) => {
      let rotations = [0, 0, 0];
      let solvedAt: number | null = checkRingAlignment(puzzleId, rotations) ? 0 : null;
      for (let press = 1; press <= 12 && solvedAt === null; press += 1) {
        rotations = rotateRing(rotations, (press - 1) % 3);
        if (checkRingAlignment(puzzleId, rotations)) solvedAt = press;
      }
      expect(solvedAt).not.toBeNull();
    },
  );
});

/**
 * Sitting at the present must not count as witnessing any era — otherwise
 * ages gated on late-antique witness events (Byzantium via fall-rome,
 * Córdoba via islam) unlock on a fresh save with zero play.
 */
describe('era witness window', () => {
  const witnessTemplates = PUZZLE_TEMPLATES.filter(
    (t) => t.type === 'era-witness' && t.witnessEventId,
  );

  it('covers every era-witness puzzle', () => {
    expect(witnessTemplates.length).toBeGreaterThan(0);
  });

  it.each(witnessTemplates.map((t) => [t.id, t.witnessEventId!] as const))(
    '%s is not witnessed from the present',
    (_puzzleId, witnessEventId) => {
      const event = getEventById(witnessEventId);
      expect(event).toBeDefined();
      expect(isWithinEraWitnessWindow(UNIVERSE_AGE_SECONDS, event!.simTimeSeconds)).toBe(false);
    },
  );

  it.each(witnessTemplates.map((t) => [t.id, t.witnessEventId!] as const))(
    '%s is witnessed when scrubbed onto its era',
    (_puzzleId, witnessEventId) => {
      const event = getEventById(witnessEventId);
      expect(isWithinEraWitnessWindow(event!.simTimeSeconds, event!.simTimeSeconds)).toBe(true);
    },
  );
});

/**
 * A gematria riddle is silently unsolvable (or trivially broken) if its
 * answer id is missing from the options, duplicated, or the texts are empty.
 */
describe('gematria integrity', () => {
  const gematriaTemplates = PUZZLE_TEMPLATES.filter((t) => t.type === 'gematria');

  it('has at least one gematria template', () => {
    expect(gematriaTemplates.length).toBeGreaterThan(0);
  });

  it.each(gematriaTemplates.map((t) => [t.id] as const))('%s is well-formed', (puzzleId) => {
    const spec = PUZZLE_TEMPLATES.find((t) => t.id === puzzleId)!.gematria;
    expect(spec).toBeDefined();
    expect(spec!.prompt.length).toBeGreaterThan(0);
    expect(spec!.revelation.length).toBeGreaterThan(0);
    expect(spec!.options.length).toBeGreaterThanOrEqual(2);
    const ids = spec!.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(spec!.answerId);
  });

  it('accepts the right answer and rejects wrong ones', () => {
    expect(checkGematria('puzzle-zohar-gematria', 'ahavah')).toBe(true);
    expect(checkGematria('puzzle-zohar-gematria', 'shalom')).toBe(false);
    expect(checkGematria('puzzle-saturn-square', 'five')).toBe(true);
    expect(checkGematria('puzzle-saturn-square', 'nine')).toBe(false);
    expect(checkGematria('puzzle-hermetic-rings', 'ahavah')).toBe(false);
  });
});
