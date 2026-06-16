export interface IncenseMaterial {
  id: string;
  name: string;
  category: 'wood' | 'herb' | 'flower' | 'resin' | 'mineral' | 'other';
  unit: 'g';
  pricePerGram?: number;
  description?: string;
  color: string;
}

export interface RecipeItem {
  materialId: string;
  materialName: string;
  weight: number;
  percentage: number;
  color: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  items: RecipeItem[];
  totalWeight: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlendHistory {
  id: string;
  recipeId?: string;
  recipeName: string;
  items: RecipeItem[];
  totalWeight: number;
  deviation: number;
  status: 'normal' | 'warning' | 'error';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export interface WorkspaceItem {
  materialId: string;
  materialName: string;
  weight: number;
  color: string;
}

export type MaterialCategory = IncenseMaterial['category'];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  wood: '木香',
  herb: '草本',
  flower: '花香',
  resin: '树脂',
  mineral: '矿物',
  other: '其他',
};

export const DEVIATION_THRESHOLD = 5;
