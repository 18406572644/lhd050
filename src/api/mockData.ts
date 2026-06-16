import type { IncenseMaterial, Category, Recipe } from '@/types';

export const DEFAULT_MATERIALS: IncenseMaterial[] = [
  { id: 'm1', name: '檀香', category: 'wood', unit: 'g', pricePerGram: 2.5, description: '印度老山檀，醇厚温润', color: '#C4A882', encyclopediaId: 'e1' },
  { id: 'm2', name: '沉香', category: 'wood', unit: 'g', pricePerGram: 15, description: '海南沉香，清甜幽远', color: '#8B6F4E', encyclopediaId: 'e2' },
  { id: 'm3', name: '丁香', category: 'herb', unit: 'g', pricePerGram: 0.8, description: '公丁香，辛暖芬芳', color: '#A0522D', encyclopediaId: 'e3' },
  { id: 'm4', name: '藿香', category: 'herb', unit: 'g', pricePerGram: 0.3, description: '广藿香，沉稳厚重', color: '#6B8E23', encyclopediaId: 'e4' },
  { id: 'm5', name: '玫瑰', category: 'flower', unit: 'g', pricePerGram: 3, description: '大马士革玫瑰，馥郁柔美', color: '#D4756B', encyclopediaId: 'e5' },
  { id: 'm6', name: '桂花', category: 'flower', unit: 'g', pricePerGram: 4, description: '金桂，清甜沁人', color: '#DAA520', encyclopediaId: 'e6' },
  { id: 'm7', name: '乳香', category: 'resin', unit: 'g', pricePerGram: 5, description: '索马里乳香，清灵通透', color: '#F5DEB3', encyclopediaId: 'e7' },
  { id: 'm8', name: '没药', category: 'resin', unit: 'g', pricePerGram: 6, description: '阿拉伯没药，温厚深沉', color: '#A0522D', encyclopediaId: 'e8' },
  { id: 'm9', name: '龙脑', category: 'mineral', unit: 'g', pricePerGram: 20, description: '天然龙脑冰片，清凉穿透', color: '#E0E8F0', encyclopediaId: 'e9' },
  { id: 'm10', name: '麝香', category: 'mineral', unit: 'g', pricePerGram: 50, description: '人工麝香，浓郁持久', color: '#D2B48C', encyclopediaId: 'e10' },
  { id: 'm11', name: '安息香', category: 'resin', unit: 'g', pricePerGram: 3, description: '苏门答腊安息香，甜美温暖', color: '#DEB887', encyclopediaId: 'e11' },
  { id: 'm12', name: '甘松', category: 'herb', unit: 'g', pricePerGram: 1, description: '四川甘松，泥土芬芳', color: '#8FBC8F', encyclopediaId: 'e12' },
  { id: 'm13', name: '龙涎香', category: 'mineral', unit: 'g', pricePerGram: 500, description: '珍贵定香，极其持久', color: '#696969', encyclopediaId: 'e13' },
  { id: 'm14', name: '茉莉', category: 'flower', unit: 'g', pricePerGram: 4, description: '清新高雅，人间第一香', color: '#FFFAF0', encyclopediaId: 'e14' },
  { id: 'm15', name: '柏木', category: 'wood', unit: 'g', pricePerGram: 0.5, description: '清新松香，沉稳安神', color: '#8B7355', encyclopediaId: 'e15' },
  { id: 'm16', name: '白芷', category: 'herb', unit: 'g', pricePerGram: 0.6, description: '辛香辟秽，通窍止痛', color: '#F5F5DC', encyclopediaId: 'e16' },
  { id: 'm17', name: '肉桂', category: 'herb', unit: 'g', pricePerGram: 1.5, description: '温暖辛甜，温中补阳', color: '#8B4513', encyclopediaId: 'e17' },
  { id: 'm18', name: '苍术', category: 'herb', unit: 'g', pricePerGram: 0.7, description: '辛烈辟秽，燥湿健脾', color: '#A0522D', encyclopediaId: 'e18' },
  { id: 'm19', name: '薰衣草', category: 'flower', unit: 'g', pricePerGram: 2.5, description: '舒缓安眠，清新草本', color: '#9370DB', encyclopediaId: 'e19' },
  { id: 'm20', name: '陈皮', category: 'herb', unit: 'g', pricePerGram: 1, description: '陈香苦甜，理气健脾', color: '#CD853F', encyclopediaId: 'e20' },
  { id: 'm21', name: '奇楠香', category: 'wood', unit: 'g', pricePerGram: 300, description: '沉香极品，香中之王', color: '#3D2B1F', encyclopediaId: 'e21' },
  { id: 'm22', name: '崖柏', category: 'wood', unit: 'g', pricePerGram: 8, description: '醇厚松香，千年崖柏', color: '#8B4513', encyclopediaId: 'e22' },
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
