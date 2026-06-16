import { useEffect, useState, useMemo } from 'react';
import {
  TextInput, SimpleGrid, Paper, Badge, Group, Text, Stack, Button,
  ActionIcon, Drawer, NumberInput, Textarea, Select, Modal, ColorInput,
  Collapse, MultiSelect, SegmentedControl, Divider, Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
  Search, Plus, X, Pencil, Trash2, Download, LayoutGrid, List,
  Save, Filter, Clock, Scale, Leaf,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from '@/store/recipeStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import type { Recipe, RecipeItem } from '@/types';

export default function Recipes() {
  const navigate = useNavigate();
  const recipes = useRecipeStore((s) => s.recipes);
  const categories = useRecipeStore((s) => s.categories);
  const activeCategory = useRecipeStore((s) => s.activeCategory);
  const searchQuery = useRecipeStore((s) => s.searchQuery);
  const viewMode = useRecipeStore((s) => s.viewMode);
  const advancedFilter = useRecipeStore((s) => s.advancedFilter);
  const filterPresets = useRecipeStore((s) => s.filterPresets);
  const advancedSearchOpen = useRecipeStore((s) => s.advancedSearchOpen);
  const loadRecipes = useRecipeStore((s) => s.loadRecipes);
  const loadCategories = useRecipeStore((s) => s.loadCategories);
  const setActiveCategory = useRecipeStore((s) => s.setActiveCategory);
  const setSearchQuery = useRecipeStore((s) => s.setSearchQuery);
  const setViewMode = useRecipeStore((s) => s.setViewMode);
  const setAdvancedFilter = useRecipeStore((s) => s.setAdvancedFilter);
  const resetAdvancedFilter = useRecipeStore((s) => s.resetAdvancedFilter);
  const setAdvancedSearchOpen = useRecipeStore((s) => s.setAdvancedSearchOpen);
  const addFilterPreset = useRecipeStore((s) => s.addFilterPreset);
  const deleteFilterPreset = useRecipeStore((s) => s.deleteFilterPreset);
  const applyFilterPreset = useRecipeStore((s) => s.applyFilterPreset);
  const getFilteredRecipes = useRecipeStore((s) => s.getFilteredRecipes);
  const saveRecipe = useRecipeStore((s) => s.saveRecipe);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const addCategory = useRecipeStore((s) => s.addCategory);
  const deleteCategory = useRecipeStore((s) => s.deleteCategory);
  const applyRecipe = useWorkspaceStore((s) => s.applyRecipe);
  const workspaceItems = useWorkspaceStore((s) => s.items);

  const [catModalOpened, { open: openCatModal, close: closeCatModal }] = useDisclosure(false);
  const [importModalOpened, { open: openImportModal, close: closeImportModal }] = useDisclosure(false);
  const [presetModalOpened, { open: openPresetModal, close: closePresetModal }] = useDisclosure(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#C4A882');
  const [importName, setImportName] = useState('');
  const [importCategory, setImportCategory] = useState<string | null>(null);
  const [importNotes, setImportNotes] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<RecipeItem[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => { loadRecipes(); loadCategories(); }, []);

  const filtered = getFilteredRecipes();
  const categorySelectData = categories.map((c) => ({ value: c.id, label: c.name }));

  const materialOptions = useMemo(() => {
    const materials = new Map<string, string>();
    recipes.forEach((r) => {
      r.items.forEach((i) => {
        if (!materials.has(i.materialId)) {
          materials.set(i.materialId, i.materialName);
        }
      });
    });
    return Array.from(materials.entries()).map(([value, label]) => ({ value, label }));
  }, [recipes]);

  const hasActiveFilters = useMemo(() => {
    return (
      advancedFilter.includeMaterials.length > 0 ||
      advancedFilter.excludeMaterials.length > 0 ||
      advancedFilter.weightMin !== null ||
      advancedFilter.weightMax !== null ||
      advancedFilter.materialCountMin !== null ||
      advancedFilter.materialCountMax !== null ||
      advancedFilter.datePreset !== null ||
      advancedFilter.deviationMax !== null
    );
  }, [advancedFilter]);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    setNewCatColor('#C4A882');
    closeCatModal();
  };

  const handleApply = (recipe: Recipe) => {
    applyRecipe(recipe.items.map((i) => ({
      materialId: i.materialId, materialName: i.materialName, weight: i.weight, color: i.color,
    })));
    navigate('/');
  };

  const handleDelete = (id: string) => {
    deleteRecipe(id);
    setDeleteConfirm(null);
  };

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setEditName(recipe.name);
    setEditCategory(recipe.category || null);
    setEditItems([...recipe.items]);
    setEditNotes(recipe.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingRecipe) return;
    const total = editItems.reduce((s, i) => s + i.weight, 0);
    updateRecipe(editingRecipe.id, {
      name: editName,
      category: editCategory || '',
      items: editItems.map((i) => ({
        ...i,
        percentage: total > 0 ? Math.round((i.weight / total) * 10000) / 100 : 0,
      })),
      totalWeight: total,
      notes: editNotes,
    });
    setEditingRecipe(null);
  };

  const handleRemoveEditItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const handleImportSave = () => {
    if (!importName.trim() || workspaceItems.length === 0) return;
    const total = workspaceItems.reduce((s, i) => s + i.weight, 0);
    saveRecipe({
      name: importName,
      category: importCategory || '',
      items: workspaceItems.map((i) => ({
        materialId: i.materialId,
        materialName: i.materialName,
        weight: i.weight,
        percentage: total > 0 ? Math.round((i.weight / total) * 10000) / 100 : 0,
        color: i.color,
      })),
      totalWeight: total,
      notes: importNotes,
    });
    setImportName('');
    setImportCategory(null);
    setImportNotes('');
    closeImportModal();
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    addFilterPreset(presetName.trim(), advancedFilter);
    setPresetName('');
    closePresetModal();
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat?.name || '';
  };

  const getCategoryColor = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat?.color || '#C4A882';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const renderCardView = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {filtered.map((recipe) => (
        <Paper key={recipe.id} shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
          <Group justify="space-between" mb={4}>
            <Text fw={700} style={{ fontFamily: '"Noto Serif SC", serif' }}>{recipe.name}</Text>
            {recipe.category && (
              <Badge size="sm" variant="light" color={getCategoryColor(recipe.category)}>
                {getCategoryName(recipe.category)}
              </Badge>
            )}
          </Group>

          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            {recipe.items.map((item) => (
              <div
                key={item.materialId}
                style={{ width: `${item.percentage}%`, backgroundColor: item.color, minWidth: 2 }}
              />
            ))}
          </div>

          <Text size="xs" c="dimmed" mb={4}>总量 {recipe.totalWeight}g</Text>
          {recipe.notes && (
            <Text size="xs" c="dimmed" lineClamp={2} mb={4}>{recipe.notes}</Text>
          )}
          <Text size="xs" c="dimmed" mb={8}>
            {formatDate(recipe.updatedAt)}
          </Text>

          <Group gap="xs">
            <Button size="xs" style={{ backgroundColor: '#C4A882' }} onClick={() => handleApply(recipe)}>套用</Button>
            <Button size="xs" variant="outline" style={{ borderColor: '#C4A882', color: '#8B6F4E' }} onClick={() => openEdit(recipe)}>
              <Pencil size={12} />
            </Button>
            {deleteConfirm === recipe.id ? (
              <Group gap={4}>
                <Button size="xs" color="red" onClick={() => handleDelete(recipe.id)}>确认</Button>
                <Button size="xs" variant="subtle" onClick={() => setDeleteConfirm(null)}>取消</Button>
              </Group>
            ) : (
              <Button size="xs" variant="outline" color="red" onClick={() => setDeleteConfirm(recipe.id)}>
                <Trash2 size={12} />
              </Button>
            )}
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );

  const renderListView = () => (
    <Paper shadow="xs" radius="md" style={{ backgroundColor: '#fff', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#faf7f2', borderBottom: '1px solid #e8e0d5' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>配方名称</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>分类</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>香材</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>总重</th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>香材数</th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>更新时间</th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, fontSize: '0.875rem', color: '#5c4a32' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((recipe, idx) => (
              <tr
                key={recipe.id}
                style={{
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f0ebe3' : 'none',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fdfaf5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <td style={{ padding: '10px 12px' }}>
                  <Text fw={600} size="sm" style={{ fontFamily: '"Noto Serif SC", serif' }}>{recipe.name}</Text>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {recipe.category ? (
                    <Badge size="sm" variant="light" color={getCategoryColor(recipe.category)}>
                      {getCategoryName(recipe.category)}
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">-</Text>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Group gap={4} wrap="nowrap">
                    {recipe.items.slice(0, 3).map((item) => (
                      <Tooltip key={item.materialId} label={item.materialName} position="top">
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                        />
                      </Tooltip>
                    ))}
                    {recipe.items.length > 3 && (
                      <Text size="xs" c="dimmed">+{recipe.items.length - 3}</Text>
                    )}
                  </Group>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <Text size="sm" fw={500}>{recipe.totalWeight}g</Text>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <Text size="sm">{recipe.items.length} 种</Text>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <Text size="xs" c="dimmed">{formatDate(recipe.updatedAt)}</Text>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Group gap={4} justify="center">
                    <Button size="xs" style={{ backgroundColor: '#C4A882' }} onClick={() => handleApply(recipe)}>套用</Button>
                    <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => openEdit(recipe)}>
                      <Pencil size={14} />
                    </ActionIcon>
                    {deleteConfirm === recipe.id ? (
                      <Group gap={2}>
                        <Button size="xs" color="red" onClick={() => handleDelete(recipe.id)}>确认</Button>
                        <Button size="xs" variant="subtle" onClick={() => setDeleteConfirm(null)}>取消</Button>
                      </Group>
                    ) : (
                      <ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDeleteConfirm(recipe.id)}>
                        <Trash2 size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  );

  return (
    <Stack gap="md" p="md">
      <Group gap={6} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        <Badge
          variant={activeCategory === null ? 'filled' : 'outline'}
          style={activeCategory === null ? { backgroundColor: '#C4A882', color: '#fff' } : { borderColor: '#C4A882', color: '#8B6F4E' }}
          size="lg"
          onClick={() => setActiveCategory(null)}
          styles={{ root: { cursor: 'pointer', flexShrink: 0 } }}
        >
          全部
        </Badge>
        {categories.map((cat) => (
          <Group key={cat.id} gap={4} style={{ position: 'relative', flexShrink: 0 }}>
            <Badge
              variant={activeCategory === cat.id ? 'filled' : 'outline'}
              style={activeCategory === cat.id
                ? { backgroundColor: cat.color || '#C4A882', color: '#fff' }
                : { borderColor: cat.color || '#C4A882', color: cat.color || '#8B6F4E' }}
              size="lg"
              onClick={() => setActiveCategory(cat.id)}
              styles={{ root: { cursor: 'pointer', paddingRight: activeCategory === cat.id ? 8 : 12 } }}
            >
              {cat.name}
            </Badge>
            <ActionIcon
              size="xs"
              color="gray"
              variant="subtle"
              onClick={() => deleteCategory(cat.id)}
              style={{ position: 'absolute', top: -4, right: -4, opacity: 0.5 }}
              className="cat-delete-btn"
            >
              <X size={10} />
            </ActionIcon>
          </Group>
        ))}
        <ActionIcon
          variant="outline"
          style={{ borderColor: '#C4A882', color: '#8B6F4E', flexShrink: 0 }}
          size="lg"
          onClick={openCatModal}
        >
          <Plus size={16} />
        </ActionIcon>
      </Group>

      <Group gap="xs" align="flex-start">
        <TextInput
          placeholder="搜索配方名称或香材…"
          leftSection={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant={advancedSearchOpen ? 'filled' : 'outline'}
          leftSection={<Filter size={16} />}
          onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
          style={advancedSearchOpen ? { backgroundColor: '#C4A882' } : { borderColor: '#C4A882', color: '#8B6F4E' }}
        >
          高级搜索
          {hasActiveFilters && <Badge size="xs" circle style={{ marginLeft: 6, backgroundColor: '#e74c3c' }}>!</Badge>}
        </Button>
        <SegmentedControl
          value={viewMode}
          onChange={(v) => setViewMode(v as 'card' | 'list')}
          data={[
            { value: 'card', label: <LayoutGrid size={16} /> },
            { value: 'list', label: <List size={16} /> },
          ]}
          size="md"
          styles={{
            root: { borderColor: '#e8e0d5' },
            indicator: { backgroundColor: '#C4A882' },
          }}
        />
      </Group>

      <Collapse in={advancedSearchOpen}>
        <Paper p="md" radius="md" shadow="xs" style={{ backgroundColor: '#fdfaf5' }}>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text fw={600} size="sm" style={{ color: '#5c4a32' }}>高级筛选</Text>
              <Group gap="xs">
                {filterPresets.length > 0 && (
                  <Group gap={4} align="flex-end">
                    <Select
                      placeholder="选择预设"
                      data={filterPresets.map((p) => ({ value: p.id, label: p.name }))}
                      size="xs"
                      style={{ width: 140 }}
                      value={selectedPresetId}
                      onChange={(val) => {
                        setSelectedPresetId(val);
                        if (val) applyFilterPreset(val);
                      }}
                      clearable
                    />
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      disabled={!selectedPresetId}
                      onClick={() => {
                        if (selectedPresetId) {
                          deleteFilterPreset(selectedPresetId);
                          setSelectedPresetId(null);
                        }
                      }}
                      title="删除选中的预设"
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>
                )}
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<Save size={12} />}
                  style={{ borderColor: '#C4A882', color: '#8B6F4E' }}
                  onClick={openPresetModal}
                >
                  保存预设
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={resetAdvancedFilter}
                >
                  重置
                </Button>
              </Group>
            </Group>

            <Divider style={{ borderColor: '#e8e0d5' }} />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Stack gap="xs">
                <Group gap={4}>
                  <Leaf size={14} style={{ color: '#8B6F4E' }} />
                  <Text size="sm" fw={500} style={{ color: '#5c4a32' }}>香材筛选</Text>
                </Group>
                <MultiSelect
                  label="包含香材"
                  placeholder="选择必须包含的香材"
                  data={materialOptions}
                  value={advancedFilter.includeMaterials}
                  onChange={(val) => setAdvancedFilter({ includeMaterials: val })}
                  size="xs"
                  searchable
                  clearable
                  maxDropdownHeight={200}
                  styles={{
                    input: { fontSize: '0.75rem' },
                    label: { fontSize: '0.75rem', marginBottom: 4 },
                  }}
                />
                <MultiSelect
                  label="排除香材"
                  placeholder="选择不能包含的香材"
                  data={materialOptions}
                  value={advancedFilter.excludeMaterials}
                  onChange={(val) => setAdvancedFilter({ excludeMaterials: val })}
                  size="xs"
                  searchable
                  clearable
                  maxDropdownHeight={200}
                  styles={{
                    input: { fontSize: '0.75rem' },
                    label: { fontSize: '0.75rem', marginBottom: 4 },
                  }}
                />
              </Stack>

              <Stack gap="xs">
                <Group gap={4}>
                  <Scale size={14} style={{ color: '#8B6F4E' }} />
                  <Text size="sm" fw={500} style={{ color: '#5c4a32' }}>重量范围</Text>
                </Group>
                <Group gap="xs" grow>
                  <NumberInput
                    label="最小 (g)"
                    placeholder="不限"
                    value={advancedFilter.weightMin}
                    onChange={(v) => setAdvancedFilter({ weightMin: v === '' ? null : Number(v) })}
                    size="xs"
                    min={0}
                    decimalScale={2}
                    styles={{
                      input: { fontSize: '0.75rem' },
                      label: { fontSize: '0.75rem', marginBottom: 4 },
                    }}
                  />
                  <NumberInput
                    label="最大 (g)"
                    placeholder="不限"
                    value={advancedFilter.weightMax}
                    onChange={(v) => setAdvancedFilter({ weightMax: v === '' ? null : Number(v) })}
                    size="xs"
                    min={0}
                    decimalScale={2}
                    styles={{
                      input: { fontSize: '0.75rem' },
                      label: { fontSize: '0.75rem', marginBottom: 4 },
                    }}
                  />
                </Group>

                <Group gap={4} mt={8}>
                  <Leaf size={14} style={{ color: '#8B6F4E' }} />
                  <Text size="sm" fw={500} style={{ color: '#5c4a32' }}>香材数量</Text>
                </Group>
                <Group gap="xs" grow>
                  <NumberInput
                    label="最少"
                    placeholder="不限"
                    value={advancedFilter.materialCountMin}
                    onChange={(v) => setAdvancedFilter({ materialCountMin: v === '' ? null : Number(v) })}
                    size="xs"
                    min={1}
                    styles={{
                      input: { fontSize: '0.75rem' },
                      label: { fontSize: '0.75rem', marginBottom: 4 },
                    }}
                  />
                  <NumberInput
                    label="最多"
                    placeholder="不限"
                    value={advancedFilter.materialCountMax}
                    onChange={(v) => setAdvancedFilter({ materialCountMax: v === '' ? null : Number(v) })}
                    size="xs"
                    min={1}
                    styles={{
                      input: { fontSize: '0.75rem' },
                      label: { fontSize: '0.75rem', marginBottom: 4 },
                    }}
                  />
                </Group>
              </Stack>

              <Stack gap="xs">
                <Group gap={4}>
                  <Clock size={14} style={{ color: '#8B6F4E' }} />
                  <Text size="sm" fw={500} style={{ color: '#5c4a32' }}>更新时间</Text>
                </Group>
                <SegmentedControl
                  value={advancedFilter.datePreset || 'all'}
                  onChange={(val) => {
                    if (val === 'all') {
                      setAdvancedFilter({ datePreset: null, dateRangeStart: null, dateRangeEnd: null });
                    } else {
                      setAdvancedFilter({ datePreset: val as '7d' | '30d' | 'custom' });
                    }
                  }}
                  data={[
                    { value: 'all', label: '全部' },
                    { value: '7d', label: '最近7天' },
                    { value: '30d', label: '最近30天' },
                    { value: 'custom', label: '自定义' },
                  ]}
                  size="xs"
                  styles={{
                    root: { flex: 1 },
                    indicator: { backgroundColor: '#C4A882' },
                  }}
                />
                {advancedFilter.datePreset === 'custom' && (
                  <Group gap="xs" grow>
                    <DatePickerInput
                      label="开始日期"
                      placeholder="选择日期"
                      value={advancedFilter.dateRangeStart ? new Date(advancedFilter.dateRangeStart) : null}
                      onChange={(date) => setAdvancedFilter({
                        dateRangeStart: date ? date.toISOString().split('T')[0] : null,
                      })}
                      size="xs"
                      styles={{
                        input: { fontSize: '0.75rem' },
                        label: { fontSize: '0.75rem', marginBottom: 4 },
                      }}
                    />
                    <DatePickerInput
                      label="结束日期"
                      placeholder="选择日期"
                      value={advancedFilter.dateRangeEnd ? new Date(advancedFilter.dateRangeEnd) : null}
                      onChange={(date) => setAdvancedFilter({
                        dateRangeEnd: date ? date.toISOString().split('T')[0] : null,
                      })}
                      size="xs"
                      styles={{
                        input: { fontSize: '0.75rem' },
                        label: { fontSize: '0.75rem', marginBottom: 4 },
                      }}
                    />
                  </Group>
                )}
              </Stack>

              <Stack gap="xs">
                <Group gap={4}>
                  <Scale size={14} style={{ color: '#8B6F4E' }} />
                  <Text size="sm" fw={500} style={{ color: '#5c4a32' }}>偏差状态</Text>
                </Group>
                <Select
                  label="历史平均偏差"
                  placeholder="不限"
                  data={[
                    { value: '1', label: '小于 1%' },
                    { value: '2', label: '小于 2%' },
                    { value: '3', label: '小于 3%' },
                    { value: '5', label: '小于 5%' },
                  ]}
                  value={advancedFilter.deviationMax?.toString() || null}
                  onChange={(val) => setAdvancedFilter({
                    deviationMax: val ? Number(val) : null,
                  })}
                  size="xs"
                  clearable
                  styles={{
                    input: { fontSize: '0.75rem' },
                    label: { fontSize: '0.75rem', marginBottom: 4 },
                  }}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  仅筛选有历史调配记录的配方
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Paper>
      </Collapse>

      <Group justify="flex-end">
        <Button
          size="sm"
          leftSection={<Download size={14} />}
          style={{ backgroundColor: '#C4A882' }}
          onClick={openImportModal}
          disabled={workspaceItems.length === 0}
        >
          从工作台导入
        </Button>
      </Group>

      {viewMode === 'card' ? renderCardView() : renderListView()}

      {filtered.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">暂无配方</Text>
      )}

      <Modal opened={catModalOpened} onClose={closeCatModal} title="新增分类" centered>
        <Stack>
          <TextInput label="分类名称" value={newCatName} onChange={(e) => setNewCatName(e.currentTarget.value)} />
          <ColorInput label="分类颜色" value={newCatColor} onChange={setNewCatColor} />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeCatModal}>取消</Button>
            <Button onClick={handleAddCategory} disabled={!newCatName.trim()} style={{ backgroundColor: '#C4A882' }}>添加</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={importModalOpened} onClose={closeImportModal} title="从工作台导入配方" centered>
        <Stack>
          <TextInput label="配方名称" value={importName} onChange={(e) => setImportName(e.currentTarget.value)} />
          <Select label="分类" data={categorySelectData} value={importCategory} onChange={setImportCategory} clearable />
          <Textarea label="备注" value={importNotes} onChange={(e) => setImportNotes(e.currentTarget.value)} autosize minRows={2} />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeImportModal}>取消</Button>
            <Button onClick={handleImportSave} disabled={!importName.trim() || workspaceItems.length === 0} style={{ backgroundColor: '#C4A882' }}>保存</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={presetModalOpened} onClose={closePresetModal} title="保存筛选预设" centered>
        <Stack>
          <TextInput
            label="预设名称"
            placeholder="例如：常用小批量配方"
            value={presetName}
            onChange={(e) => setPresetName(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closePresetModal}>取消</Button>
            <Button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              style={{ backgroundColor: '#C4A882' }}
            >
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Drawer opened={!!editingRecipe} onClose={() => setEditingRecipe(null)} title="编辑配方" position="right">
        {editingRecipe && (
          <Stack>
            <TextInput label="配方名称" value={editName} onChange={(e) => setEditName(e.currentTarget.value)} />
            <Select label="分类" data={categorySelectData} value={editCategory} onChange={setEditCategory} clearable />
            <Stack gap="xs">
              <Text size="sm" fw={500}>配方项目</Text>
              {editItems.map((item, idx) => (
                <Group key={item.materialId} gap="xs" align="flex-end">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                  <Text size="sm" style={{ flex: 1 }}>{item.materialName}</Text>
                  <NumberInput value={item.weight} onChange={(v) => {
                    const next = [...editItems];
                    next[idx] = { ...next[idx], weight: Number(v) || 0 };
                    setEditItems(next);
                  }} decimalScale={2} min={0} style={{ width: 90 }} size="xs" />
                  <ActionIcon size="sm" color="red" variant="subtle" onClick={() => handleRemoveEditItem(idx)}>
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
            <Textarea label="备注" value={editNotes} onChange={(e) => setEditNotes(e.currentTarget.value)} autosize minRows={3} />
            <Button fullWidth style={{ backgroundColor: '#C4A882' }} onClick={handleSaveEdit}>保存修改</Button>
          </Stack>
        )}
      </Drawer>
    </Stack>
  );
}
