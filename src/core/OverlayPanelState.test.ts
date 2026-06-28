import { describe, expect, it, beforeEach } from 'vitest';
import { useOverlayPanelStore } from './OverlayPanelState';

describe('useOverlayPanelStore', () => {
  beforeEach(() => {
    useOverlayPanelStore.setState({ expandedPanel: null, linkPortalId: null });
  });

  it('opens one panel at a time', () => {
    const { openPanel } = useOverlayPanelStore.getState();
    openPanel('journal');
    expect(useOverlayPanelStore.getState().expandedPanel).toBe('journal');
    openPanel('path');
    expect(useOverlayPanelStore.getState().expandedPanel).toBe('path');
  });

  it('stores link portal id only for link panel', () => {
    const { openPanel } = useOverlayPanelStore.getState();
    openPanel('link', { linkPortalId: 'portal-alexandria' });
    expect(useOverlayPanelStore.getState().linkPortalId).toBe('portal-alexandria');
    openPanel('journal');
    expect(useOverlayPanelStore.getState().linkPortalId).toBeNull();
  });

  it('toggles the same panel closed', () => {
    const { togglePanel } = useOverlayPanelStore.getState();
    togglePanel('journal');
    expect(useOverlayPanelStore.getState().expandedPanel).toBe('journal');
    togglePanel('journal');
    expect(useOverlayPanelStore.getState().expandedPanel).toBeNull();
  });
});
