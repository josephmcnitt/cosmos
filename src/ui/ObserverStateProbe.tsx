import { isEarthGlobeEnabled } from '../core/earth/feature';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

const quantize = (v: number) => Math.round(v * 4) / 4;

/** Hidden DOM probe for E2E — reflects live observer mode without window store hooks. */
export function ObserverStateProbe() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  // Quantized so walking only re-renders the probe every quarter unit / ~14°.
  const avatarX = useObserverStore((s) => quantize(s.avatarPosition.x));
  const avatarZ = useObserverStore((s) => quantize(s.avatarPosition.z));
  const avatarYaw = useObserverStore((s) => quantize(s.avatarYaw));

  if (!introComplete) return null;

  return (
    <div
      data-testid="observer-state-probe"
      data-mode={mode}
      data-spatial-exponent={spatialExponent.toFixed(2)}
      data-earth-enabled={isEarthGlobeEnabled() ? '1' : '0'}
      data-avatar-x={avatarX.toFixed(2)}
      data-avatar-z={avatarZ.toFixed(2)}
      data-avatar-yaw={avatarYaw.toFixed(2)}
      hidden
      aria-hidden
    />
  );
}
