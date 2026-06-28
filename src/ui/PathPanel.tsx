import { useOverlayPanelStore } from '../core/OverlayPanelState';
import { buildProgressInputFromWorld } from '../core/progression/buildProgressInput';
import { getPathNextStep } from '../core/progression/pathNextStep';
import { ALL_PROGRESS_NODES, getProgressNodeById } from '../data/progression/index';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

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

export function PathPanel() {
  const expandedPanel = useOverlayPanelStore((s) => s.expandedPanel);
  const openPanel = useOverlayPanelStore((s) => s.openPanel);
  const closePanel = useOverlayPanelStore((s) => s.closePanel);
  const selectEvent = useHistoryStore((s) => s.selectEvent);
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const completedProgressNodeIds = useWorldStore((s) => s.completedProgressNodeIds);
  const activePathId = useWorldStore((s) => s.activePathId);
  const pathFlags = useWorldStore((s) => s.pathFlags);
  const completedPuzzleIds = useWorldStore((s) => s.completedPuzzleIds);
  const visitedWorldIds = useWorldStore((s) => s.visitedWorldIds);
  const initiationStatus = useWorldStore((s) => s.initiationStatus);
  const choiceHistory = useWorldStore((s) => s.choiceHistory);
  const resonance = useWorldStore((s) => s.resonance);
  const sessionsCompleted = useWorldStore((s) => s.sessionsCompleted);

  const activeRouteLabel = resolveActiveRouteLabel(activePathId, pathFlags);

  const nextStep = getPathNextStep(
    buildProgressInputFromWorld({
      completedProgressNodeIds,
      choiceHistory,
      pathFlags,
      initiationStatus,
      completedPuzzleIds,
      visitedWorldIds,
      resonance,
      sessionsCompleted,
    }),
  );

  if (isFlying) return null;

  const cosmic = mode !== 'embodied';
  const completedNodes = completedProgressNodeIds
    .map((id) => getProgressNodeById(id))
    .filter(Boolean);
  const nextNodes = ALL_PROGRESS_NODES.filter((n) => !completedProgressNodeIds.includes(n.id));

  const open = expandedPanel === 'path';

  const handleOpen = () => {
    selectEvent(null);
    openPanel('path');
  };

  if (!open) {
    return (
      <button
        type="button"
        className={`path-toggle ui-panel${cosmic ? ' path-toggle--cosmic' : ''}`}
        data-testid="path-toggle"
        onClick={handleOpen}
      >
        Path
      </button>
    );
  }

  return (
    <div
      className={`path-panel ui-panel${cosmic ? ' path-panel--cosmic' : ''}`}
      data-testid="path-panel"
    >
      <div className="path-header">
        <h3>Your path</h3>
        <button type="button" onClick={closePanel}>
          Close
        </button>
      </div>
      {nextStep && (
        <section className="path-next-step" data-testid="path-next-step">
          <h4>Next step</h4>
          <p className="path-next-step-title">{nextStep.title}</p>
          <p className="path-next-step-detail">{nextStep.detail}</p>
        </section>
      )}
      {activeRouteLabel && (
        <p className="path-active" data-testid="path-active-id">
          Active route: {activeRouteLabel}
        </p>
      )}
      <section>
        <h4>Completed ({completedNodes.length})</h4>
        <ul>
          {completedNodes.map((node) => (
            <li key={node!.id} data-testid={`progress-node-${node!.id}-completed`}>
              {node!.title}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4>Ahead</h4>
        <ul>
          {nextNodes.slice(0, 6).map((node) => (
            <li key={node.id} data-testid={`progress-node-${node.id}-pending`}>
              {node.title}
            </li>
          ))}
        </ul>
      </section>
      {Object.keys(pathFlags).length > 0 && (
        <section data-testid="path-flags">
          <h4>Path marks</h4>
          <ul>
            {Object.entries(pathFlags).map(([key, value]) => (
              <li key={key}>
                {key}: {String(value)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
