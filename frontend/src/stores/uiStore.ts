import { create } from 'zustand';

type ContextPanelType = 'sources' | 'checklist' | 'steps' | 'document' | null;

interface UIStore {
  sidebarOpen: boolean;
  contextPanelType: ContextPanelType;
  contextPanelData: unknown;
  toggleSidebar: () => void;
  openContextPanel: (type: ContextPanelType, data?: unknown) => void;
  closeContextPanel: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  contextPanelType: null,
  contextPanelData: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openContextPanel: (type, data = null) => set({ contextPanelType: type, contextPanelData: data }),
  closeContextPanel: () => set({ contextPanelType: null, contextPanelData: null }),
}));
