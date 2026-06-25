/** In-browser panel injected by Playwright (runs in the app page context). */
export const BUG_CATCHER_PANEL_SCRIPT = `
(() => {
  if (window.__bugCatcherInstalled) return;
  window.__bugCatcherInstalled = true;

  const panel = document.createElement('div');
  panel.id = 'bug-catcher-panel';
  panel.innerHTML = \`
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
      width: 320px;
      z-index: 2147483646;
      font: 13px/1.4 system-ui, -apple-system, Segoe UI, sans-serif;
      color: #f2f2f2;
      background: rgba(12, 14, 20, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 10px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
      user-select: none;
    }
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
    #bug-catcher-note {
      width: 100%;
      min-height: 88px;
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
    #bug-catcher-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    #bug-catcher-actions button {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      font: inherit;
    }
    #bug-catcher-log { background: rgba(88, 130, 255, 0.35); border-color: rgba(120, 160, 255, 0.5); }
    #bug-catcher-end { margin-left: auto; background: rgba(255, 90, 90, 0.22); }
    #bug-catcher-status {
      font-size: 11px;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  \`;

  function mount() {
    if (document.getElementById('bug-catcher-panel')) return;
    document.documentElement.appendChild(style);
    document.documentElement.appendChild(panel);
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
    let issueCount = 0;

    window.__bugCatcherSetStatus = (text) => {
      status.textContent = text;
    };
    window.__bugCatcherIssueLogged = () => {
      issueCount += 1;
      status.textContent = 'Saved issue #' + issueCount + ' · watching…';
      note.value = '';
    };

    async function submitIssue() {
      const text = note.value.trim();
      if (!text) {
        status.textContent = 'Type a note before logging';
        return;
      }
      logBtn.disabled = true;
      status.textContent = 'Capturing…';
      try {
        await window.__bugCatcherLogIssue(text);
      } finally {
        logBtn.disabled = false;
      }
    }

    logBtn.addEventListener('click', submitIssue);
    clearBtn.addEventListener('click', () => { note.value = ''; note.focus(); });
    endBtn.addEventListener('click', () => window.__bugCatcherEndSession?.());
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
  }

  function wireActivity() {
    const report = (kind, detail) => {
      window.__bugCatcherActivity?.({ kind, detail, url: location.href, t: Date.now() });
    };
    document.addEventListener('click', (e) => {
      const t = e.target;
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
