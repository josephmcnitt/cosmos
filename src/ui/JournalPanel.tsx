import { useState } from 'react';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

export function JournalPanel() {
  const [open, setOpen] = useState(false);
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const journal = useWorldStore((s) => s.journal);
  const discoveredEventIds = useWorldStore((s) => s.discoveredEventIds);
  const completedPuzzleIds = useWorldStore((s) => s.completedPuzzleIds);
  const visitedWorldIds = useWorldStore((s) => s.visitedWorldIds);

  if (isFlying) return null;

  const cosmic = mode !== 'embodied';

  if (!open) {
    return (
      <button
        type="button"
        className={`journal-toggle ui-panel${cosmic ? ' journal-toggle--cosmic' : ''}`}
        data-testid="journal-toggle"
        onClick={() => setOpen(true)}
      >
        Journal
      </button>
    );
  }

  return (
    <div
      className={`journal-panel ui-panel${cosmic ? ' journal-panel--cosmic' : ''}`}
      data-testid="journal-panel"
    >
      <div className="journal-header">
        <h3>Journal</h3>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      <section>
        <h4>Discovered ({discoveredEventIds.length})</h4>
        <ul>
          {discoveredEventIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4>Ages visited</h4>
        <ul>
          {visitedWorldIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4>Puzzles solved</h4>
        <ul>
          {completedPuzzleIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4>Entries</h4>
        {journal.map((e) => (
          <article key={e.id}>
            <strong>{e.title}</strong>
            <p>{e.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
