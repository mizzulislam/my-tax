import { create } from 'zustand';

interface SelectionState {
  isSelectionModeActive: boolean;
  toggleSelectionMode: () => void;
  setSelectionMode: (active: boolean) => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  isSelectionModeActive: false, // Default is off
  toggleSelectionMode: () => set((state) => ({ isSelectionModeActive: !state.isSelectionModeActive })),
  setSelectionMode: (active) => set({ isSelectionModeActive: active }),
  pendingPrompt: null,
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
}));
