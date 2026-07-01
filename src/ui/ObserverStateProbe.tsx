import { isEarthGlobeEnabled } from '../core/earth/feature';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';

/** Hidden DOM probe for E2E — reflects live observer mode without window store hooks. */
export function ObserverStateProbe() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);

  if (!introComplete) return null;

  return (
    <div
      data-testid="observer-state-probe"
      data-mode={mode}
      data-spatial-exponent={spatialExponent.toFixed(2)}
      data-earth-enabled={isEarthGlobeEnabled() ? '1' : '0'}
      hidden
      aria-hidden
    />
  );
}
