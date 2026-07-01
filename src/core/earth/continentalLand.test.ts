import { describe, expect, it } from 'vitest';
import { getContinentalLandPolygons } from './continentalLand';
import { buildSpherePolygonGeometry } from './spherePolygon';
import { GLOBE_RADIUS } from '../../world/earth/EarthGlobe';

describe('continentalLand', () => {
  it('loads Natural Earth land polygons', () => {
    const polygons = getContinentalLandPolygons();
    expect(polygons.length).toBeGreaterThan(100);
  });

  it('builds merged land geometry for the globe', () => {
    const polygons = getContinentalLandPolygons();
    const sample = polygons.slice(0, 5);
    for (const { ring } of sample) {
      const geom = buildSpherePolygonGeometry(ring, GLOBE_RADIUS);
      expect(geom?.getAttribute('position')).toBeTruthy();
    }
  });
});
