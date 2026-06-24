import { getEventById } from '../data/history/index';
import type { SpiritualTradition } from '../data/history/types';
import { isSpiritualEvent } from '../data/history/types';
import type { SiteMarker } from '../data/embodied/siteMarkers';
import type { ObserverMode } from './ObserverState';
import type { RealmPhase } from './PracticeState';

export const PRACTICE_DURATION_SEC = 20;
export const RESONANCE_GAIN = 0.15;
export const DISCOVERED_BONUS = 0.05;

export const LIMINAL_THRESHOLD = 0.25;
export const SPIRITUAL_THRESHOLD = 0.65;
export const SPIRITUAL_SUSTAIN_SEC = 8;

export const DECAY_PER_SEC_EMBODIED = 0.02 / 60;
export const DECAY_PER_SEC_COSMIC = 0.08 / 60;

export const LIMINAL_EXIT_THRESHOLD = 0.2;
export const SPIRITUAL_EXIT_THRESHOLD = 0.55;

export function clampResonance(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function computeSpiritualDepth(
  resonance: Partial<Record<SpiritualTradition, number>>,
): number {
  const values = Object.values(resonance).filter((v): v is number => v != null && v > 0);
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function dominantTradition(
  resonance: Partial<Record<SpiritualTradition, number>>,
): SpiritualTradition | null {
  let best: SpiritualTradition | null = null;
  let bestVal = 0;
  for (const [key, val] of Object.entries(resonance)) {
    if (val != null && val > bestVal) {
      bestVal = val;
      best = key as SpiritualTradition;
    }
  }
  return best;
}

export function traditionForMarker(eventId: string): SpiritualTradition | null {
  const event = getEventById(eventId);
  if (!event || !isSpiritualEvent(event)) return null;
  return event.tradition;
}

export function canStartPractice(
  mode: ObserverMode,
  marker: SiteMarker | undefined,
  avatarMoving: boolean,
): boolean {
  if (mode !== 'embodied' || avatarMoving || !marker) return false;
  const tradition = traditionForMarker(marker.eventId);
  if (!tradition) return false;
  const event = getEventById(marker.eventId);
  return event != null && isSpiritualEvent(event) && event.visibility === 'esoteric';
}

export function applyResonanceDecay(
  resonance: Partial<Record<SpiritualTradition, number>>,
  dtSec: number,
  embodied: boolean,
): Partial<Record<SpiritualTradition, number>> {
  const rate = embodied ? DECAY_PER_SEC_EMBODIED : DECAY_PER_SEC_COSMIC;
  const next: Partial<Record<SpiritualTradition, number>> = {};
  for (const [key, val] of Object.entries(resonance)) {
    if (val == null) continue;
    const decayed = val - rate * dtSec;
    if (decayed > 0.001) {
      next[key as SpiritualTradition] = decayed;
    }
  }
  return next;
}

export function computeNextRealmPhase(
  current: RealmPhase,
  depth: number,
  sustainElapsedSec: number,
  atStoneWithHighDepth: boolean,
): RealmPhase {
  if (depth >= SPIRITUAL_THRESHOLD && atStoneWithHighDepth && sustainElapsedSec >= SPIRITUAL_SUSTAIN_SEC) {
    return 'spiritual';
  }

  if (current === 'spiritual') {
    if (depth >= SPIRITUAL_EXIT_THRESHOLD && atStoneWithHighDepth) return 'spiritual';
    if (depth >= LIMINAL_THRESHOLD) return 'liminal';
    return 'material';
  }

  if (current === 'liminal') {
    if (depth < LIMINAL_EXIT_THRESHOLD) return 'material';
    if (depth >= SPIRITUAL_THRESHOLD && atStoneWithHighDepth && sustainElapsedSec >= SPIRITUAL_SUSTAIN_SEC) {
      return 'spiritual';
    }
    return 'liminal';
  }

  if (depth >= LIMINAL_THRESHOLD) return 'liminal';
  return 'material';
}

export function isAtStoneWithHighDepth(
  depth: number,
  marker: SiteMarker | undefined,
): boolean {
  return depth >= SPIRITUAL_THRESHOLD && marker != null;
}
