import { create } from 'zustand';
import type { BlendHistory } from '@/types';
import { historyApi } from '@/api/historyApi';

interface HistoryState {
  histories: BlendHistory[];
  selectedIds: string[];

  loadHistories: () => void;
  deleteHistory: (id: string) => void;
  clearAll: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  histories: [],
  selectedIds: [],

  loadHistories() {
    const histories = historyApi.getAll();
    set({ histories });
  },

  deleteHistory(id) {
    historyApi.delete(id);
    set({ histories: historyApi.getAll(), selectedIds: get().selectedIds.filter((sid) => sid !== id) });
  },

  clearAll() {
    historyApi.clear();
    set({ histories: [], selectedIds: [] });
  },

  toggleSelect(id) {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
    } else {
      if (selectedIds.length < 2) {
        set({ selectedIds: [...selectedIds, id] });
      }
    }
  },

  clearSelection() {
    set({ selectedIds: [] });
  },
}));
