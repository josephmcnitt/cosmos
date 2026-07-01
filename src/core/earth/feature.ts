const STORAGE_KEY = 'cosmos-earth-globe';

/** Earth globe navigation — on by default; opt out with `?earth=0` only (not sticky localStorage). */
export function isEarthGlobeEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('earth') !== '0';
  } catch {
    return true;
  }
}

/** Auto-enter on zoom — disable with `?earthSync=0` (E2E canvas-click tests). */
export function isEarthAutoEnterEnabled(): boolean {
  if (!isEarthGlobeEnabled()) return false;
  if (typeof window === 'undefined') return true;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('earthSync') !== '0';
  } catch {
    return true;
  }
}

export function enableEarthGlobePersist(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function disableEarthGlobePersist(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, '0');
  } catch {
    /* ignore */
  }
}
