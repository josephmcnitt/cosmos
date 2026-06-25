export interface HudState {
  heavenPhase?: string;
  starfieldBrightness?: string;
  bigBangReplayActive?: string;
  ephemerisActive?: string;
  correspondenceActive?: string;
  knowledgeMode?: string;
  spatialExponent?: string;
  temporalZoom?: string;
  spatialBand?: string;
  spatialBandLabel?: string;
  timelinePlayheadSeconds?: string;
  timelineNormalized?: string;
  timelineMinSeconds?: string;
  timelineMaxSeconds?: string;
  walking?: boolean;
  embodiedHud?: boolean;
  introVisible?: boolean;
  embodimentBanner?: boolean;
  historyTrack?: string;
  depthToggle?: string;
  cssRealmLiminal?: string;
  cssRealmSpiritual?: string;
  cssEmbodimentFade?: string;
}

const TEST_IDS = [
  'heaven-phase',
  'starfield-brightness',
  'bigbang-replay-active',
  'ephemeris-active',
  'correspondence-active',
  'knowledge-mode',
  'spatial-slider',
  'temporal-zoom',
  'hud-spatial-band',
  'timeline-playhead',
  'timeline-min',
  'timeline-max',
  'hud-walking',
  'hud-embodied',
  'intro-overlay',
  'embodiment-banner',
  'history-track-material',
  'history-track-spiritual',
  'depth-toggle-summary',
  'depth-toggle-full',
] as const;

function findTag(html: string, testId: string): string | null {
  const re = new RegExp(`<[^>]*data-testid="${testId}"[^>]*>`, 'i');
  return html.match(re)?.[0] ?? null;
}

function readAttr(tag: string | null, attr: string): string | undefined {
  if (!tag) return undefined;
  const re = new RegExp(`${attr}="([^"]*)"`, 'i');
  return tag.match(re)?.[1];
}

function readStyleVar(html: string, name: string): string | undefined {
  const re = new RegExp(`${name}:\\s*([^;"]+)`, 'i');
  return html.match(re)?.[1]?.trim();
}

function activeHistoryTrack(html: string): string | undefined {
  for (const id of ['spiritual', 'material'] as const) {
    const tag = findTag(html, `history-track-${id}`);
    if (!tag) continue;
    if (/aria-selected="true"/i.test(tag) || /\bactive/i.test(tag)) return id;
  }
  return undefined;
}

function activeDepthToggle(html: string): string | undefined {
  for (const id of ['full', 'summary'] as const) {
    const tag = findTag(html, `depth-toggle-${id}`);
    if (!tag) continue;
    if (/aria-pressed="true"/i.test(tag) || /class="[^"]*active/i.test(tag)) return id;
  }
  return undefined;
}

export function extractHudState(html: string): HudState {
  const spatialBandTag = findTag(html, 'hud-spatial-band');
  return {
    heavenPhase: readAttr(findTag(html, 'heaven-phase'), 'data-phase'),
    starfieldBrightness: readAttr(findTag(html, 'starfield-brightness'), 'data-brightness'),
    bigBangReplayActive: readAttr(findTag(html, 'bigbang-replay-active'), 'data-active'),
    ephemerisActive: readAttr(findTag(html, 'ephemeris-active'), 'data-active'),
    correspondenceActive: readAttr(findTag(html, 'correspondence-active'), 'data-active'),
    knowledgeMode: readAttr(findTag(html, 'knowledge-mode'), 'data-mode'),
    spatialExponent: readAttr(findTag(html, 'spatial-slider'), 'value'),
    temporalZoom: readAttr(findTag(html, 'temporal-zoom'), 'value'),
    spatialBand: readAttr(spatialBandTag, 'data-band-id'),
    spatialBandLabel: spatialBandTag?.replace(/<[^>]+>/g, '').trim(),
    timelinePlayheadSeconds: readAttr(findTag(html, 'timeline-playhead'), 'data-seconds'),
    timelineNormalized: readAttr(findTag(html, 'timeline-playhead'), 'data-normalized'),
    timelineMinSeconds: readAttr(findTag(html, 'timeline-min'), 'data-seconds'),
    timelineMaxSeconds: readAttr(findTag(html, 'timeline-max'), 'data-seconds'),
    walking: Boolean(findTag(html, 'hud-walking')),
    embodiedHud: Boolean(findTag(html, 'hud-embodied')),
    introVisible: Boolean(findTag(html, 'intro-overlay')),
    embodimentBanner: Boolean(findTag(html, 'embodiment-banner')),
    historyTrack: activeHistoryTrack(html),
    depthToggle: activeDepthToggle(html),
    cssRealmLiminal: readStyleVar(html, '--realm-liminal'),
    cssRealmSpiritual: readStyleVar(html, '--realm-spiritual'),
    cssEmbodimentFade: readStyleVar(html, '--embodiment-fade'),
  };
}

export function formatHudState(state: HudState): string[] {
  const lines: string[] = [];
  const push = (label: string, value: string | boolean | undefined) => {
    if (value === undefined || value === '') return;
    lines.push(`${label}: ${value}`);
  };

  push('heaven phase', state.heavenPhase);
  push('starfield brightness', state.starfieldBrightness);
  push('spatial band', state.spatialBand ? `${state.spatialBand} (${state.spatialBandLabel ?? ''})`.trim() : undefined);
  push('spatial exponent', state.spatialExponent);
  push('temporal zoom', state.temporalZoom);
  push('timeline playhead (s)', state.timelinePlayheadSeconds);
  push('timeline normalized', state.timelineNormalized);
  push('history track', state.historyTrack);
  push('depth', state.depthToggle);
  push('walking', state.walking ? 'yes' : undefined);
  push('embodied HUD', state.embodiedHud ? 'yes' : undefined);
  push('intro visible', state.introVisible ? 'yes' : undefined);
  push('embodiment banner', state.embodimentBanner ? 'yes' : undefined);
  push('realm liminal', state.cssRealmLiminal);
  push('realm spiritual', state.cssRealmSpiritual);
  push('embodiment fade', state.cssEmbodimentFade);
  push('big bang replay', state.bigBangReplayActive);
  push('ephemeris', state.ephemerisActive);
  push('correspondence', state.correspondenceActive);
  push('knowledge mode', state.knowledgeMode);

  return lines;
}

export function summarizeHudState(state: HudState): string {
  const parts: string[] = [];
  if (state.heavenPhase) parts.push(`heaven=${state.heavenPhase}`);
  if (state.spatialBand) parts.push(`band=${state.spatialBand}`);
  if (state.spatialExponent) parts.push(`spatial=${state.spatialExponent}`);
  if (state.historyTrack) parts.push(`track=${state.historyTrack}`);
  if (state.walking) parts.push('walking');
  if (state.introVisible) parts.push('intro');
  return parts.join(', ') || 'unknown';
}

/** Exported for tests and docs. */
export const HUD_TEST_IDS = TEST_IDS;
