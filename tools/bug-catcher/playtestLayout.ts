/** Keep the playtest panel above the bottom timeline / time-zoom stack. */
export const PLAYTEST_TIMELINE_SAFE_PX = 260;

/** Extra bottom reserve so walk HUD does not cover time controls during playtests. */
export const PLAYTEST_TIME_CONTROLS_RESERVE = '248px';

export const GUIDANCE_TIPS = [
  'Click anywhere or press a key to skip the opening.',
  'Mouse wheel or [ ] keys — zoom from universe down to human scale.',
  'Bottom timeline bar — drag the blue track to scrub history (left = past, right = now).',
  'Time zoom — slider under the timeline (labeled “Time zoom”); drag right to narrow the window.',
  'Shift + wheel or Shift + [ ] — finer timeline scrubbing.',
  'Zoom to human at present to walk (WASD).',
  'During initiation, follow the golden ring to the sacred olive tree.',
  'E to interact, Q (hold) to practice near stones.',
  'Journal (top-right) tracks discoveries.',
  'No wrong way to explore — note confusion or delight anytime.',
] as const;

export const PLAYTEST_LAYOUT_CSS = `
.bug-catcher-playtest-layout.app,
.bug-catcher-playtest-layout .app {
  --time-controls-reserve: ${PLAYTEST_TIME_CONTROLS_RESERVE};
}

.bug-catcher-playtest-layout .time-controls {
  z-index: 2147483640;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.35);
}

.bug-catcher-playtest-layout .walk-context-hud,
.bug-catcher-playtest-layout .walk-approach-prompt {
  bottom: calc(var(--time-controls-reserve) + 16px);
}

.bug-catcher-playtest-layout .scrubber-track-outer,
.bug-catcher-playtest-layout .scrubber-track {
  overflow: visible;
}

.bug-catcher-playtest-layout .scrubber-track::before {
  outline: 1px solid rgba(106, 140, 255, 0.45);
  background: rgba(40, 55, 85, 0.85);
}

.bug-catcher-playtest-layout .scrubber-thumb {
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
  border: 3px solid #ffffff;
  box-shadow:
    0 0 0 1px rgba(106, 140, 255, 0.8),
    0 0 16px rgba(106, 140, 255, 0.95);
  z-index: 2;
}

.bug-catcher-playtest-layout .temporal-zoom-label {
  border-color: rgba(106, 140, 255, 0.65);
  box-shadow: 0 0 12px rgba(106, 140, 255, 0.2);
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
