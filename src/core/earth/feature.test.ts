/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { isEarthAutoEnterEnabled, isEarthGlobeEnabled } from './feature';

function setSearch(search: string) {
  window.history.replaceState({}, '', search || '/');
}

afterEach(() => {
  setSearch('');
});

describe('isEarthGlobeEnabled', () => {
  it('is on by default', () => {
    expect(isEarthGlobeEnabled()).toBe(true);
  });

  it('opts out only with ?earth=0', () => {
    setSearch('?earth=0');
    expect(isEarthGlobeEnabled()).toBe(false);
  });

  it('stays on with ?earth=1', () => {
    setSearch('?earth=1');
    expect(isEarthGlobeEnabled()).toBe(true);
  });
});

describe('isEarthAutoEnterEnabled', () => {
  it('follows globe flag', () => {
    setSearch('?earth=0');
    expect(isEarthAutoEnterEnabled()).toBe(false);
  });

  it('is on when globe is on and earthSync unset', () => {
    expect(isEarthAutoEnterEnabled()).toBe(true);
  });

  it('opts out with ?earthSync=0 while globe stays on', () => {
    setSearch('?earthSync=0');
    expect(isEarthGlobeEnabled()).toBe(true);
    expect(isEarthAutoEnterEnabled()).toBe(false);
  });
});
