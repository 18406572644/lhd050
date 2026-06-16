import type { Recipe } from '@/types';
import { DEFAULT_RECIPES } from './mockData';

const STORAGE_KEY = 'recipes';

function generateId(): string {
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadAll(): Recipe[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECIPES));
    return [...DEFAULT_RECIPES];
  }
  return JSON.parse(raw);
}

function saveAll(items: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const recipeApi = {
  getAll(): Recipe[] {
    return loadAll();
  },

  getById(id: string): Recipe | null {
    return loadAll().find((r) => r.id === id) ?? null;
  },

  getByCategory(categoryId: string): Recipe[] {
    return loadAll().filter((r) => r.category === categoryId);
  },

  save(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Recipe {
    const items = loadAll();
    const now = new Date().toISOString();
    const newRecipe: Recipe = { ...recipe, id: generateId(), createdAt: now, updatedAt: now };
    items.push(newRecipe);
    saveAll(items);
    return newRecipe;
  },

  update(id: string, updates: Partial<Recipe>): Recipe | null {
    const items = loadAll();
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    saveAll(items);
    return items[idx];
  },

  delete(id: string): void {
    const items = loadAll().filter((r) => r.id !== id);
    saveAll(items);
  },
};
