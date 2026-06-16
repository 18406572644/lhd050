import type { BlendHistory } from '@/types';

const STORAGE_KEY = 'blend_history';

function generateId(): string {
  return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadAll(): BlendHistory[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(raw);
}

function saveAll(items: BlendHistory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const historyApi = {
  getAll(): BlendHistory[] {
    return loadAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById(id: string): BlendHistory | null {
    return loadAll().find((h) => h.id === id) ?? null;
  },

  add(history: Omit<BlendHistory, 'id' | 'createdAt'>): BlendHistory {
    const items = loadAll();
    const newHistory: BlendHistory = { ...history, id: generateId(), createdAt: new Date().toISOString() };
    items.push(newHistory);
    saveAll(items);
    return newHistory;
  },

  delete(id: string): void {
    const items = loadAll().filter((h) => h.id !== id);
    saveAll(items);
  },

  clear(): void {
    saveAll([]);
  },
};
