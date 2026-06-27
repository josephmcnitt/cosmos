import { getInitiationById, getStep } from '../data/initiations/index';
import { isChooseCorrect } from '../core/initiation/runInitiation';
import { walkToHint } from '../core/initiation/walkToHint';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

export function InitiationPanel() {
  const activeInitiation = useWorldStore((s) => s.activeInitiation);
  const advanceInitiationStep = useWorldStore((s) => s.advanceInitiationStep);
  const setInitiationChoice = useWorldStore((s) => s.setInitiationChoice);
  const cancelInitiation = useWorldStore((s) => s.cancelInitiation);
  const avatarX = useObserverStore((s) => s.avatarPosition.x);
  const avatarZ = useObserverStore((s) => s.avatarPosition.z);
  const avatarYaw = useObserverStore((s) => s.avatarYaw);

  if (!activeInitiation) return null;

  const def = getInitiationById(activeInitiation.initiationId);
  if (!def) return null;

  const step = getStep(def, activeInitiation.stepIndex);
  if (!step) return null;

  const speaker = step.type === 'dialogue' ? step.speaker : def.title;

  return (
    <div className="initiation-panel ui-panel" data-testid="initiation-panel">
      <div className="initiation-header">
        <strong>{speaker ?? def.title}</strong>
        <button type="button" className="initiation-close" onClick={cancelInitiation}>
          Leave
        </button>
      </div>

      {step.type === 'dialogue' && (
        <>
          <p>{step.text}</p>
          <button type="button" data-testid="initiation-continue" onClick={() => advanceInitiationStep()}>
            Continue
          </button>
        </>
      )}

      {step.type === 'choose' && (
        <>
          <p>{step.text}</p>
          <div className="initiation-choices">
            {step.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`initiation-choice-${opt.id}`}
                className={
                  activeInitiation.choiceId === opt.id ? 'initiation-choice selected' : 'initiation-choice'
                }
                onClick={() => setInitiationChoice(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {activeInitiation.choiceId &&
            step.type === 'choose' &&
            !isChooseCorrect(step, activeInitiation.choiceId) && (
              <p className="initiation-hint">That is not the way. Choose again.</p>
            )}
        </>
      )}

      {(step.type === 'walk-to' ||
        step.type === 'hold-still' ||
        step.type === 'face-direction' ||
        step.type === 'silence') && (
        <>
          <p data-testid="initiation-step-instruction">{step.text}</p>
          {step.type === 'walk-to' && (() => {
            const hint = walkToHint(
              avatarX,
              avatarZ,
              avatarYaw,
              step.targetX,
              step.targetZ,
              step.radius ?? 3,
            );
            return (
              <p className="initiation-walk-hint" data-testid="initiation-walk-hint">
                {hint.atTarget
                  ? 'You have arrived — stand in the golden ring.'
                  : `Sacred olive tree · ${Math.round(hint.distanceM)}m ${hint.bearingLabel}`}
              </p>
            );
          })()}
        </>
      )}
    </div>
  );
}
