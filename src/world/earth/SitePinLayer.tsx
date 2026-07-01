import { useMemo } from 'react';
import { useObserverStore } from '../../core/ObserverState';
import { latLngToSphereUnit } from '../../core/earth/geo';
import { getSiteAnchorsAtTimeForPack } from '../../data/earth';
import { GLOBE_RADIUS } from './EarthGlobe';

const PIN_OFFSET = 1.006;
const PIN_RADIUS = 0.09;

export function SitePinLayer() {
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const geoFocus = useObserverStore((s) => s.geoFocus);
  const setGeoFocus = useObserverStore((s) => s.setGeoFocus);

  const sites = useMemo(
    () => getSiteAnchorsAtTimeForPack(simTimeSeconds),
    [simTimeSeconds],
  );

  return (
    <group>
      {sites.map((site) => {
        const pos = latLngToSphereUnit(site.geo.lat, site.geo.lng).multiplyScalar(
          GLOBE_RADIUS * PIN_OFFSET,
        );
        const selected = geoFocus?.siteAnchorId === site.id;
        return (
          <mesh
            key={site.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              setGeoFocus({
                lat: site.geo.lat,
                lng: site.geo.lng,
                siteAnchorId: site.id,
                ageId: site.ageId,
                label: site.geo.label,
              });
            }}
          >
            <sphereGeometry args={[PIN_RADIUS, 12, 12]} />
            <meshStandardMaterial
              color={selected ? '#e8d5a3' : '#7eb8da'}
              emissive={selected ? '#c9a227' : '#2a6080'}
              emissiveIntensity={selected ? 0.6 : 0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}
