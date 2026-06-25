import { embodimentApproachWeight } from '../core/embodiment';
import { useObserverStore } from '../core/ObserverState';
import { isInHumanEra } from '../core/spatialTimeCoupling';

export function WalkApproachPrompt() {
  const mode = useObserverStore((s) => s.mode);
  const spatialExponent = useObserverStore((s) => s.spatialExponent);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const goToHumanEra = useObserverStore((s) => s.goToHumanEra);

  if (mode !== 'cosmic') return null;

  const weight = embodimentApproachWeight(spatialExponent);
  if (weight <= 0.05) return null;

  const inHumanEra = isInHumanEra(simTimeSeconds);
  const readyToWalk = weight >= 0.98 && inHumanEra;

  return (
    <div className="walk-approach-prompt ui-panel" data-testid="walk-approach-prompt">
      {readyToWalk ? (
        <span>Ground ready — entering walk mode…</span>
      ) : weight >= 0.98 && !inHumanEra ? (
        <>
          <span>Ground assembled — jump to present to walk</span>
          <button type="button" className="walk-approach-btn" onClick={goToHumanEra}>
            Jump to present →
          </button>
        </>
      ) : (
        <span>Zoom in — the walkable world assembles below</span>
      )}
    </div>
  );
}
