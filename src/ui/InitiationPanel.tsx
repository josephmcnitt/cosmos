import { getInitiationById, getStep } from '../data/initiations/index';
import { isChooseCorrect } from '../core/initiation/runInitiation';
import { useWorldStore } from '../core/world/WorldState';

export function InitiationPanel() {
  const activeInitiation = useWorldStore((s) => s.activeInitiation);
  const advanceInitiationStep = useWorldStore((s) => s.advanceInitiationStep);
  const setInitiationChoice = useWorldStore((s) => s.setInitiationChoice);
  const cancelInitiation = useWorldStore((s) => s.cancelInitiation);

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
        <p data-testid="initiation-step-instruction">{step.text}</p>
      )}
    </div>
  );
}
