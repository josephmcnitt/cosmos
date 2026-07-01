export interface GeoAnchor {
  lat: number;
  lng: number;
  label: string;
}

export type PolityKind = 'culture' | 'polity' | 'empire' | 'state';

export interface PolitySnapshot {
  id: string;
  polityId: string;
  simTimeSeconds: number;
  /** GeoJSON-like rings in [lng, lat] — low vertex count */
  rings: [number, number][][];
  displayName: string;
  kind: PolityKind;
  color: string;
  linkedEventIds?: string[];
}

export interface SiteAnchor {
  id: string;
  geo: GeoAnchor;
  simTimeStart: number;
  simTimeEnd: number;
  ageId?: string;
  linkedEventIds?: string[];
}

export interface PolityPack {
  id: string;
  label: string;
  snapshots: PolitySnapshot[];
  sites: SiteAnchor[];
}

/** Resolved polity at a moment — rings may be interpolated. */
export interface ResolvedPolity {
  polityId: string;
  displayName: string;
  kind: PolityKind;
  color: string;
  rings: [number, number][][];
  linkedEventIds?: string[];
}
