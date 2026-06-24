import { useHistoryStore } from '../core/HistoryState';
import type { HistoryTrack } from '../core/HistoryState';

const OPTIONS: Array<{ id: HistoryTrack; label: string }> = [
  { id: 'material', label: 'Material' },
  { id: 'spiritual', label: 'Spiritual' },
];

export function HistoryTrackToggle() {
  const historyTrack = useHistoryStore((s) => s.historyTrack);
  const setHistoryTrack = useHistoryStore((s) => s.setHistoryTrack);

  return (
    <div className="history-track-toggle" role="tablist" aria-label="History track">
      {OPTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={historyTrack === id}
          className={`history-track-btn history-track-btn--${id}${historyTrack === id ? ' active' : ''}`}
          onClick={() => setHistoryTrack(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
