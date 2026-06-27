import type { PanelConfig } from './types';

/** In-browser panel injected by Playwright (runs in the app page context). */
export function buildPanelScript(config: PanelConfig): string {
  const configJson = JSON.stringify(config);
  return `
(() => {
  if (window.__bugCatcherInstalled) return;
  window.__bugCatcherInstalled = true;

  const config = ${configJson};
  const isGuidance = config.mode === 'guidance';

  const panel = document.createElement('div');
  panel.id = 'bug-catcher-panel';
  panel.className = isGuidance ? 'guidance-mode' : 'qa-mode';
  panel.innerHTML = isGuidance ? \`
    <div id="bug-catcher-header">
      <span id="bug-catcher-title">Playtest notes</span>
      <button type="button" id="bug-catcher-minimize" title="Minimize">−</button>
    </div>
    <div id="bug-catcher-body">
      <p class="bug-catcher-intro">Explore freely. Save a note whenever something stands out — bugs, confusion, ideas, or things you enjoyed.</p>
      <details class="bug-catcher-tips" open>
        <summary>Quick guide</summary>
        <ul id="bug-catcher-tips-list"></ul>
      </details>
      <label class="bug-catcher-label" for="bug-catcher-kind">This note is about</label>
      <select id="bug-catcher-kind">
        <option value="general">General impression</option>
        <option value="confused">I was confused</option>
        <option value="bug">Something broke</option>
        <option value="suggestion">I have an idea</option>
        <option value="liked">I liked this</option>
      </select>
      <textarea id="bug-catcher-note" placeholder="What happened? What did you expect? (Ctrl+Enter to save)"></textarea>
      <div id="bug-catcher-actions">
        <button type="button" id="bug-catcher-log">Save note</button>
        <button type="button" id="bug-catcher-clear">Clear</button>
        <button type="button" id="bug-catcher-end">Finish session</button>
      </div>
      <div id="bug-catcher-wrapup" class="hidden">
        <label class="bug-catcher-label" for="bug-catcher-wrapup-text">Overall thoughts? (optional)</label>
        <textarea id="bug-catcher-wrapup-text" placeholder="What was the experience like start to finish?"></textarea>
        <div id="bug-catcher-wrapup-actions">
          <button type="button" id="bug-catcher-wrapup-skip">Skip</button>
          <button type="button" id="bug-catcher-wrapup-done">Done</button>
        </div>
      </div>
      <div id="bug-catcher-status">0 notes saved</div>
    </div>
  \` : \`
    <div id="bug-catcher-header">
      <span id="bug-catcher-title">Bug Catcher</span>
      <button type="button" id="bug-catcher-minimize" title="Minimize">−</button>
    </div>
    <div id="bug-catcher-body">
      <textarea id="bug-catcher-note" placeholder="Describe the issue… (Ctrl+Enter to log)"></textarea>
      <div id="bug-catcher-actions">
        <button type="button" id="bug-catcher-log">Log issue</button>
        <button type="button" id="bug-catcher-clear">Clear</button>
        <button type="button" id="bug-catcher-end">End session</button>
      </div>
      <div id="bug-catcher-status">Watching · 0 issues</div>
    </div>
  \`;

  const style = document.createElement('style');
  style.textContent = \`
    #bug-catcher-panel {
      position: fixed;
      top: 72px;
      right: 16px;
      width: 340px;
      z-index: 2147483646;
      font: 13px/1.45 system-ui, -apple-system, Segoe UI, sans-serif;
      color: #f2f2f2;
      background: rgba(12, 14, 20, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 10px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
      backdrop-filter: none;
      user-select: none;
    }
    #bug-catcher-panel.guidance-mode { border-color: rgba(140, 190, 160, 0.35); }
    #bug-catcher-panel.minimized #bug-catcher-body { display: none; }
    #bug-catcher-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 10px;
      cursor: move;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);
      border-radius: 10px 10px 0 0;
    }
    #bug-catcher-title { font-weight: 600; letter-spacing: 0.02em; }
    #bug-catcher-minimize {
      border: none;
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      cursor: pointer;
    }
    #bug-catcher-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    .bug-catcher-intro { margin: 0; font-size: 12px; opacity: 0.88; line-height: 1.4; user-select: text; }
    .bug-catcher-tips {
      font-size: 11px;
      opacity: 0.9;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 6px 8px;
      background: rgba(120, 180, 140, 0.08);
    }
    .bug-catcher-tips summary { cursor: pointer; font-weight: 600; }
    .bug-catcher-tips ul { margin: 6px 0 0; padding-left: 16px; }
    .bug-catcher-tips li { margin-bottom: 4px; user-select: text; }
    .bug-catcher-label { font-size: 11px; opacity: 0.75; }
    #bug-catcher-kind {
      width: 100%;
      box-sizing: border-box;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(0, 0, 0, 0.35);
      color: inherit;
      padding: 6px 8px;
      font: inherit;
    }
    #bug-catcher-note, #bug-catcher-wrapup-text {
      width: 100%;
      min-height: 72px;
      resize: vertical;
      box-sizing: border-box;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(0, 0, 0, 0.35);
      color: inherit;
      padding: 8px;
      font: inherit;
      user-select: text;
    }
    #bug-catcher-actions, #bug-catcher-wrapup-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    #bug-catcher-actions button, #bug-catcher-wrapup-actions button {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      font: inherit;
    }
    #bug-catcher-log { background: rgba(88, 130, 255, 0.35); border-color: rgba(120, 160, 255, 0.5); }
    #bug-catcher-panel.guidance-mode #bug-catcher-log {
      background: rgba(100, 170, 130, 0.35);
      border-color: rgba(130, 200, 150, 0.5);
    }
    #bug-catcher-end { margin-left: auto; background: rgba(255, 90, 90, 0.22); }
    #bug-catcher-wrapup-done { background: rgba(100, 170, 130, 0.35); }
    #bug-catcher-status {
      font-size: 11px;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hidden { display: none !important; }
  \`;

  const GUIDANCE_TIPS = [
    'Click anywhere or press a key to skip the opening.',
    'Mouse wheel — zoom from universe down to human scale.',
    'Bottom timeline — scrub history (left = distant past, right = now).',
    'Shift + wheel — finer timeline scrubbing.',
    'Zoom to human at present to walk (WASD).',
    'E to interact, Q (hold) to practice near stones.',
    'Journal (top-right) tracks discoveries.',
    'No wrong way to explore — note confusion or delight anytime.',
  ];

  function mount() {
    if (document.getElementById('bug-catcher-panel')) return;
    document.documentElement.appendChild(style);
    document.documentElement.appendChild(panel);
    if (isGuidance) {
      const tipsList = panel.querySelector('#bug-catcher-tips-list');
      for (const tip of GUIDANCE_TIPS) {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
      }
    }
    wirePanel();
    wireActivity();
  }

  function wirePanel() {
    const header = panel.querySelector('#bug-catcher-header');
    const note = panel.querySelector('#bug-catcher-note');
    const status = panel.querySelector('#bug-catcher-status');
    const logBtn = panel.querySelector('#bug-catcher-log');
    const clearBtn = panel.querySelector('#bug-catcher-clear');
    const endBtn = panel.querySelector('#bug-catcher-end');
    const minBtn = panel.querySelector('#bug-catcher-minimize');
    const kindSelect = panel.querySelector('#bug-catcher-kind');
    const wrapUpBlock = panel.querySelector('#bug-catcher-wrapup');
    const wrapUpText = panel.querySelector('#bug-catcher-wrapup-text');
    const wrapUpSkip = panel.querySelector('#bug-catcher-wrapup-skip');
    const wrapUpDone = panel.querySelector('#bug-catcher-wrapup-done');
    const actions = panel.querySelector('#bug-catcher-actions');
    let issueCount = 0;

    window.__bugCatcherSetStatus = (text) => {
      status.textContent = text;
    };
    window.__bugCatcherIssueLogged = () => {
      issueCount += 1;
      status.textContent = isGuidance
        ? issueCount + ' note' + (issueCount === 1 ? '' : 's') + ' saved'
        : 'Saved issue #' + issueCount + ' · watching…';
      note.value = '';
      if (kindSelect) kindSelect.value = 'general';
    };

    async function submitIssue() {
      const text = note.value.trim();
      if (!text) {
        status.textContent = isGuidance ? 'Write a note before saving' : 'Type a note before logging';
        return;
      }
      logBtn.disabled = true;
      status.textContent = 'Capturing…';
      try {
        const payload = isGuidance
          ? { note: text, feedbackKind: kindSelect?.value || 'general' }
          : text;
        await window.__bugCatcherLogIssue(payload);
      } finally {
        logBtn.disabled = false;
      }
    }

    function finishSession(wrapUp) {
      window.__bugCatcherEndSession?.(wrapUp || undefined);
    }

    logBtn.addEventListener('click', submitIssue);
    clearBtn.addEventListener('click', () => { note.value = ''; note.focus(); });
    endBtn.addEventListener('click', () => {
      if (isGuidance && wrapUpBlock) {
        actions.classList.add('hidden');
        note.closest('#bug-catcher-body')?.querySelector('.bug-catcher-intro')?.classList.add('hidden');
        note.classList.add('hidden');
        kindSelect?.closest('.bug-catcher-label')?.classList.add('hidden');
        kindSelect?.classList.add('hidden');
        panel.querySelector('.bug-catcher-tips')?.classList.add('hidden');
        wrapUpBlock.classList.remove('hidden');
        status.textContent = 'Optional wrap-up — then Done';
        wrapUpText?.focus();
        return;
      }
      finishSession();
    });
    if (wrapUpSkip) wrapUpSkip.addEventListener('click', () => finishSession());
    if (wrapUpDone) wrapUpDone.addEventListener('click', () => finishSession(wrapUpText?.value?.trim() || ''));
    minBtn.addEventListener('click', () => panel.classList.toggle('minimized'));

    note.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitIssue();
      }
    });

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    header.addEventListener('mousedown', (e) => {
      if (e.target === minBtn) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panel.style.left = Math.max(8, e.clientX - offsetX) + 'px';
      panel.style.top = Math.max(8, e.clientY - offsetY) + 'px';
      panel.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    window.__bugCatcherSetStatus?.(
      isGuidance ? '0 notes saved · explore and jot thoughts' : 'Watching · 0 issues',
    );
  }

  function wireActivity() {
    const report = (kind, detail) => {
      window.__bugCatcherActivity?.({ kind, detail, url: location.href, t: Date.now() });
    };
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof Element && t.closest('#bug-catcher-panel')) return;
      const label = t instanceof Element
        ? (t.getAttribute('data-testid') || t.getAttribute('aria-label') || t.tagName.toLowerCase())
        : 'unknown';
      report('click', label);
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) return;
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      report('keydown', e.key);
    }, true);
    window.addEventListener('hashchange', () => report('navigate', 'hash:' + location.hash));
    window.addEventListener('popstate', () => report('navigate', 'popstate:' + location.pathname));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
`;
}

/** @deprecated Use buildPanelScript({ mode: 'qa' }) */
export const BUG_CATCHER_PANEL_SCRIPT = buildPanelScript({ mode: 'qa' });
