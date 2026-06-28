import { useState } from 'react';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';
import { worldRegistry } from '../core/world/WorldRegistry';
import { getEventById } from '../data/history/index';
import { getProgressNodeById } from '../data/progression/index';
import { getInitiationForWorld } from '../data/initiations/index';

function ageTitle(id: string): string {
  return worldRegistry.getAge(id)?.title ?? id;
}

function eventTitle(id: string): string {
  return getEventById(id)?.title ?? id;
}

export function JournalPanel() {
  const [open, setOpen] = useState(false);
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const journal = useWorldStore((s) => s.journal);
  const discoveredEventIds = useWorldStore((s) => s.discoveredEventIds);
  const completedPuzzleIds = useWorldStore((s) => s.completedPuzzleIds);
  const visitedWorldIds = useWorldStore((s) => s.visitedWorldIds);
  const initiationStatus = useWorldStore((s) => s.initiationStatus);
  const completedProgressNodeIds = useWorldStore((s) => s.completedProgressNodeIds);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const isAgeInitiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));

  if (isFlying) return null;

  const embodied = mode === 'embodied';
  const cosmic = !embodied;
  const completedInitiations = Object.entries(initiationStatus).filter(([, s]) => s === 'completed');
  const hasJournalContent =
    journal.length > 0 ||
    discoveredEventIds.length > 0 ||
    completedProgressNodeIds.length > 0 ||
    completedPuzzleIds.length > 0;

  if (embodied && !isAgeInitiated && !hasJournalContent) return null;

  if (!open) {
    return (
      <button
        type="button"
        className={`journal-toggle ui-panel${cosmic ? ' journal-toggle--cosmic' : ''}${embodied ? ' journal-toggle--embodied' : ''}`}
        data-testid="journal-toggle"
        onClick={() => setOpen(true)}
      >
        Journal
      </button>
    );
  }

  const showDetails = cosmic || journal.length === 0;

  return (
    <div
      className={`journal-panel ui-panel${cosmic ? ' journal-panel--cosmic' : ''}${embodied ? ' journal-panel--embodied' : ''}`}
      data-testid="journal-panel"
    >
      <div className="journal-header">
        <h3>Journal</h3>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      {journal.length > 0 && (
        <section>
          {embodied ? null : <h4>Entries</h4>}
          {journal.map((e) => (
            <article key={e.id} className="journal-entry">
              <strong>{e.title}</strong>
              <p>{e.body}</p>
            </article>
          ))}
        </section>
      )}

      {showDetails && completedInitiations.length > 0 && (
        <section>
          <h4>Initiations</h4>
          <ul>
            {completedInitiations.map(([id]) => (
              <li key={id}>{getInitiationForWorld(id)?.title ?? ageTitle(id)}</li>
            ))}
          </ul>
        </section>
      )}

      {showDetails && completedProgressNodeIds.length > 0 && (
        <section>
          <h4>Path milestones</h4>
          <ul>
            {completedProgressNodeIds.map((id) => (
              <li key={id}>{getProgressNodeById(id)?.title ?? id}</li>
            ))}
          </ul>
        </section>
      )}

      {showDetails && discoveredEventIds.length > 0 && (
        <section>
          <h4>Discovered ({discoveredEventIds.length})</h4>
          <ul>
            {discoveredEventIds.map((id) => (
              <li key={id}>{eventTitle(id)}</li>
            ))}
          </ul>
        </section>
      )}

      {showDetails && visitedWorldIds.length > 0 && (
        <section>
          <h4>Ages visited</h4>
          <ul>
            {visitedWorldIds.map((id) => (
              <li key={id}>{ageTitle(id)}</li>
            ))}
          </ul>
        </section>
      )}

      {showDetails && completedPuzzleIds.length > 0 && (
        <section>
          <h4>Puzzles solved</h4>
          <ul>
            {completedPuzzleIds.map((id) => (
              <li key={id}>{id.replace(/^puzzle-/, '').replace(/-/g, ' ')}</li>
            ))}
          </ul>
        </section>
      )}

      {journal.length === 0 && (
        <p className="journal-empty">Nothing written yet — discoveries and path choices appear here.</p>
      )}
    </div>
  );
}
