import { create } from 'zustand';
import type { Recipe, Category } from '@/types';
import { recipeApi } from '@/api/recipeApi';
import { categoryApi } from '@/api/categoryApi';

interface RecipeState {
  recipes: Recipe[];
  categories: Category[];
  activeCategory: string | null;
  searchQuery: string;

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
  getFilteredRecipes: () => Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  categories: [],
  activeCategory: null,
  searchQuery: '',

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

  getFilteredRecipes() {
    const { recipes, activeCategory, searchQuery } = get();
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
    return filtered;
  },
}));
