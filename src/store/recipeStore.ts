import { create } from 'zustand';
import type { Recipe, Category, AdvancedFilter, FilterPreset, ViewMode } from '@/types';
import { DEFAULT_ADVANCED_FILTER } from '@/types';
import { recipeApi } from '@/api/recipeApi';
import { categoryApi } from '@/api/categoryApi';
import { historyApi } from '@/api/historyApi';

const PRESETS_KEY = 'filter_presets';
const VIEW_MODE_KEY = 'view_mode';

function loadPresets(): FilterPreset[] {
  const raw = localStorage.getItem(PRESETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePresets(presets: FilterPreset[]): void {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function loadViewMode(): ViewMode {
  const raw = localStorage.getItem(VIEW_MODE_KEY);
  return raw === 'list' ? 'list' : 'card';
}

function saveViewMode(mode: ViewMode): void {
  localStorage.setItem(VIEW_MODE_KEY, mode);
}

interface RecipeState {
  recipes: Recipe[];
  categories: Category[];
  activeCategory: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  advancedFilter: AdvancedFilter;
  filterPresets: FilterPreset[];
  advancedSearchOpen: boolean;

  loadRecipes: () => void;
  loadCategories: () => void;
  saveRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Recipe;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  addCategory: (name: string, color?: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setActiveCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setAdvancedFilter: (filter: Partial<AdvancedFilter>) => void;
  resetAdvancedFilter: () => void;
  setAdvancedSearchOpen: (open: boolean) => void;
  addFilterPreset: (name: string, filter: AdvancedFilter) => void;
  deleteFilterPreset: (id: string) => void;
  applyFilterPreset: (id: string) => void;
  getFilteredRecipes: () => Recipe[];
  getRecipeAvgDeviation: (recipeId: string) => number | null;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  categories: [],
  activeCategory: null,
  searchQuery: '',
  viewMode: loadViewMode(),
  advancedFilter: { ...DEFAULT_ADVANCED_FILTER },
  filterPresets: loadPresets(),
  advancedSearchOpen: false,

  loadRecipes() {
    const recipes = recipeApi.getAll();
    set({ recipes });
  },

  loadCategories() {
    const categories = categoryApi.getAll();
    set({ categories });
  },

  saveRecipe(recipe) {
    const newRecipe = recipeApi.save(recipe);
    set({ recipes: recipeApi.getAll() });
    return newRecipe;
  },

  updateRecipe(id, updates) {
    recipeApi.update(id, updates);
    set({ recipes: recipeApi.getAll() });
  },

  deleteRecipe(id) {
    recipeApi.delete(id);
    set({ recipes: recipeApi.getAll() });
  },

  addCategory(name, color) {
    const categories = get().categories;
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.order), -1);
    categoryApi.add({ name, color, order: maxOrder + 1 });
    set({ categories: categoryApi.getAll() });
  },

  updateCategory(id, updates) {
    categoryApi.update(id, updates);
    set({ categories: categoryApi.getAll() });
  },

  deleteCategory(id) {
    categoryApi.delete(id);
    set({ categories: categoryApi.getAll() });
  },

  setActiveCategory(categoryId) {
    set({ activeCategory: categoryId });
  },

  setSearchQuery(query) {
    set({ searchQuery: query });
  },

  setViewMode(mode) {
    saveViewMode(mode);
    set({ viewMode: mode });
  },

  setAdvancedFilter(filter) {
    set((state) => ({
      advancedFilter: { ...state.advancedFilter, ...filter },
    }));
  },

  resetAdvancedFilter() {
    set({
      advancedFilter: {
        includeMaterials: [],
        excludeMaterials: [],
        weightMin: null,
        weightMax: null,
        materialCountMin: null,
        materialCountMax: null,
        dateRangeStart: null,
        dateRangeEnd: null,
        datePreset: null,
        deviationMax: null,
      },
    });
  },

  setAdvancedSearchOpen(open) {
    set({ advancedSearchOpen: open });
  },

  addFilterPreset(name, filter) {
    const presets = get().filterPresets;
    const newPreset: FilterPreset = {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      filter: { ...filter },
    };
    const next = [...presets, newPreset];
    savePresets(next);
    set({ filterPresets: next });
  },

  deleteFilterPreset(id) {
    const next = get().filterPresets.filter((p) => p.id !== id);
    savePresets(next);
    set({ filterPresets: next });
  },

  applyFilterPreset(id) {
    const preset = get().filterPresets.find((p) => p.id === id);
    if (preset) {
      set({
        advancedFilter: {
          includeMaterials: [...preset.filter.includeMaterials],
          excludeMaterials: [...preset.filter.excludeMaterials],
          weightMin: preset.filter.weightMin,
          weightMax: preset.filter.weightMax,
          materialCountMin: preset.filter.materialCountMin,
          materialCountMax: preset.filter.materialCountMax,
          dateRangeStart: preset.filter.dateRangeStart,
          dateRangeEnd: preset.filter.dateRangeEnd,
          datePreset: preset.filter.datePreset,
          deviationMax: preset.filter.deviationMax,
        },
      });
    }
  },

  getRecipeAvgDeviation(recipeId) {
    const histories = historyApi.getAll().filter((h) => h.recipeId === recipeId);
    if (histories.length === 0) return null;
    const sum = histories.reduce((s, h) => s + h.deviation, 0);
    return sum / histories.length;
  },

  getFilteredRecipes() {
    const { recipes, activeCategory, searchQuery, advancedFilter, getRecipeAvgDeviation } = get();
    let filtered = recipes;

    if (activeCategory) {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.items.some((i) => i.materialName.toLowerCase().includes(q))
      );
    }

    if (advancedFilter.includeMaterials.length > 0) {
      filtered = filtered.filter((r) =>
        advancedFilter.includeMaterials.every((mid) =>
          r.items.some((i) => i.materialId === mid || i.materialName === mid)
        )
      );
    }

    if (advancedFilter.excludeMaterials.length > 0) {
      filtered = filtered.filter((r) =>
        advancedFilter.excludeMaterials.every((mid) =>
          !r.items.some((i) => i.materialId === mid || i.materialName === mid)
        )
      );
    }

    if (advancedFilter.weightMin !== null) {
      filtered = filtered.filter((r) => r.totalWeight >= advancedFilter.weightMin!);
    }

    if (advancedFilter.weightMax !== null) {
      filtered = filtered.filter((r) => r.totalWeight <= advancedFilter.weightMax!);
    }

    if (advancedFilter.materialCountMin !== null) {
      filtered = filtered.filter((r) => r.items.length >= advancedFilter.materialCountMin!);
    }

    if (advancedFilter.materialCountMax !== null) {
      filtered = filtered.filter((r) => r.items.length <= advancedFilter.materialCountMax!);
    }

    if (advancedFilter.datePreset === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter((r) => new Date(r.updatedAt) >= sevenDaysAgo);
    } else if (advancedFilter.datePreset === '30d') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((r) => new Date(r.updatedAt) >= thirtyDaysAgo);
    } else if (advancedFilter.datePreset === 'custom') {
      if (advancedFilter.dateRangeStart) {
        filtered = filtered.filter(
          (r) => new Date(r.updatedAt) >= new Date(advancedFilter.dateRangeStart!)
        );
      }
      if (advancedFilter.dateRangeEnd) {
        const endDate = new Date(advancedFilter.dateRangeEnd);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((r) => new Date(r.updatedAt) <= endDate);
      }
    }

    if (advancedFilter.deviationMax !== null) {
      filtered = filtered.filter((r) => {
        const avg = getRecipeAvgDeviation(r.id);
        return avg !== null && avg <= advancedFilter.deviationMax!;
      });
    }

    return filtered;
  },
}));
