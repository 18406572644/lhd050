import type { Category } from '@/types';
import { DEFAULT_CATEGORIES } from './mockData';

const STORAGE_KEY = 'categories';

function generateId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadAll(): Category[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return [...DEFAULT_CATEGORIES];
  }
  return JSON.parse(raw);
}

function saveAll(items: Category[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const categoryApi = {
  getAll(): Category[] {
    return loadAll().sort((a, b) => a.order - b.order);
  },

  add(category: Omit<Category, 'id'>): Category {
    const items = loadAll();
    const newCategory: Category = { ...category, id: generateId() };
    items.push(newCategory);
    saveAll(items);
    return newCategory;
  },

  update(id: string, updates: Partial<Category>): void {
    const items = loadAll();
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...updates };
    saveAll(items);
  },

  delete(id: string): void {
    const items = loadAll().filter((c) => c.id !== id);
    saveAll(items);
  },
};
