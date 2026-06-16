import type { IncenseMaterial, Category, Recipe } from '@/types';

export const DEFAULT_MATERIALS: IncenseMaterial[] = [
  { id: 'm1', name: '檀香', category: 'wood', unit: 'g', pricePerGram: 2.5, description: '印度老山檀，醇厚温润', color: '#C4A882' },
  { id: 'm2', name: '沉香', category: 'wood', unit: 'g', pricePerGram: 15, description: '海南沉香，清甜幽远', color: '#8B6F4E' },
  { id: 'm3', name: '丁香', category: 'herb', unit: 'g', pricePerGram: 0.8, description: '公丁香，辛暖芬芳', color: '#A0522D' },
  { id: 'm4', name: '藿香', category: 'herb', unit: 'g', pricePerGram: 0.3, description: '广藿香，沉稳厚重', color: '#6B8E23' },
  { id: 'm5', name: '玫瑰', category: 'flower', unit: 'g', pricePerGram: 3, description: '大马士革玫瑰，馥郁柔美', color: '#D4756B' },
  { id: 'm6', name: '桂花', category: 'flower', unit: 'g', pricePerGram: 4, description: '金桂，清甜沁人', color: '#DAA520' },
  { id: 'm7', name: '乳香', category: 'resin', unit: 'g', pricePerGram: 5, description: '索马里乳香，清灵通透', color: '#F5DEB3' },
  { id: 'm8', name: '没药', category: 'resin', unit: 'g', pricePerGram: 6, description: '阿拉伯没药，温厚深沉', color: '#A0522D' },
  { id: 'm9', name: '龙脑', category: 'mineral', unit: 'g', pricePerGram: 20, description: '天然龙脑冰片，清凉穿透', color: '#E0E8F0' },
  { id: 'm10', name: '麝香', category: 'mineral', unit: 'g', pricePerGram: 50, description: '人工麝香，浓郁持久', color: '#D2B48C' },
  { id: 'm11', name: '安息香', category: 'resin', unit: 'g', pricePerGram: 3, description: '苏门答腊安息香，甜美温暖', color: '#DEB887' },
  { id: 'm12', name: '甘松', category: 'herb', unit: 'g', pricePerGram: 1, description: '四川甘松，泥土芬芳', color: '#8FBC8F' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: '花香型', color: '#D4756B', order: 0 },
  { id: 'c2', name: '木香型', color: '#8B6F4E', order: 1 },
  { id: 'c3', name: '合香', color: '#C4A882', order: 2 },
];

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: '静心安神香',
    category: 'c2',
    items: [
      { materialId: 'm1', materialName: '檀香', weight: 3, percentage: 37.5, color: '#C4A882' },
      { materialId: 'm2', materialName: '沉香', weight: 2, percentage: 25, color: '#8B6F4E' },
      { materialId: 'm7', materialName: '乳香', weight: 1.5, percentage: 18.75, color: '#F5DEB3' },
      { materialId: 'm9', materialName: '龙脑', weight: 0.5, percentage: 6.25, color: '#E0E8F0' },
      { materialId: 'm11', materialName: '安息香', weight: 1, percentage: 12.5, color: '#DEB887' },
    ],
    totalWeight: 8,
    notes: '晚间安神用，以檀沉为底，乳香龙脑点睛',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 'r2',
    name: '春日花语',
    category: 'c1',
    items: [
      { materialId: 'm5', materialName: '玫瑰', weight: 2, percentage: 33.3, color: '#D4756B' },
      { materialId: 'm6', materialName: '桂花', weight: 1.5, percentage: 25, color: '#DAA520' },
      { materialId: 'm1', materialName: '檀香', weight: 1.5, percentage: 25, color: '#C4A882' },
      { materialId: 'm3', materialName: '丁香', weight: 1, percentage: 16.7, color: '#A0522D' },
    ],
    totalWeight: 6,
    notes: '春日花香调，玫瑰为主桂花增甜',
    createdAt: '2025-06-05T14:00:00Z',
    updatedAt: '2025-06-05T14:00:00Z',
  },
];
