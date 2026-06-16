import type { EncyclopediaEntry } from '@/types';
import { DEFAULT_ENCYCLOPEDIA } from './encyclopediaData';

const STORAGE_KEY = 'incense_encyclopedia';

function generateId(): string {
  return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadAll(): EncyclopediaEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENCYCLOPEDIA));
    return [...DEFAULT_ENCYCLOPEDIA];
  }
  return JSON.parse(raw);
}

function saveAll(items: EncyclopediaEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const encyclopediaApi = {
  getAll(): EncyclopediaEntry[] {
    return loadAll();
  },

  getById(id: string): EncyclopediaEntry | null {
    return loadAll().find((e) => e.id === id) ?? null;
  },

  getByMaterialId(materialId: string): EncyclopediaEntry | null {
    return loadAll().find((e) => e.materialId === materialId) ?? null;
  },

  search(query: string): EncyclopediaEntry[] {
    const q = query.toLowerCase();
    return loadAll().filter((e) => {
      if (e.name.toLowerCase().includes(q)) return true;
      if (e.aliases.some((a) => a.toLowerCase().includes(q))) return true;
      if (e.scentTags.some((t) => t.toLowerCase().includes(q))) return true;
      if (e.origin.toLowerCase().includes(q)) return true;
      return false;
    });
  },

  filterByCategory(category: string): EncyclopediaEntry[] {
    if (!category) return loadAll();
    return loadAll().filter((e) => e.category === category);
  },

  filterByScentTags(tags: string[]): EncyclopediaEntry[] {
    if (tags.length === 0) return loadAll();
    return loadAll().filter((e) =>
      tags.some((t) => e.scentTags.includes(t))
    );
  },

  getRelatedRecipes(materialId: string): string[] {
    const raw = localStorage.getItem('incense_recipes');
    if (!raw) return [];
    const recipes = JSON.parse(raw);
    return recipes
      .filter((r: any) => r.items.some((i: any) => i.materialId === materialId))
      .map((r: any) => r.id);
  },

  add(entry: Omit<EncyclopediaEntry, 'id' | 'contributor' | 'createdAt' | 'updatedAt'>): EncyclopediaEntry {
    const items = loadAll();
    const now = new Date().toISOString();
    const newEntry: EncyclopediaEntry = {
      ...entry,
      id: generateId(),
      contributor: 'user',
      createdAt: now,
      updatedAt: now,
    };
    items.push(newEntry);
    saveAll(items);
    return newEntry;
  },

  update(id: string, updates: Partial<EncyclopediaEntry>): EncyclopediaEntry | null {
    const items = loadAll();
    const idx = items.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    saveAll(items);
    return items[idx];
  },

  delete(id: string): void {
    const items = loadAll().filter((e) => e.id !== id);
    saveAll(items);
  },

  getAllScentTags(): string[] {
    const entries = loadAll();
    const tagSet = new Set<string>();
    entries.forEach((e) => e.scentTags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },
};
