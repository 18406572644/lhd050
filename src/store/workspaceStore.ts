import { create } from 'zustand';
import type { WorkspaceItem, IncenseMaterial, EncyclopediaEntry } from '@/types';
import { DEVIATION_THRESHOLD } from '@/types';
import { materialApi } from '@/api/materialApi';
import { historyApi } from '@/api/historyApi';
import { encyclopediaApi } from '@/api/encyclopediaApi';

interface WorkspaceState {
  items: WorkspaceItem[];
  materials: IncenseMaterial[];
  targetTotal: number;
  deviation: number;
  status: 'normal' | 'warning' | 'error';

  loadMaterials: () => void;
  addItem: (materialId: string) => void;
  removeItem: (materialId: string) => void;
  updateWeight: (materialId: string, weight: number) => void;
  adjustWeight: (materialId: string, delta: number) => void;
  applyRecipe: (items: WorkspaceItem[]) => void;
  clearWorkspace: () => void;
  setTargetTotal: (target: number) => void;
  saveToHistory: (name: string, recipeId?: string) => void;
  addCustomMaterial: (material: Omit<IncenseMaterial, 'id'>) => void;
  addCustomMaterialWithEncyclopedia: (
    material: Omit<IncenseMaterial, 'id'>,
    encyclopedia: Omit<EncyclopediaEntry, 'id' | 'contributor' | 'createdAt' | 'updatedAt' | 'materialId'>
  ) => void;
}

function computeDeviation(items: WorkspaceItem[], targetTotal: number): { deviation: number; status: 'normal' | 'warning' | 'error' } {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (targetTotal <= 0) return { deviation: 0, status: 'normal' };
  const dev = Math.abs((total - targetTotal) / targetTotal) * 100;
  if (dev > DEVIATION_THRESHOLD) return { deviation: dev, status: 'error' };
  if (dev > DEVIATION_THRESHOLD / 2) return { deviation: dev, status: 'warning' };
  return { deviation: dev, status: 'normal' };
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  items: [],
  materials: [],
  targetTotal: 10,
  deviation: 0,
  status: 'normal',

  loadMaterials() {
    const materials = materialApi.getAll();
    set({ materials });
  },

  addItem(materialId: string) {
    const { items, materials } = get();
    if (items.find((i) => i.materialId === materialId)) return;
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;
    const newItems = [...items, { materialId, materialName: material.name, weight: 0, color: material.color }];
    const { deviation, status } = computeDeviation(newItems, get().targetTotal);
    set({ items: newItems, deviation, status });
  },

  removeItem(materialId: string) {
    const newItems = get().items.filter((i) => i.materialId !== materialId);
    const { deviation, status } = computeDeviation(newItems, get().targetTotal);
    set({ items: newItems, deviation, status });
  },

  updateWeight(materialId: string, weight: number) {
    const newItems = get().items.map((i) =>
      i.materialId === materialId ? { ...i, weight: Math.max(0, Math.round(weight * 100) / 100) } : i
    );
    const { deviation, status } = computeDeviation(newItems, get().targetTotal);
    set({ items: newItems, deviation, status });
  },

  adjustWeight(materialId: string, delta: number) {
    const item = get().items.find((i) => i.materialId === materialId);
    if (!item) return;
    get().updateWeight(materialId, item.weight + delta);
  },

  applyRecipe(items: WorkspaceItem[]) {
    const { deviation, status } = computeDeviation(items, get().targetTotal);
    set({ items: [...items], deviation, status });
  },

  clearWorkspace() {
    set({ items: [], deviation: 0, status: 'normal' });
  },

  setTargetTotal(target: number) {
    const { deviation, status } = computeDeviation(get().items, target);
    set({ targetTotal: target, deviation, status });
  },

  saveToHistory(name: string, recipeId?: string) {
    const { items, targetTotal, deviation, status } = get();
    if (items.length === 0) return;
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    const recipeItems = items.map((i) => ({
      materialId: i.materialId,
      materialName: i.materialName,
      weight: i.weight,
      percentage: totalWeight > 0 ? Math.round((i.weight / totalWeight) * 10000) / 100 : 0,
      color: i.color,
    }));
    historyApi.add({
      recipeId,
      recipeName: name,
      items: recipeItems,
      totalWeight,
      deviation,
      status,
    });
  },

  addCustomMaterial(material: Omit<IncenseMaterial, 'id'>) {
    materialApi.add(material);
    get().loadMaterials();
  },

  addCustomMaterialWithEncyclopedia(
    material: Omit<IncenseMaterial, 'id'>,
    encyclopedia: Omit<EncyclopediaEntry, 'id' | 'contributor' | 'createdAt' | 'updatedAt' | 'materialId'>
  ) {
    const newMaterial = materialApi.add(material);
    encyclopediaApi.add({ ...encyclopedia, materialId: newMaterial.id });
    materialApi.update(newMaterial.id, { encyclopediaId: '' });
    const newEncyclopedia = encyclopediaApi.getByMaterialId(newMaterial.id);
    if (newEncyclopedia) {
      materialApi.update(newMaterial.id, { encyclopediaId: newEncyclopedia.id });
    }
    get().loadMaterials();
  },
}));
