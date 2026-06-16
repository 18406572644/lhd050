export interface IncenseMaterial {
  id: string;
  name: string;
  category: 'wood' | 'herb' | 'flower' | 'resin' | 'mineral' | 'other';
  unit: 'g';
  pricePerGram?: number;
  description?: string;
  color: string;
  encyclopediaId?: string;
}

export type FragranceNote = 'top' | 'middle' | 'base';

export type IncenseForm = 'stick' | 'seal' | 'fumigation' | 'powder' | 'cone';

export interface EncyclopediaEntry {
  id: string;
  materialId: string;
  name: string;
  aliases: string[];
  category: 'wood' | 'herb' | 'flower' | 'resin' | 'mineral' | 'other';
  origin: string;
  priceRange: string;
  color: string;
  fragranceNotes: {
    top?: string;
    middle?: string;
    base?: string;
  };
  scentTags: string[];
  pairingGood: string[];
  pairingAvoid: string[];
  usageTips: {
    dosageRange: string;
    grindingNotes: string;
    suitableForms: IncenseForm[];
  };
  culturalBackground?: {
    history?: string;
    poetry?: string;
    traditionalUse?: string;
  };
  contributor: 'official' | 'user';
  createdAt: string;
  updatedAt: string;
}

export const INCENSE_FORM_LABELS: Record<IncenseForm, string> = {
  stick: '线香',
  seal: '篆香',
  fumigation: '隔火熏香',
  powder: '香粉',
  cone: '香锥',
};

export const FRAGRANCE_NOTE_LABELS: Record<FragranceNote, string> = {
  top: '前调',
  middle: '中调',
  base: '后调',
};

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

export type ViewMode = 'card' | 'list';

export interface AdvancedFilter {
  includeMaterials: string[];
  excludeMaterials: string[];
  weightMin: number | null;
  weightMax: number | null;
  materialCountMin: number | null;
  materialCountMax: number | null;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  datePreset: '7d' | '30d' | 'custom' | null;
  deviationMax: number | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  filter: AdvancedFilter;
}

export const DEFAULT_ADVANCED_FILTER: AdvancedFilter = {
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
};
