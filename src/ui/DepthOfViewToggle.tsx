import { useHistoryStore } from '../core/HistoryState';
import type { DepthOfView } from '../data/history/types';
import { getHiddenEsotericCount } from '../data/history/index';

const OPTIONS: Array<{ id: DepthOfView; label: string }> = [
  { id: 'exoteric', label: 'Exoteric' },
  { id: 'full', label: 'Full Depth' },
];

export function DepthOfViewToggle() {
  const depthOfView = useHistoryStore((s) => s.depthOfView);
  const setDepthOfView = useHistoryStore((s) => s.setDepthOfView);
  const hiddenCount = getHiddenEsotericCount(depthOfView);

  return (
    <div className="depth-toggle">
      <span className="depth-toggle-label">Depth</span>
      <div className="depth-toggle-options">
        {OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-testid={`depth-toggle-${id}`}
            className={`depth-toggle-btn${depthOfView === id ? ' active' : ''}${id === 'full' ? ' depth-toggle-btn--full' : ''}`}
            onClick={() => setDepthOfView(id)}
            title={
              id === 'full'
                ? hiddenCount > 0
                  ? `Reveal ${hiddenCount} esoteric events — required for walk stones`
                  : 'Full Depth reveals esoteric events and walk stones'
                : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
