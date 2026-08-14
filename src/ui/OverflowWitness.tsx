import { useEffect, useMemo, useRef, useState } from 'react';
import {
  isOverflowArmed,
  isOverflowWitnessActive,
  OVERFLOW_WITNESSED_FLAG,
  shouldMarkOverflowWitnessed,
} from '../core/overflowWitness';
import { useIntroStore } from '../core/IntroState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

/**
 * The Via Resonantiae capstone: after Liber VI, scrubbing back to the Big
 * Bang witnesses the Overflow — records the flag (completing the final
 * progression node) and shows the closing words while the burst replays.
 */
export function OverflowWitness() {
  const introComplete = useIntroStore((s) => s.phase === 'complete');
  const mode = useObserverStore((s) => s.mode);
  const simTimeSeconds = useObserverStore((s) => s.simTimeSeconds);
  const pathFlags = useWorldStore((s) => s.pathFlags);
  const setPathFlag = useWorldStore((s) => s.setPathFlag);

  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);

  useEffect(() => {
    if (!armedRef.current && isOverflowArmed(simTimeSeconds, introComplete)) {
      armedRef.current = true;
      setArmed(true);
    }
  }, [simTimeSeconds, introComplete]);

  const active = useMemo(
    () => isOverflowWitnessActive(simTimeSeconds, mode, introComplete, pathFlags, armed),
    [simTimeSeconds, mode, introComplete, pathFlags, armed],
  );

  useEffect(() => {
    if (shouldMarkOverflowWitnessed(simTimeSeconds, mode, introComplete, pathFlags, armed)) {
      setPathFlag(OVERFLOW_WITNESSED_FLAG, true);
    }
  }, [simTimeSeconds, mode, introComplete, pathFlags, armed, setPathFlag]);

  if (!introComplete || mode !== 'cosmic') return null;

  return (
    <>
      <span
        data-testid="overflow-witness-active"
        data-active={active ? 'true' : 'false'}
        aria-hidden
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      {active && (
        <div className="overflow-witness ui-panel" data-testid="overflow-witness-banner">
          <div className="overflow-witness-title">The Overflow</div>
          <div className="overflow-witness-body">
            In the beginning there was only Being. It united until it could not remain sealed —
            and Becoming was born. You have walked the years back to the first light and
            witnessed what the tongues call the Bang.
          </div>
          <div className="overflow-witness-seal">Amen Resonantiae</div>
        </div>
      )}
    </>
  );
}
