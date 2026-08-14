import { describe, expect, it } from 'vitest';
import {
  GUIDANCE_TIPS,
  PLAYTEST_LAYOUT_CSS,
  PLAYTEST_PANEL_TOP_OFFSET_PX,
  PLAYTEST_TIMELINE_SAFE_PX,
  buildPlaytestLayoutInitScript,
  clampPanelTop,
} from './playtestLayout';

describe('playtestLayout', () => {
  it('keeps panel drag above the timeline safe zone', () => {
    expect(clampPanelTop(800, 200, 900, PLAYTEST_TIMELINE_SAFE_PX)).toBe(440);
    expect(clampPanelTop(8, 200, 900, PLAYTEST_TIMELINE_SAFE_PX)).toBe(8);
  });

  it('highlights timeline and time zoom controls in playtest CSS', () => {
    expect(PLAYTEST_LAYOUT_CSS).toContain('.scrubber-thumb');
    expect(PLAYTEST_LAYOUT_CSS).toContain("input[type='range']");
    expect(PLAYTEST_LAYOUT_CSS).toContain('--time-controls-reserve');
    expect(PLAYTEST_LAYOUT_CSS).toContain('.journal-toggle');
    // Must clear the cosmic Journal toggle (top:108px, ~21px tall) — an offset
    // that merely beats 80 still covers it, which is the bug this guards.
    expect(PLAYTEST_PANEL_TOP_OFFSET_PX).toBeGreaterThanOrEqual(130);
  });

  it('documents timeline scrub, time zoom, next-step guidance, and walk-mode pills', () => {
    expect(GUIDANCE_TIPS.some((tip) => tip.includes('Bottom timeline bar'))).toBe(true);
    expect(GUIDANCE_TIPS.some((tip) => tip.includes('Time zoom'))).toBe(true);
    // Path guidance now lives inside the Journal panel — the tip must still
    // tell a playtester where to find their next step.
    expect(
      GUIDANCE_TIPS.some((tip) => tip.includes('Journal') && tip.includes('next step')),
    ).toBe(true);
    // Walk mode collapses History and the timeline; playtesters must be told.
    expect(GUIDANCE_TIPS.some((tip) => tip.includes('pills'))).toBe(true);
    expect(GUIDANCE_TIPS.some((tip) => tip.toLowerCase().includes('space bar'))).toBe(false);
  });

  it('builds a self-contained init script', () => {
    const script = buildPlaytestLayoutInitScript();
    expect(script).toContain('__cosmosPlaytestLayout');
    expect(script).toContain('bug-catcher-playtest-layout');
    expect(script).toContain('scrubber-thumb');
  });
});
