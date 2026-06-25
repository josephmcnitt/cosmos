import { useMemo } from 'react';
import { getEventById } from '../data/history/index';
import { KNOWLEDGE_MODE_LABELS, resolveKnowledgeMode } from '../core/knowledgeMode';
import { useHistoryStore } from '../core/HistoryState';
import { usePracticeStore } from '../core/PracticeState';

export function KnowledgeModeIndicator() {
  const selectedEventId = useHistoryStore((s) => s.selectedEventId);
  const realmPhase = usePracticeStore((s) => s.realmPhase);
  const activePractice = usePracticeStore((s) => s.activePractice);

  const mode = useMemo(() => {
    const event = selectedEventId ? getEventById(selectedEventId) : null;
    return resolveKnowledgeMode(event ?? null, realmPhase, activePractice != null);
  }, [selectedEventId, realmPhase, activePractice]);

  return (
    <span
      data-testid="knowledge-mode"
      data-mode={mode}
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
  );
}

export { KNOWLEDGE_MODE_LABELS };
