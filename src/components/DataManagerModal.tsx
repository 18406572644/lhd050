import { useState, useRef } from 'react';
import {
  Modal, Tabs, Button, Group, Text, Paper, Alert, Checkbox, Radio, Table, ScrollArea, Badge, Divider, ModalBaseProps, Stack, Progress
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Download, Upload, FileJson, AlertTriangle, Check, X, Info } from 'lucide-react';
import type { IncenseMaterial, Recipe, Category, BlendHistory, EncyclopediaEntry } from '@/types';
import { materialApi } from '@/api/materialApi';
import { recipeApi } from '@/api/recipeApi';
import { categoryApi } from '@/api/categoryApi';
import { historyApi } from '@/api/historyApi';
import { encyclopediaApi } from '@/api/encyclopediaApi';
import { useRecipeStore } from '@/store/recipeStore';
import { useHistoryStore } from '@/store/historyStore';

interface DataBackup {
  version: string;
  exportedAt: string;
  materials: IncenseMaterial[];
  recipes: Recipe[];
  categories: Category[];
  histories: BlendHistory[];
  encyclopedia: EncyclopediaEntry[];
}

type MergeStrategy = 'overwrite' | 'append' | 'manual';

interface ImportPreview {
  materials: { add: number; overwrite: number; skip: number; conflicts: ConflictItem[] };
  recipes: { add: number; overwrite: number; skip: number; conflicts: ConflictItem[] };
  categories: { add: number; overwrite: number; skip: number; conflicts: ConflictItem[] };
  histories: { add: number; overwrite: number; skip: number; conflicts: ConflictItem[] };
  encyclopedia: { add: number; overwrite: number; skip: number; conflicts: ConflictItem[] };
}

interface BaseDataItem {
  id: string;
  name?: string;
}

interface ConflictItem {
  id: string;
  name: string;
  existing?: BaseDataItem;
  incoming: BaseDataItem;
  action: 'skip' | 'overwrite' | 'add';
  type: 'material' | 'recipe' | 'category' | 'history' | 'encyclopedia';
}

interface DataManagerModalProps extends ModalBaseProps {
  opened: boolean;
  onClose: () => void;
}

const BACKUP_VERSION = '1.0';

function generateFileName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `incense_backup_${year}${month}${day}_${hours}${minutes}${seconds}.json`;
}

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTemplateData(): DataBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    materials: [
      {
        id: 'm_template_1',
        name: '示例香材',
        category: 'wood',
        unit: 'g',
        pricePerGram: 1.0,
        description: '这是一个示例香材',
        color: '#C4A882',
      },
    ],
    recipes: [
      {
        id: 'r_template_1',
        name: '示例配方',
        category: 'c_template_1',
        items: [
          { materialId: 'm_template_1', materialName: '示例香材', weight: 5, percentage: 100, color: '#C4A882' },
        ],
        totalWeight: 5,
        notes: '这是一个示例配方',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    categories: [
      { id: 'c_template_1', name: '示例分类', color: '#C4A882', order: 0 },
    ],
    histories: [],
    encyclopedia: [],
  };
}

export default function DataManagerModal({ opened, onClose, ...props }: DataManagerModalProps) {
  const [activeTab, setActiveTab] = useState<string>('export');
  const [exportOptions, setExportOptions] = useState({
    materials: true,
    recipes: true,
    categories: true,
    histories: true,
    encyclopedia: true,
  });
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('append');
  const [importData, setImportData] = useState<DataBackup | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [manualConflicts, setManualConflicts] = useState<ConflictItem[]>([]);
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [showConflictStep, setShowConflictStep] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadRecipes = useRecipeStore((s) => s.loadRecipes);
  const loadCategories = useRecipeStore((s) => s.loadCategories);
  const loadHistories = useHistoryStore((s) => s.loadHistories);

  function handleExportAll(): void {
    const data: DataBackup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      materials: exportOptions.materials ? materialApi.getAll() : [],
      recipes: exportOptions.recipes ? recipeApi.getAll() : [],
      categories: exportOptions.categories ? categoryApi.getAll() : [],
      histories: exportOptions.histories ? historyApi.getAll() : [],
      encyclopedia: exportOptions.encyclopedia ? encyclopediaApi.getAll() : [],
    };
    downloadJson(data, generateFileName());
    notifications.show({
      title: '导出成功',
      message: '数据已成功导出为 JSON 文件',
      icon: <Check size={16} />,
      color: 'green',
    });
  }

  function handleExportRecipes(): void {
    const data: DataBackup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      materials: [],
      recipes: recipeApi.getAll(),
      categories: categoryApi.getAll(),
      histories: [],
      encyclopedia: [],
    };
    downloadJson(data, generateFileName());
    notifications.show({
      title: '导出成功',
      message: '配方数据已成功导出',
      icon: <Check size={16} />,
      color: 'green',
    });
  }

  function handleExportMaterials(): void {
    const data: DataBackup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      materials: materialApi.getAll(),
      recipes: [],
      categories: [],
      histories: [],
      encyclopedia: [],
    };
    downloadJson(data, generateFileName());
    notifications.show({
      title: '导出成功',
      message: '香材库数据已成功导出',
      icon: <Check size={16} />,
      color: 'green',
    });
  }

  function handleDownloadTemplate(): void {
    downloadJson(getTemplateData(), 'incense_import_template.json');
    notifications.show({
      title: '模板已下载',
      message: '请按照模板格式准备导入数据',
      icon: <Check size={16} />,
      color: 'green',
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.version || !data.materials || !data.recipes) {
          throw new Error('无效的数据格式');
        }
        setImportData(data);
        generatePreview(data);
        notifications.show({
          title: '文件已加载',
          message: '请预览导入数据',
          icon: <Info size={16} />,
          color: 'blue',
        });
      } catch {
        notifications.show({
          title: '文件解析失败',
          message: '请确保文件是有效的 JSON 格式',
          icon: <X size={16} />,
          color: 'red',
        });
      }
    };
    reader.readAsText(file);
  }

  function findConflict<T extends { id: string; name?: string }>(
    existing: T[],
    incoming: T[],
    type: ConflictItem['type']
  ): { add: number; overwrite: number; skip: number; conflicts: ConflictItem[] } {
    const existingMap = new Map(existing.map((item) => [item.id, item]));
    const existingNameMap = new Map(existing.map((item) => [item.name?.toLowerCase() || '', item]));
    const conflicts: ConflictItem[] = [];
    let add = 0;
    let overwrite = 0;
    let skip = 0;

    for (const item of incoming) {
      const byId = existingMap.get(item.id);
      const byName = existingNameMap.get(item.name?.toLowerCase() || '');

      if (byId) {
        conflicts.push({
          id: item.id,
          name: item.name || item.id,
          existing: byId as BaseDataItem,
          incoming: item as BaseDataItem,
          action: mergeStrategy === 'overwrite' ? 'overwrite' : 'skip',
          type,
        });
        overwrite++;
      } else if (byName) {
        conflicts.push({
          id: item.id,
          name: item.name || item.id,
          existing: byName as BaseDataItem,
          incoming: item as BaseDataItem,
          action: mergeStrategy === 'overwrite' ? 'overwrite' : 'skip',
          type,
        });
        skip++;
      } else {
        add++;
      }
    }

    return { add, overwrite, skip, conflicts };
  }

  function generatePreview(data: DataBackup): void {
    const existingMaterials = materialApi.getAll();
    const existingRecipes = recipeApi.getAll();
    const existingCategories = categoryApi.getAll();
    const existingHistories = historyApi.getAll();
    const existingEncyclopedia = encyclopediaApi.getAll();

    const materialsResult = findConflict(existingMaterials, data.materials, 'material');
    const recipesResult = findConflict(existingRecipes, data.recipes, 'recipe');
    const categoriesResult = findConflict(existingCategories, data.categories, 'category');
    const historiesResult = findConflict(existingHistories, data.histories, 'history');
    const encyclopediaResult = findConflict(existingEncyclopedia, data.encyclopedia, 'encyclopedia');

    const allConflicts = [
      ...materialsResult.conflicts,
      ...recipesResult.conflicts,
      ...categoriesResult.conflicts,
      ...historiesResult.conflicts,
      ...encyclopediaResult.conflicts,
    ];

    setManualConflicts(allConflicts);
    setImportPreview({
      materials: materialsResult,
      recipes: recipesResult,
      categories: categoriesResult,
      histories: historiesResult,
      encyclopedia: encyclopediaResult,
    });
  }

  function handleConflictAction(action: 'skip' | 'overwrite' | 'add'): void {
    const updated = [...manualConflicts];
    updated[currentConflictIndex] = { ...updated[currentConflictIndex], action };
    setManualConflicts(updated);

    if (currentConflictIndex < manualConflicts.length - 1) {
      setCurrentConflictIndex(currentConflictIndex + 1);
    } else {
      setShowConflictStep(false);
    }
  }

  async function handleImport(): Promise<void> {
    if (!importData || !importPreview) return;

    setImporting(true);

    try {
      if (mergeStrategy === 'overwrite') {
        if (importData.materials.length > 0) {
          localStorage.setItem('incense_materials', JSON.stringify(importData.materials));
        }
        if (importData.recipes.length > 0) {
          localStorage.setItem('recipes', JSON.stringify(importData.recipes));
        }
        if (importData.categories.length > 0) {
          localStorage.setItem('categories', JSON.stringify(importData.categories));
        }
        if (importData.histories.length > 0) {
          localStorage.setItem('blend_history', JSON.stringify(importData.histories));
        }
        if (importData.encyclopedia.length > 0) {
          localStorage.setItem('incense_encyclopedia', JSON.stringify(importData.encyclopedia));
        }
      } else if (mergeStrategy === 'append' || mergeStrategy === 'manual') {
        const conflictMap = new Map(manualConflicts.map((c) => [`${c.type}:${c.id}`, c.action]));

        if (importData.materials.length > 0) {
          const existing = materialApi.getAll();
          const existingMap = new Map(existing.map((m) => [m.id, m]));
          const existingNameMap = new Map(existing.map((m) => [m.name.toLowerCase(), m]));
          const toAdd: IncenseMaterial[] = [];
          const toUpdate: Map<string, IncenseMaterial> = new Map();

          for (const item of importData.materials) {
            const key = `material:${item.id}`;
            const action = conflictMap.get(key);
            const byId = existingMap.get(item.id);
            const byName = existingNameMap.get(item.name.toLowerCase());

            if (action === 'overwrite') {
              if (byId) {
                toUpdate.set(item.id, { ...item, id: byId.id });
              } else if (byName) {
                toUpdate.set(byName.id, { ...item, id: byName.id });
              } else {
                toAdd.push(item);
              }
            } else if (action === 'add') {
              toAdd.push(item);
            } else if (!byId && !byName) {
              toAdd.push(item);
            }
          }

          const result = existing
            .map((m) => toUpdate.get(m.id) || m)
            .concat(toAdd);
          localStorage.setItem('incense_materials', JSON.stringify(result));
        }

        if (importData.recipes.length > 0) {
          const existing = recipeApi.getAll();
          const existingMap = new Map(existing.map((r) => [r.id, r]));
          const existingNameMap = new Map(existing.map((r) => [r.name.toLowerCase(), r]));
          const toAdd: Recipe[] = [];
          const toUpdate: Map<string, Recipe> = new Map();

          for (const item of importData.recipes) {
            const key = `recipe:${item.id}`;
            const action = conflictMap.get(key);
            const byId = existingMap.get(item.id);
            const byName = existingNameMap.get(item.name.toLowerCase());

            if (action === 'overwrite') {
              if (byId) {
                toUpdate.set(item.id, { ...item, id: byId.id, updatedAt: new Date().toISOString() });
              } else if (byName) {
                toUpdate.set(byName.id, { ...item, id: byName.id, updatedAt: new Date().toISOString() });
              } else {
                toAdd.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
              }
            } else if (action === 'add') {
              toAdd.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            } else if (!byId && !byName) {
              toAdd.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            }
          }

          const result = existing
            .map((r) => toUpdate.get(r.id) || r)
            .concat(toAdd);
          localStorage.setItem('recipes', JSON.stringify(result));
        }

        if (importData.categories.length > 0) {
          const existing = categoryApi.getAll();
          const existingMap = new Map(existing.map((c) => [c.id, c]));
          const existingNameMap = new Map(existing.map((c) => [c.name.toLowerCase(), c]));
          const toAdd: Category[] = [];
          const toUpdate: Map<string, Category> = new Map();

          for (const item of importData.categories) {
            const key = `category:${item.id}`;
            const action = conflictMap.get(key);
            const byId = existingMap.get(item.id);
            const byName = existingNameMap.get(item.name.toLowerCase());

            if (action === 'overwrite') {
              if (byId) {
                toUpdate.set(item.id, { ...item, id: byId.id });
              } else if (byName) {
                toUpdate.set(byName.id, { ...item, id: byName.id });
              } else {
                toAdd.push(item);
              }
            } else if (action === 'add') {
              toAdd.push(item);
            } else if (!byId && !byName) {
              toAdd.push(item);
            }
          }

          const result = existing
            .map((c) => toUpdate.get(c.id) || c)
            .concat(toAdd);
          localStorage.setItem('categories', JSON.stringify(result));
        }

        if (importData.histories.length > 0) {
          const existing = historyApi.getAll();
          const existingMap = new Map(existing.map((h) => [h.id, h]));
          const toAdd: BlendHistory[] = [];

          for (const item of importData.histories) {
            const key = `history:${item.id}`;
            const action = conflictMap.get(key);
            const byId = existingMap.get(item.id);

            if (action === 'overwrite' && byId) {
              continue;
            } else if (action === 'add') {
              toAdd.push(item);
            } else if (!byId) {
              toAdd.push(item);
            }
          }

          const result = existing.concat(toAdd);
          localStorage.setItem('blend_history', JSON.stringify(result));
        }

        if (importData.encyclopedia.length > 0) {
          const existing = encyclopediaApi.getAll();
          const existingMap = new Map(existing.map((e) => [e.id, e]));
          const existingNameMap = new Map(existing.map((e) => [e.name.toLowerCase(), e]));
          const toAdd: EncyclopediaEntry[] = [];
          const toUpdate: Map<string, EncyclopediaEntry> = new Map();

          for (const item of importData.encyclopedia) {
            const key = `encyclopedia:${item.id}`;
            const action = conflictMap.get(key);
            const byId = existingMap.get(item.id);
            const byName = existingNameMap.get(item.name.toLowerCase());

            if (action === 'overwrite') {
              if (byId) {
                toUpdate.set(item.id, { ...item, id: byId.id, updatedAt: new Date().toISOString() });
              } else if (byName) {
                toUpdate.set(byName.id, { ...item, id: byName.id, updatedAt: new Date().toISOString() });
              } else {
                toAdd.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
              }
            } else if (action === 'add') {
              toAdd.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            } else if (!byId && !byName) {
              toAdd.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            }
          }

          const result = existing
            .map((e) => toUpdate.get(e.id) || e)
            .concat(toAdd);
          localStorage.setItem('incense_encyclopedia', JSON.stringify(result));
        }
      }

      loadRecipes();
      loadCategories();
      loadHistories();

      notifications.show({
        title: '导入成功',
        message: '数据已成功导入',
        icon: <Check size={16} />,
        color: 'green',
      });

      onClose();
      resetImportState();
    } catch {
      notifications.show({
        title: '导入失败',
        message: '数据导入过程中出现错误',
        icon: <X size={16} />,
        color: 'red',
      });
    } finally {
      setImporting(false);
    }
  }

  function resetImportState(): void {
    setImportData(null);
    setImportPreview(null);
    setManualConflicts([]);
    setCurrentConflictIndex(0);
    setShowConflictStep(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleStartImport(): void {
    if (mergeStrategy === 'manual' && manualConflicts.length > 0) {
      setShowConflictStep(true);
      setCurrentConflictIndex(0);
    } else {
      handleImport();
    }
  }

  const totalAdd = importPreview
    ? importPreview.materials.add +
      importPreview.recipes.add +
      importPreview.categories.add +
      importPreview.histories.add +
      importPreview.encyclopedia.add
    : 0;

  const totalOverwrite = importPreview
    ? importPreview.materials.overwrite +
      importPreview.recipes.overwrite +
      importPreview.categories.overwrite +
      importPreview.histories.overwrite +
      importPreview.encyclopedia.overwrite
    : 0;

  const totalSkip = importPreview
    ? importPreview.materials.skip +
      importPreview.recipes.skip +
      importPreview.categories.skip +
      importPreview.histories.skip +
      importPreview.encyclopedia.skip
    : 0;

  const currentConflict = manualConflicts[currentConflictIndex];

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        resetImportState();
        setActiveTab('export');
      }}
      title={
        <Group gap="sm">
          <FileJson size={20} color="#8B6F4E" />
          <Text fw={600} size="lg" style={{ fontFamily: '"Noto Serif SC", serif', color: '#5A3E2B' }}>
            数据管理
          </Text>
        </Group>
      }
      size="xl"
      {...props}
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="export" leftSection={<Download size={16} />}>
            数据导出
          </Tabs.Tab>
          <Tabs.Tab value="import" leftSection={<Upload size={16} />}>
            数据导入
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="export">
          <Stack gap="lg">
            <Alert
              variant="light"
              color="amber"
              icon={<Info size={16} />}
              title="关于数据导出"
            >
              <Text size="sm">导出的数据为 JSON 格式，包含香材库、配方列表、分类、历史记录等所有数据。建议定期导出备份。</Text>
            </Alert>

            <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F5F1EB' }}>
              <Text fw={600} mb="md" size="sm" color="#5A3E2B">一键导出全部数据</Text>
              <Group mb="md">
                <Checkbox
                  label="香材库"
                  checked={exportOptions.materials}
                  onChange={(e) => setExportOptions({ ...exportOptions, materials: e.currentTarget.checked })}
                />
                <Checkbox
                  label="配方列表"
                  checked={exportOptions.recipes}
                  onChange={(e) => setExportOptions({ ...exportOptions, recipes: e.currentTarget.checked })}
                />
                <Checkbox
                  label="分类"
                  checked={exportOptions.categories}
                  onChange={(e) => setExportOptions({ ...exportOptions, categories: e.currentTarget.checked })}
                />
                <Checkbox
                  label="历史记录"
                  checked={exportOptions.histories}
                  onChange={(e) => setExportOptions({ ...exportOptions, histories: e.currentTarget.checked })}
                />
                <Checkbox
                  label="香材百科"
                  checked={exportOptions.encyclopedia}
                  onChange={(e) => setExportOptions({ ...exportOptions, encyclopedia: e.currentTarget.checked })}
                />
              </Group>
              <Button
                onClick={handleExportAll}
                leftSection={<Download size={16} />}
                style={{ backgroundColor: '#8B6F4E' }}
              >
                导出全部数据
              </Button>
            </Paper>

            <Divider label="或选择分项导出" labelPosition="center" />

            <Group grow>
              <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F5F1EB' }}>
                <Text fw={600} mb="xs" size="sm" color="#5A3E2B">仅导出配方</Text>
                <Text size="xs" c="dimmed" mb="md">导出所有配方数据及相关分类</Text>
                <Button
                  onClick={handleExportRecipes}
                  leftSection={<Download size={16} />}
                  variant="outline"
                  style={{ borderColor: '#8B6F4E', color: '#8B6F4E' }}
                  fullWidth
                >
                  导出配方
                </Button>
              </Paper>

              <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F5F1EB' }}>
                <Text fw={600} mb="xs" size="sm" color="#5A3E2B">仅导出香材库</Text>
                <Text size="xs" c="dimmed" mb="md">导出所有香材数据</Text>
                <Button
                  onClick={handleExportMaterials}
                  leftSection={<Download size={16} />}
                  variant="outline"
                  style={{ borderColor: '#8B6F4E', color: '#8B6F4E' }}
                  fullWidth
                >
                  导出香材库
                </Button>
              </Paper>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="import">
          {!showConflictStep ? (
            <Stack gap="lg">
              <Alert
                variant="light"
                color="red"
                icon={<AlertTriangle size={16} />}
                title="导入前请注意"
              >
                <Text size="sm">请确保导入的文件为正确的 JSON 格式。建议先导出当前数据作为备份后再执行导入操作。</Text>
              </Alert>

              <Group>
                <Button
                  component="label"
                  leftSection={<Upload size={16} />}
                  style={{ backgroundColor: '#8B6F4E' }}
                >
                  选择 JSON 文件
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </Button>
                <Button
                  variant="outline"
                  leftSection={<FileJson size={16} />}
                  onClick={handleDownloadTemplate}
                  style={{ borderColor: '#8B6F4E', color: '#8B6F4E' }}
                >
                  下载导入模板
                </Button>
              </Group>

              {importData && (
                <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F5F1EB' }}>
                  <Text fw={600} mb="md" size="sm" color="#5A3E2B">
                    文件信息
                  </Text>
                  <Group gap="lg" mb="md">
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">版本：</Text>
                      <Text size="sm">{importData.version}</Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">导出时间：</Text>
                      <Text size="sm">{new Date(importData.exportedAt).toLocaleString('zh-CN')}</Text>
                    </Group>
                  </Group>

                  <Text fw={600} mb="md" size="sm" color="#5A3E2B">
                    合并策略
                  </Text>
                  <Radio.Group value={mergeStrategy} onChange={(value) => {
                    setMergeStrategy(value as MergeStrategy);
                    if (importData) {
                      generatePreview(importData);
                    }
                  }}>
                    <Stack gap="sm">
                      <Radio
                        value="overwrite"
                        label="覆盖现有数据（全量替换现有数据）"
                        description="将使用导入文件中的数据完全替换现有数据，此操作不可恢复"
                      />
                      <Radio
                        value="append"
                        label="追加不重复（按名称/ID 去重）"
                        description="仅导入现有数据中不存在的条目，已存在的将被跳过"
                      />
                      <Radio
                        value="manual"
                        label="冲突时人工选择（逐条确认）"
                        description="当检测到冲突时，逐条确认是覆盖还是跳过"
                      />
                    </Stack>
                  </Radio.Group>

                  {importPreview && (
                    <>
                      <Divider my="md" />

                      <Text fw={600} mb="md" size="sm" color="#5A3E2B">
                        导入预览
                      </Text>

                      <Group gap="md" mb="md">
                        <Group gap="lg">
                          <Badge size="lg" color="green">
                            新增 {totalAdd} 条
                          </Badge>
                          <Badge size="lg" color="orange">
                            覆盖 {totalOverwrite} 条
                          </Badge>
                          <Badge size="lg" color="gray">
                            跳过 {totalSkip} 条
                          </Badge>
                        </Group>
                      </Group>

                      <ScrollArea h={240}>
                        <Table withTableBorder withColumnBorders>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>数据类型</Table.Th>
                              <Table.Th ta="center">新增</Table.Th>
                              <Table.Th ta="center">覆盖</Table.Th>
                              <Table.Th ta="center">跳过</Table.Th>
                              <Table.Th ta="center">总计</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            <Table.Tr>
                              <Table.Td>香材库</Table.Td>
                              <Table.Td ta="center">{importPreview.materials.add}</Table.Td>
                              <Table.Td ta="center">{importPreview.materials.overwrite}</Table.Td>
                              <Table.Td ta="center">{importPreview.materials.skip}</Table.Td>
                              <Table.Td ta="center" fw={600}>
                                {importData.materials.length}
                              </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>配方列表</Table.Td>
                              <Table.Td ta="center">{importPreview.recipes.add}</Table.Td>
                              <Table.Td ta="center">{importPreview.recipes.overwrite}</Table.Td>
                              <Table.Td ta="center">{importPreview.recipes.skip}</Table.Td>
                              <Table.Td ta="center" fw={600}>
                                {importData.recipes.length}
                              </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>分类</Table.Td>
                              <Table.Td ta="center">{importPreview.categories.add}</Table.Td>
                              <Table.Td ta="center">{importPreview.categories.overwrite}</Table.Td>
                              <Table.Td ta="center">{importPreview.categories.skip}</Table.Td>
                              <Table.Td ta="center" fw={600}>
                                {importData.categories.length}
                              </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>历史记录</Table.Td>
                              <Table.Td ta="center">{importPreview.histories.add}</Table.Td>
                              <Table.Td ta="center">{importPreview.histories.overwrite}</Table.Td>
                              <Table.Td ta="center">{importPreview.histories.skip}</Table.Td>
                              <Table.Td ta="center" fw={600}>
                                {importData.histories.length}
                              </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>香材百科</Table.Td>
                              <Table.Td ta="center">{importPreview.encyclopedia.add}</Table.Td>
                              <Table.Td ta="center">{importPreview.encyclopedia.overwrite}</Table.Td>
                              <Table.Td ta="center">{importPreview.encyclopedia.skip}</Table.Td>
                              <Table.Td ta="center" fw={600}>
                                {importData.encyclopedia.length}
                              </Table.Td>
                            </Table.Tr>
                          </Table.Tbody>
                        </Table>
                      </ScrollArea>

                      <Group mt="md" justify="flex-end">
                        <Button
                          variant="outline"
                          onClick={resetImportState}
                          style={{ borderColor: '#8B6F4E', color: '#8B6F4E' }}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleStartImport}
                          loading={importing}
                          style={{ backgroundColor: '#8B6F4E' }}
                        >
                          开始导入
                        </Button>
                      </Group>
                    </>
                  )}
                </Paper>
              )}
            </Stack>
          ) : (
            <Stack gap="lg">
              <Alert
                variant="light"
                color="orange"
                icon={<AlertTriangle size={16} />}
                title={`冲突处理 (${currentConflictIndex + 1}/${manualConflicts.length}`}
              >
                <Text size="sm">
                  检测到以下数据存在冲突，请选择处理方式
                </Text>
              </Alert>

              <Progress value={((currentConflictIndex + 1) / manualConflicts.length) * 100} color="#8B6F4E" mb="md" />

              <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#F5F1EB' }}>
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="sm" color="#5A3E2B">
                    {currentConflict?.name}
                  </Text>
                  <Badge color="orange">
                    {currentConflict?.type === 'material'
                      ? '香材'
                      : currentConflict?.type === 'recipe'
                      ? '配方'
                      : currentConflict?.type === 'category'
                      ? '分类'
                      : currentConflict?.type === 'history'
                      ? '历史记录'
                      : '百科条目'}
                  </Badge>
                </Group>

                <Group grow mb="md">
                  <Paper p="sm" withBorder radius="sm" style={{ backgroundColor: '#fff' }}>
                    <Text size="xs" c="dimmed" mb="xs">
                      现有数据
                    </Text>
                    <Text size="xs">ID: {currentConflict?.existing?.id}
                    </Text>
                    <Text size="xs">
                      名称: {currentConflict?.existing?.name}
                    </Text>
                  </Paper>
                  <Paper p="sm" withBorder radius="sm" style={{ backgroundColor: '#fff' }}>
                    <Text size="xs" c="dimmed" mb="xs">
                      导入数据
                    </Text>
                    <Text size="xs">ID: {currentConflict?.incoming?.id}
                    </Text>
                    <Text size="xs">
                      名称: {currentConflict?.incoming?.name}
                    </Text>
                  </Paper>
                </Group>

                <Group justify="center" gap="md">
                  <Button
                    variant="outline"
                    leftSection={<X size={16} />}
                    onClick={() => handleConflictAction('skip')}
                    style={{ borderColor: '#666', color: '#666' }}
                  >
                    跳过
                  </Button>
                  <Button
                    leftSection={<Check size={16} />}
                    onClick={() => handleConflictAction('overwrite')}
                    style={{ backgroundColor: '#8B6F4E' }}
                  >
                    覆盖
                  </Button>
                  <Button
                    variant="outline"
                    leftSection={<Upload size={16} />}
                    onClick={() => handleConflictAction('add')}
                    style={{ borderColor: '#228BE6', color: '#228BE6' }}
                  >
                    作为新条目添加
                  </Button>
                </Group>
              </Paper>

              <Group justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConflictStep(false);
                  }}
                  style={{ borderColor: '#8B6F4E', color: '#8B6F4E' }}
                >
                  返回
                </Button>
              </Group>
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
