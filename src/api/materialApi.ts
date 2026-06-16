import type { IncenseMaterial } from '@/types';
import { DEFAULT_MATERIALS } from './mockData';

const STORAGE_KEY = 'incense_materials';

function generateId(): string {
  return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadAll(): IncenseMaterial[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MATERIALS));
    return [...DEFAULT_MATERIALS];
  }
  return JSON.parse(raw);
}

function saveAll(items: IncenseMaterial[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const materialApi = {
  getAll(): IncenseMaterial[] {
    return loadAll();
  },

  getById(id: string): IncenseMaterial | null {
    return loadAll().find((m) => m.id === id) ?? null;
  },

  add(material: Omit<IncenseMaterial, 'id'>): IncenseMaterial {
    const items = loadAll();
    const newItem: IncenseMaterial = { ...material, id: generateId() };
    items.push(newItem);
    saveAll(items);
    return newItem;
  },

  update(id: string, updates: Partial<IncenseMaterial>): IncenseMaterial | null {
    const items = loadAll();
    const idx = items.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    saveAll(items);
    return items[idx];
  },

  delete(id: string): void {
    const items = loadAll().filter((m) => m.id !== id);
    saveAll(items);
  },
};
