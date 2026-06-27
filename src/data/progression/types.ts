import type { KnowledgeMode } from '../../core/knowledgeMode';
import type { SpiritualTradition } from '../history/types';

export type ProgressCondition =
  | { type: 'nodeCompleted'; nodeId: string }
  | { type: 'choiceMade'; initiationId: string; choiceId: string }
  | { type: 'resonanceAtLeast'; tradition: SpiritualTradition; amount: number }
  | { type: 'puzzleCompleted'; puzzleId: string }
  | { type: 'ageVisited'; worldId: string }
  | { type: 'initiationCompleted'; worldId: string }
  | { type: 'pathFlag'; flag: string; value?: string | number | boolean }
  | { type: 'spiritualDepthAtLeast'; amount: number };

export type ProgressEffect =
  | { type: 'setPathFlag'; flag: string; value: string | number | boolean }
  | { type: 'setActivePath'; pathId: string }
  | { type: 'revealMarker'; markerId: string; worldId: string }
  | { type: 'unlockWorld'; worldId: string }
  | { type: 'unlockPortal'; portalId: string }
  | { type: 'journalEntry'; title: string; body: string };

export interface ProgressNodeDef {
  id: string;
  title: string;
  tradition?: SpiritualTradition;
  knowledgeMode?: KnowledgeMode;
  requires: ProgressCondition[];
  effects: ProgressEffect[];
}

export interface ChoiceRecord {
  initiationId: string;
  stepIndex: number;
  choiceId: string;
  at: number;
}
