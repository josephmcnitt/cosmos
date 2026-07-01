import type { PolitySnapshot, ResolvedPolity, SiteAnchor } from '../../data/earth/types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateRing(
  ringA: [number, number][],
  ringB: [number, number][],
  t: number,
): [number, number][] {
  const len = Math.max(ringA.length, ringB.length);
  const out: [number, number][] = [];
  for (let i = 0; i < len; i++) {
    const a = ringA[i % ringA.length]!;
    const b = ringB[i % ringB.length]!;
    out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
  }
  return out;
}

function bracketSnapshots(
  snapshots: PolitySnapshot[],
  simTimeSeconds: number,
): { before: PolitySnapshot; after: PolitySnapshot; t: number } | null {
  if (snapshots.length === 0) return null;
  const sorted = [...snapshots].sort((a, b) => a.simTimeSeconds - b.simTimeSeconds);
  if (simTimeSeconds <= sorted[0]!.simTimeSeconds) {
    return { before: sorted[0]!, after: sorted[0]!, t: 0 };
  }
  const last = sorted[sorted.length - 1]!;
  if (simTimeSeconds >= last.simTimeSeconds) {
    return { before: last, after: last, t: 0 };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const before = sorted[i]!;
    const after = sorted[i + 1]!;
    if (simTimeSeconds >= before.simTimeSeconds && simTimeSeconds <= after.simTimeSeconds) {
      const span = after.simTimeSeconds - before.simTimeSeconds;
      const t = span > 0 ? (simTimeSeconds - before.simTimeSeconds) / span : 0;
      return { before, after, t };
    }
  }
  return null;
}

/** Group snapshots by polityId and resolve at sim time with ring interpolation. */
export function resolvePolitiesAtTime(
  snapshots: PolitySnapshot[],
  simTimeSeconds: number,
): ResolvedPolity[] {
  const byPolity = new Map<string, PolitySnapshot[]>();
  for (const snap of snapshots) {
    const list = byPolity.get(snap.polityId) ?? [];
    list.push(snap);
    byPolity.set(snap.polityId, list);
  }

  const resolved: ResolvedPolity[] = [];
  for (const [polityId, group] of byPolity) {
    const bracket = bracketSnapshots(group, simTimeSeconds);
    if (!bracket) continue;
    const { before, after, t } = bracket;
    const rings: [number, number][][] = before.rings.map((ring: [number, number][], idx: number) => {
      const other = after.rings[idx] ?? after.rings[0] ?? ring;
      return interpolateRing(ring, other, t);
    });
    resolved.push({
      polityId,
      displayName: t < 0.5 ? before.displayName : after.displayName,
      kind: t < 0.5 ? before.kind : after.kind,
      color: before.color,
      rings,
      linkedEventIds: before.linkedEventIds ?? after.linkedEventIds,
    });
  }
  return resolved;
}

export function getSiteAnchorsAtTime(
  sites: SiteAnchor[],
  simTimeSeconds: number,
): SiteAnchor[] {
  return sites.filter(
    (s) => simTimeSeconds >= s.simTimeStart && simTimeSeconds <= s.simTimeEnd,
  );
}

export function findNearestSite(
  sites: SiteAnchor[],
  lat: number,
  lng: number,
  simTimeSeconds: number,
  maxDeg = 8,
): SiteAnchor | null {
  const active = getSiteAnchorsAtTime(sites, simTimeSeconds);
  let best: SiteAnchor | null = null;
  let bestDist = maxDeg;
  for (const site of active) {
    const dLat = site.geo.lat - lat;
    const dLng = site.geo.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < bestDist) {
      bestDist = dist;
      best = site;
    }
  }
  return best;
}
