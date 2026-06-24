import { useMemo } from 'react';
import { getContemplationLine } from '../data/practice/contemplations';
import { TRADITION_LABELS } from '../data/history/types';
import { usePracticeStore } from '../core/PracticeState';
import { useObserverStore } from '../core/ObserverState';

export function PracticeOverlay() {
  const mode = useObserverStore((s) => s.mode);
  const activePractice = usePracticeStore((s) => s.activePractice);

  const lineIndex = useMemo(
    () => (activePractice ? Math.floor(activePractice.progress * 4) : 0),
    [activePractice?.progress, activePractice?.tradition],
  );

  if (mode !== 'embodied' || !activePractice) return null;

  const line = getContemplationLine(activePractice.tradition, lineIndex);
  const circumference = 2 * Math.PI * 15.5;
  const dash = activePractice.progress * circumference;

  return (
    <div className="practice-overlay">
      <div className="practice-overlay-panel ui-panel">
        <span className={`practice-tradition practice-tradition--${activePractice.tradition}`}>
          {TRADITION_LABELS[activePractice.tradition]}
        </span>
        <p className="practice-line">{line}</p>
        <div className="practice-progress-ring" aria-hidden>
          <svg viewBox="0 0 36 36">
            <circle className="practice-progress-bg" cx="18" cy="18" r="15.5" />
            <circle
              className="practice-progress-fill"
              cx="18"
              cy="18"
              r="15.5"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
        </div>
        <p className="practice-hint">Hold Q the full session · stay off W/S</p>
      </div>
    </div>
  );
}
