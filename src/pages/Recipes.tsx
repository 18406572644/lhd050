import { useEffect, useState } from 'react';
import {
  TextInput, SimpleGrid, Paper, Badge, Group, Text, Stack, Button,
  ActionIcon, Drawer, NumberInput, Textarea, Select, Modal, ColorInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Search, Plus, X, Pencil, Trash2, Download } from 'lucide-react';
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
  const loadRecipes = useRecipeStore((s) => s.loadRecipes);
  const loadCategories = useRecipeStore((s) => s.loadCategories);
  const setActiveCategory = useRecipeStore((s) => s.setActiveCategory);
  const setSearchQuery = useRecipeStore((s) => s.setSearchQuery);
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

  useEffect(() => { loadRecipes(); loadCategories(); }, []);

  const filtered = getFilteredRecipes();
  const categorySelectData = categories.map((c) => ({ value: c.id, label: c.name }));

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

      <TextInput
        placeholder="搜索配方名称或香材…"
        leftSection={<Search size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {filtered.map((recipe) => (
          <Paper key={recipe.id} shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
            <Group justify="space-between" mb={4}>
              <Text fw={700} style={{ fontFamily: '"Noto Serif SC", serif' }}>{recipe.name}</Text>
              {recipe.category && (() => {
                const cat = categories.find((c) => c.id === recipe.category);
                return cat ? (
                  <Badge size="sm" variant="light" color={cat.color || '#C4A882'}>{cat.name}</Badge>
                ) : null;
              })()}
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
              {new Date(recipe.updatedAt).toLocaleDateString('zh-CN')}
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
