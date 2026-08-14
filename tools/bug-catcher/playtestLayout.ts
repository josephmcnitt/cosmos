/** Keep the playtest panel above the bottom timeline / time-zoom stack. */
export const PLAYTEST_TIMELINE_SAFE_PX = 260;

/** Extra bottom reserve so walk HUD does not cover time controls during playtests. */
export const PLAYTEST_TIME_CONTROLS_RESERVE = '248px';

/**
 * Clear the Journal toggle at top-right so the notes panel does not cover it.
 * Must stay below the toggle's bottom edge — in cosmic view `.journal-toggle--cosmic`
 * sits at top:108px and is ~21px tall, so anything under ~130 overlaps it.
 */
export const PLAYTEST_PANEL_TOP_OFFSET_PX = 140;

export const GUIDANCE_TIPS = [
  'Click anywhere or press a key to skip the opening.',
  'Mouse wheel or [ ] keys — zoom from universe down to human scale.',
  'Bottom timeline bar — drag the blue track to scrub history (left = past, right = now).',
  'Time zoom — slider under the timeline (labeled “Time zoom”); drag right to narrow the window.',
  'Shift + wheel or Shift + [ ] — finer timeline scrubbing.',
  'Zoom to human at present to walk (WASD).',
  'During initiation, follow the golden ring to the sacred olive tree.',
  'E to interact, Q (hold) to practice near stones. At Hermetic Corpus, press R for rings.',
  'Journal (top-right) tracks discoveries and shows your next step on the path.',
  'In walk mode the History list and timeline collapse to pills — click them to reopen.',
  'No wrong way to explore — note confusion or delight anytime.',
] as const;

export const PLAYTEST_LAYOUT_CSS = `
.bug-catcher-playtest-layout.app,
.bug-catcher-playtest-layout .app {
  --time-controls-reserve: ${PLAYTEST_TIME_CONTROLS_RESERVE};
}

.bug-catcher-playtest-layout .time-controls {
  z-index: 2147483640;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.45);
  outline: 1px solid rgba(106, 140, 255, 0.35);
}

.bug-catcher-playtest-layout .time-controls-header > span:first-child {
  color: #d0dcff;
}

.bug-catcher-playtest-layout .journal-toggle {
  z-index: 2147483645;
}

.bug-catcher-playtest-layout .walk-context-hud,
.bug-catcher-playtest-layout .walk-approach-prompt {
  bottom: calc(var(--time-controls-reserve) + 16px);
  z-index: 2147483641;
}

.bug-catcher-playtest-layout .scrubber-track-outer,
.bug-catcher-playtest-layout .scrubber-track {
  overflow: visible;
}

.bug-catcher-playtest-layout .scrubber-track::before {
  outline: 2px solid rgba(106, 140, 255, 0.55);
  background: rgba(40, 55, 85, 0.9);
}

.bug-catcher-playtest-layout .scrubber-thumb {
  width: 22px;
  height: 22px;
  margin-left: -11px;
  margin-top: -11px;
  border: 3px solid #ffffff;
  box-shadow:
    0 0 0 1px rgba(106, 140, 255, 0.8),
    0 0 18px rgba(106, 140, 255, 1);
  z-index: 2;
}

.bug-catcher-playtest-layout .temporal-zoom-label {
  border-color: rgba(106, 140, 255, 0.75);
  box-shadow: 0 0 14px rgba(106, 140, 255, 0.28);
  background: rgba(16, 24, 44, 0.92);
}

.bug-catcher-playtest-layout .temporal-zoom-label input[type='range'] {
  width: 180px;
  height: 10px;
  accent-color: #8aa8ff;
}
`.trim();

export function clampPanelTop(
  top: number,
  panelHeight: number,
  viewportHeight: number,
  timelineSafePx = PLAYTEST_TIMELINE_SAFE_PX,
): number {
  const maxTop = Math.max(8, viewportHeight - timelineSafePx - panelHeight);
  return Math.min(maxTop, Math.max(8, top));
}

export function buildPlaytestLayoutInitScript(): string {
  return `
(() => {
  if (window.__cosmosPlaytestLayout) return;
  window.__cosmosPlaytestLayout = true;
  const css = ${JSON.stringify(PLAYTEST_LAYOUT_CSS)};
  const mount = () => {
    document.documentElement.classList.add('bug-catcher-playtest-layout');
    const app = document.querySelector('.app');
    app?.classList.add('bug-catcher-playtest-layout');
    if (document.getElementById('cosmos-playtest-layout')) return;
    const style = document.createElement('style');
    style.id = 'cosmos-playtest-layout';
    style.textContent = css;
    document.documentElement.appendChild(style);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
`.trim();
}
