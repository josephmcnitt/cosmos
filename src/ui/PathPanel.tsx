import { useState } from 'react';
import { ALL_PROGRESS_NODES, getProgressNodeById } from '../data/progression/index';
import { useHistoryStore } from '../core/HistoryState';
import { useObserverStore } from '../core/ObserverState';
import { useWorldStore } from '../core/world/WorldState';

export function PathPanel() {
  const [open, setOpen] = useState(false);
  const mode = useObserverStore((s) => s.mode);
  const isFlying = useHistoryStore((s) => s.isFlying);
  const completedProgressNodeIds = useWorldStore((s) => s.completedProgressNodeIds);
  const activePathId = useWorldStore((s) => s.activePathId);
  const pathFlags = useWorldStore((s) => s.pathFlags);

  if (isFlying) return null;

  const cosmic = mode !== 'embodied';
  const completedNodes = completedProgressNodeIds
    .map((id) => getProgressNodeById(id))
    .filter(Boolean);
  const nextNodes = ALL_PROGRESS_NODES.filter((n) => !completedProgressNodeIds.includes(n.id));

  if (!open) {
    return (
      <button
        type="button"
        className={`path-toggle ui-panel${cosmic ? ' path-toggle--cosmic' : ''}`}
        data-testid="path-toggle"
        onClick={() => setOpen(true)}
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
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      {activePathId && (
        <p className="path-active" data-testid="path-active-id">
          Active route: {activePathId.replace(/-/g, ' ')}
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
