import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { EARTH_SITE_COORDS } from '../../data/earth/siteCoordinates';
import { latLngDistanceDeg, latLngToSphereUnit, raySphereHit, sphereUnitToLatLng } from './geo';

describe('geo', () => {
  it('round-trips lat/lng through unit sphere', () => {
    const cases = [
      { lat: 0, lng: 0 },
      { lat: 31.2, lng: 29.9 },
      { lat: 37.98, lng: 23.73 },
      { lat: -33.9, lng: 18.4 },
    ];
    for (const { lat, lng } of cases) {
      const v = latLngToSphereUnit(lat, lng);
      expect(v.length()).toBeCloseTo(1, 5);
      const back = sphereUnitToLatLng(v);
      expect(back.lat).toBeCloseTo(lat, 1);
      expect(back.lng).toBeCloseTo(lng, 1);
    }
  });

  it('raySphereHit returns surface point', () => {
    const origin = new Vector3(0, 0, 30);
    const dir = new Vector3(0, 0, -1);
    const hit = raySphereHit(origin, dir, 5);
    expect(hit).not.toBeNull();
    expect(hit!.length()).toBeCloseTo(5, 4);
  });

  it('latLngDistanceDeg is zero for same point', () => {
    expect(latLngDistanceDeg(31.2, 29.9, 31.2, 29.9)).toBeCloseTo(0, 5);
  });

  it('playable sites have expected geographic ordering', () => {
    const { athens, alexandria, rome } = EARTH_SITE_COORDS;
    expect(athens.lat).toBeGreaterThan(alexandria.lat);
    expect(rome.lat).toBeGreaterThan(athens.lat);
    expect(rome.lng).toBeLessThan(athens.lng);
    expect(alexandria.lng).toBeGreaterThan(athens.lng);
    expect(latLngDistanceDeg(athens.lat, athens.lng, alexandria.lat, alexandria.lng)).toBeGreaterThan(
      4,
    );
    expect(latLngDistanceDeg(athens.lat, athens.lng, rome.lat, rome.lng)).toBeGreaterThan(8);
  });
});
