import { useHistoryStore } from '../core/HistoryState';
import { useOverlayPanelStore } from '../core/OverlayPanelState';
import { useObserverStore } from '../core/ObserverState';
import { buildProgressInputFromWorld } from '../core/progression/buildProgressInput';
import { getPathNextStep, isRelevantPathNode } from '../core/progression/pathNextStep';
import { useWorldStore } from '../core/world/WorldState';
import { clearSave } from '../core/save/saveGame';
import { worldRegistry } from '../core/world/WorldRegistry';
import { getEventById } from '../data/history/index';
import { ALL_PROGRESS_NODES, getProgressNodeById } from '../data/progression/index';
import { getInitiationForWorld } from '../data/initiations/index';

function ageTitle(id: string): string {
  return worldRegistry.getAge(id)?.title ?? id;
}

function eventTitle(id: string): string {
  return getEventById(id)?.title ?? id;
}

function resolveActiveRouteLabel(
  activePathId: string | undefined,
  pathFlags: Record<string, string | number | boolean>,
): string | null {
  if (activePathId) return activePathId.replace(/-/g, ' ');
  const grove = pathFlags['grove-hermetic-path'];
  if (grove === 'rational') return 'hermetic rational';
  if (grove === 'experiential') return 'hermetic experiential';
  const alex = pathFlags['alexandria-purification-path'];
  if (alex === 'correspondence') return 'alexandria correspondence';
  if (alex === 'silence') return 'alexandria silence';
  return null;
}

export function JournalPanel() {
  const expandedPanel = useOverlayPanelStore((s) => s.expandedPanel);
  const openPanel = useOverlayPanelStore((s) => s.openPanel);
  const closePanel = useOverlayPanelStore((s) => s.closePanel);
  const selectEvent = useHistoryStore((s) => s.selectEvent);
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const journal = useWorldStore((s) => s.journal);
  const discoveredEventIds = useWorldStore((s) => s.discoveredEventIds);
  const completedPuzzleIds = useWorldStore((s) => s.completedPuzzleIds);
  const visitedWorldIds = useWorldStore((s) => s.visitedWorldIds);
  const initiationStatus = useWorldStore((s) => s.initiationStatus);
  const completedProgressNodeIds = useWorldStore((s) => s.completedProgressNodeIds);
  const activePathId = useWorldStore((s) => s.activePathId);
  const pathFlags = useWorldStore((s) => s.pathFlags);
  const choiceHistory = useWorldStore((s) => s.choiceHistory);
  const resonance = useWorldStore((s) => s.resonance);
  const sessionsCompleted = useWorldStore((s) => s.sessionsCompleted);
  const currentWorldId = useWorldStore((s) => s.currentWorldId);
  const isAgeInitiated = useWorldStore((s) => s.isAgeInitiated(currentWorldId));

  if (isFlying) return null;

  const embodied = mode === 'embodied';
  const cosmic = !embodied;
  const completedInitiations = Object.entries(initiationStatus).filter(([, s]) => s === 'completed');
  const progressInput = buildProgressInputFromWorld({
    completedProgressNodeIds,
    choiceHistory,
    pathFlags,
    initiationStatus,
    completedPuzzleIds,
    visitedWorldIds,
    resonance,
    sessionsCompleted,
  });
  const nextStep = getPathNextStep(progressInput);
  const activeRouteLabel = resolveActiveRouteLabel(activePathId, pathFlags);
  const completedNodes = completedProgressNodeIds
    .map((id) => getProgressNodeById(id))
    .filter(Boolean);
  const completedSet = new Set(completedProgressNodeIds);
  const aheadNodes = ALL_PROGRESS_NODES.filter(
    (n) => !completedSet.has(n.id) && isRelevantPathNode(progressInput, n, completedSet),
  ).slice(0, 8);

  const hasJournalContent =
    journal.length > 0 ||
    discoveredEventIds.length > 0 ||
    completedProgressNodeIds.length > 0 ||
    completedPuzzleIds.length > 0 ||
    nextStep != null;

  if (embodied && !isAgeInitiated && !hasJournalContent) return null;

  const open = expandedPanel === 'journal';

  const handleOpen = () => {
    selectEvent(null);
    openPanel('journal');
  };

  if (!open) {
    return (
      <button
        type="button"
        className={`journal-toggle ui-panel${cosmic ? ' journal-toggle--cosmic' : ''}${embodied ? ' journal-toggle--embodied' : ''}`}
        data-testid="journal-toggle"
        onClick={handleOpen}
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
        <button type="button" onClick={closePanel}>
          Close
        </button>
      </div>

      {nextStep && (
        <section className="path-next-step" data-testid="path-next-step">
          <h4>{nextStep.ready ? 'Next step' : 'Ahead'}</h4>
          <p className="path-next-step-title">{nextStep.title}</p>
          {nextStep.detail && <p className="path-next-step-detail">{nextStep.detail}</p>}
        </section>
      )}

      {activeRouteLabel && (
        <p className="path-active" data-testid="path-active-id">
          Active route: {activeRouteLabel}
        </p>
      )}

      <section className="advancement-tree" data-testid="advancement-tree">
        <h4>Advancement</h4>
        <ul className="advancement-tree-list">
          {completedNodes.map((node) => (
            <li
              key={node!.id}
              className="advancement-tree-item advancement-tree-item--done"
              data-testid={`progress-node-${node!.id}-completed`}
            >
              <span className="advancement-tree-mark" aria-hidden>
                ●
              </span>
              {node!.title}
            </li>
          ))}
          {aheadNodes.map((node) => {
            const isNext = nextStep?.nodeId === node.id;
            return (
              <li
                key={node.id}
                className={`advancement-tree-item${isNext ? ' advancement-tree-item--next' : ' advancement-tree-item--ahead'}`}
                data-testid={`progress-node-${node.id}-pending`}
              >
                <span className="advancement-tree-mark" aria-hidden>
                  {isNext ? '◎' : '○'}
                </span>
                {node.title}
              </li>
            );
          })}
        </ul>
      </section>

      {journal.length > 0 && (
        <section>
          <h4>Entries</h4>
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

      <section className="journal-danger-zone">
        <button
          type="button"
          className="journal-start-over"
          data-testid="start-over"
          onClick={() => {
            if (
              !window.confirm(
                'Clear all saved progress and start from the beginning? This cannot be undone.',
              )
            ) {
              return;
            }
            clearSave();
            window.location.reload();
          }}
        >
          Start over
        </button>
      </section>
    </div>
  );
}
