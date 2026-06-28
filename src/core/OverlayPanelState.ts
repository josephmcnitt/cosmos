import { create } from 'zustand';

export type OverlayPanelId = 'journal' | 'path' | 'link';

interface OverlayPanelState {
  expandedPanel: OverlayPanelId | null;
  linkPortalId: string | null;
  openPanel: (panel: OverlayPanelId, options?: { linkPortalId?: string }) => void;
  closePanel: () => void;
  togglePanel: (panel: OverlayPanelId, options?: { linkPortalId?: string }) => void;
}

export const useOverlayPanelStore = create<OverlayPanelState>((set, get) => ({
  expandedPanel: null,
  linkPortalId: null,

  openPanel: (panel, options) =>
    set({
      expandedPanel: panel,
      linkPortalId: panel === 'link' ? (options?.linkPortalId ?? null) : null,
    }),

  closePanel: () => set({ expandedPanel: null, linkPortalId: null }),

  togglePanel: (panel, options) => {
    const { expandedPanel, openPanel, closePanel } = get();
    if (expandedPanel === panel) closePanel();
    else openPanel(panel, options);
  },
}));
