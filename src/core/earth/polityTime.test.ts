import { describe, expect, it } from 'vitest';
import { ceYear, yearsAgo } from '../../data/history/time';
import { MEDITERRANEAN_PACK } from '../../data/earth/mediterranean300bce';
import { getSiteAnchorsAtTime, resolvePolitiesAtTime } from './polityTime';

describe('polityTime', () => {
  it('resolves four polities at 300 BCE', () => {
    const polities = resolvePolitiesAtTime(MEDITERRANEAN_PACK.snapshots, ceYear(-300));
    expect(polities).toHaveLength(4);
    expect(polities.map((p) => p.polityId).sort()).toEqual([
      'macedon-greece',
      'ptolemaic-egypt',
      'rome',
      'seleucid',
    ]);
  });

  it('resolves four polities at present with different display names', () => {
    const polities = resolvePolitiesAtTime(MEDITERRANEAN_PACK.snapshots, yearsAgo(0));
    const egypt = polities.find((p) => p.polityId === 'ptolemaic-egypt');
    expect(egypt?.displayName).toBe('Egypt');
  });

  it('interpolates ring vertices between bracket snapshots', () => {
    const mid = (ceYear(-300) + yearsAgo(0)) / 2;
    const polities = resolvePolitiesAtTime(MEDITERRANEAN_PACK.snapshots, mid);
    const egypt = polities.find((p) => p.polityId === 'ptolemaic-egypt');
    expect(egypt?.rings[0]?.length).toBeGreaterThan(0);
    const at300 = resolvePolitiesAtTime(MEDITERRANEAN_PACK.snapshots, ceYear(-300));
    const e300 = at300.find((p) => p.polityId === 'ptolemaic-egypt')!;
    const ringMid = egypt!.rings[0]![0]!;
    const ring300 = e300.rings[0]![0]!;
    expect(ringMid[0]).not.toBe(ring300[0]);
  });

  it('filters site anchors by time window', () => {
    const atPresent = getSiteAnchorsAtTime(MEDITERRANEAN_PACK.sites, yearsAgo(0));
    expect(atPresent.some((s) => s.id === 'athens')).toBe(true);
    expect(atPresent.some((s) => s.id === 'alexandria')).toBe(false);

    const at300bce = getSiteAnchorsAtTime(MEDITERRANEAN_PACK.sites, ceYear(-300));
    expect(at300bce.some((s) => s.id === 'alexandria')).toBe(true);
    expect(at300bce.some((s) => s.id === 'athens')).toBe(true);
  });
});
