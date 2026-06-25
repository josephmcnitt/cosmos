import { describe, expect, it } from 'vitest';
import { inferKnowledgeMode } from './knowledgeMode';

const esotericEvent = {
  id: 'test',
  simTimeSeconds: 0,
  track: 'spiritual' as const,
  tradition: 'platonism' as const,
  visibility: 'esoteric' as const,
  title: 'T',
  summary: 'S',
};

const exotericEvent = { ...esotericEvent, visibility: 'exoteric' as const };

describe('knowledgeMode', () => {
  it('esoteric discover is rational', () => {
    expect(inferKnowledgeMode(esotericEvent, 'material', false)).toBe('rational');
  });

  it('exoteric spiritual is faith', () => {
    expect(inferKnowledgeMode(exotericEvent, 'material', false)).toBe('faith');
  });

  it('practice is experience', () => {
    expect(inferKnowledgeMode(esotericEvent, 'liminal', true)).toBe('experience');
  });

  it('spiritual realm is gnosis', () => {
    expect(inferKnowledgeMode(esotericEvent, 'spiritual', false)).toBe('gnosis');
  });
});
