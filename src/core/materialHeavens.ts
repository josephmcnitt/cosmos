import { COSMIC_EVENTS } from '../data/history/cosmic';
import { clampSimTime } from './TimeSpace';

export type HeavenPhaseId = 'darkAges' | 'firstLight' | 'reionized';

export interface HeavenVisuals {
  phase: HeavenPhaseId;
  bandScale: { universe: number; galaxy: number; stellar: number };
  starfieldOpacity: number;
  ambientScale: number;
  fogColor: string;
  fogDensity: number;
  cmbGlow: number;
}

function cosmicThreshold(id: string): number {
  const event = COSMIC_EVENTS.find((e) => e.id === id);
  if (!event) throw new Error(`Missing cosmic event: ${id}`);
  return event.simTimeSeconds;
}

const FIRST_STARS_SECONDS = cosmicThreshold('first-stars');
const REIONIZATION_SECONDS = cosmicThreshold('reionization');

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r0, g0, b0] = parse(hexA);
  const [r1, g1, b1] = parse(hexB);
  const r = Math.round(lerp(r0, r1, t));
  const g = Math.round(lerp(g0, g1, t));
  const b = Math.round(lerp(b0, b1, t));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const FOG_DARK = '#1a0808';
const FOG_DEFAULT = '#030508';
const CMB_WARM = '#2a1208';

/** Map sim time to cosmic-sky visual parameters (no React/Three deps). */
export function computeHeavenVisuals(simTimeSeconds: number): HeavenVisuals {
  const t = clampSimTime(simTimeSeconds);

  const firstLightBlend = smoothstep(FIRST_STARS_SECONDS * 0.85, FIRST_STARS_SECONDS * 1.05, t);
  const reionBlend = smoothstep(REIONIZATION_SECONDS * 0.9, REIONIZATION_SECONDS * 1.05, t);

  let phase: HeavenPhaseId;
  if (t < FIRST_STARS_SECONDS) {
    phase = 'darkAges';
  } else if (t < REIONIZATION_SECONDS) {
    phase = 'firstLight';
  } else {
    phase = 'reionized';
  }

  const starfieldOpacity = lerp(0.06, 1, firstLightBlend * (0.35 + reionBlend * 0.65));
  const galaxyScale = lerp(0.08, 1, firstLightBlend * (0.5 + reionBlend * 0.5));
  const stellarScale = lerp(0.05, 1, reionBlend);

  const ambientScale = lerp(0.2, 0.35, firstLightBlend * (0.4 + reionBlend * 0.6));
  const fogDensity = lerp(1, 0.45, firstLightBlend * (0.3 + reionBlend * 0.7));

  const cmbGlow = Math.max(0, 1 - smoothstep(0, FIRST_STARS_SECONDS * 0.5, t));
  const fogBase = lerpHex(FOG_DARK, FOG_DEFAULT, firstLightBlend * (0.25 + reionBlend * 0.75));
  const fogColor = lerpHex(fogBase, CMB_WARM, cmbGlow * 0.35);

  return {
    phase,
    bandScale: {
      universe: starfieldOpacity,
      galaxy: galaxyScale,
      stellar: stellarScale,
    },
    starfieldOpacity,
    ambientScale,
    fogColor,
    fogDensity,
    cmbGlow,
  };
}

export { FIRST_STARS_SECONDS, REIONIZATION_SECONDS };
