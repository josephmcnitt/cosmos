import { describe, expect, it } from 'vitest';
import {
  GUIDANCE_TIPS,
  PLAYTEST_LAYOUT_CSS,
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
  });

  it('documents timeline scrub and time zoom separately in tips', () => {
    expect(GUIDANCE_TIPS.some((tip) => tip.includes('Bottom timeline bar'))).toBe(true);
    expect(GUIDANCE_TIPS.some((tip) => tip.includes('Time zoom'))).toBe(true);
    expect(GUIDANCE_TIPS.some((tip) => tip.toLowerCase().includes('space bar'))).toBe(false);
  });

  it('builds a self-contained init script', () => {
    const script = buildPlaytestLayoutInitScript();
    expect(script).toContain('__cosmosPlaytestLayout');
    expect(script).toContain('bug-catcher-playtest-layout');
    expect(script).toContain('scrubber-thumb');
  });
});
