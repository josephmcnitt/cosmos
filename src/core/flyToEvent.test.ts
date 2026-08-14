import { beforeEach, describe, expect, it } from 'vitest';
import { flyToEvent } from './flyToEvent';
import { useHistoryStore } from './HistoryState';
import { useObserverStore } from './ObserverState';
import { getEventById } from '../data/history/index';

describe('flyToEvent', () => {
  beforeEach(() => {
    useHistoryStore.setState({
      selectedEventId: null,
      selectedTrack: null,
      isFlying: false,
      historyTrack: 'material',
    });
    useObserverStore.setState({
      mode: 'embodied',
      spatialExponent: 4,
      simTimeSeconds: useObserverStore.getState().simTimeSeconds,
    });
  });

  it('keeps walk mode when opening an event from embodied discovery', async () => {
    const event = getEventById('library-alexandria');
    expect(event).toBeTruthy();
    await flyToEvent(event!);

    const observer = useObserverStore.getState();
    const history = useHistoryStore.getState();
    expect(observer.mode).toBe('embodied');
    expect(observer.spatialExponent).toBe(4);
    expect(history.selectedEventId).toBe('library-alexandria');
    expect(history.isFlying).toBe(false);
  });
});
