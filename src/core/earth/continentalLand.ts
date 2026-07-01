import landGeo from '../../data/earth/continentalLand.geojson';
import type { LngLatRing } from './spherePolygon';

export interface LandPolygon {
  id: number;
  ring: LngLatRing;
}

/** Natural Earth 110m land — public domain (naturalearthdata.com). */
export function getContinentalLandPolygons(): LandPolygon[] {
  const polygons: LandPolygon[] = [];
  let id = 0;

  for (const feature of landGeo.features) {
    const { geometry } = feature;
    if (geometry.type === 'Polygon') {
      const outer = geometry.coordinates[0] as LngLatRing;
      if (outer.length >= 4) {
        polygons.push({ id: id++, ring: outer });
      }
      continue;
    }
    if (geometry.type === 'MultiPolygon') {
      for (const poly of geometry.coordinates) {
        const outer = poly[0] as LngLatRing;
        if (outer.length >= 4) {
          polygons.push({ id: id++, ring: outer });
        }
      }
    }
  }

  return polygons;
}
