import { getPuzzleById } from '../data/ages/index';
import { checkGematria } from '../core/puzzles/index';
import { useGematriaStore } from '../core/GematriaState';
import { useWorldStore } from '../core/world/WorldState';

/** Weigh-the-letters panel — opened with R at a gematria stone. */
export function GematriaPanel() {
  const openPuzzleId = useGematriaStore((s) => s.openPuzzleId);
  const feedback = useGematriaStore((s) => s.feedback);
  const solved = useGematriaStore((s) => s.solved);
  const closePuzzle = useGematriaStore((s) => s.closePuzzle);
  const setFeedback = useGematriaStore((s) => s.setFeedback);
  const markSolved = useGematriaStore((s) => s.markSolved);
  const completePuzzle = useWorldStore((s) => s.completePuzzle);
  const isPuzzleCompleted = useWorldStore((s) => s.isPuzzleCompleted);

  if (!openPuzzleId) return null;
  const template = getPuzzleById(openPuzzleId);
  const gematria = template?.gematria;
  if (!gematria) return null;

  const alreadySolved = solved || isPuzzleCompleted(openPuzzleId);

  const handleAnswer = (optionId: string) => {
    if (alreadySolved) return;
    if (checkGematria(openPuzzleId, optionId)) {
      completePuzzle(openPuzzleId);
      markSolved();
    } else {
      setFeedback('The letters do not balance — count again.');
    }
  };

  return (
    <div className="gematria-panel ui-panel" data-testid="gematria-panel">
      <div className="gematria-title">Weigh the letters</div>
      {!alreadySolved ? (
        <>
          <p className="gematria-prompt">{gematria.prompt}</p>
          <div className="gematria-options">
            {gematria.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="gematria-option"
                data-testid={`gematria-option-${option.id}`}
                onClick={() => handleAnswer(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {feedback && (
            <p className="gematria-feedback" data-testid="gematria-feedback">
              {feedback}
            </p>
          )}
        </>
      ) : (
        <p className="gematria-revelation" data-testid="gematria-revelation">
          {gematria.revelation}
        </p>
      )}
      <button type="button" className="gematria-close" data-testid="gematria-close" onClick={closePuzzle}>
        {alreadySolved ? 'Seal the reading' : 'Step away'}
      </button>
    </div>
  );
}
