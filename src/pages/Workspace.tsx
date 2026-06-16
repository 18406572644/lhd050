import { useEffect, useState } from 'react';
import {
  Grid, Select, Button, NumberInput, Slider, Modal,
  TextInput, Paper, Group, Text, Stack, ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Trash2, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useRecipeStore } from '@/store/recipeStore';
import DeviationAlert from '@/components/DeviationAlert';
import BalanceScale from '@/components/BalanceScale';
import MeasuringSpoon from '@/components/MeasuringSpoon';
import IncenseVessel from '@/components/IncenseVessel';
import AddMaterialModal from '@/components/AddMaterialModal';

export default function Workspace() {
  const items = useWorkspaceStore((s) => s.items);
  const materials = useWorkspaceStore((s) => s.materials);
  const targetTotal = useWorkspaceStore((s) => s.targetTotal);
  const deviation = useWorkspaceStore((s) => s.deviation);
  const status = useWorkspaceStore((s) => s.status);
  const loadMaterials = useWorkspaceStore((s) => s.loadMaterials);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const removeItem = useWorkspaceStore((s) => s.removeItem);
  const updateWeight = useWorkspaceStore((s) => s.updateWeight);
  const adjustWeight = useWorkspaceStore((s) => s.adjustWeight);
  const applyRecipe = useWorkspaceStore((s) => s.applyRecipe);
  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspace);
  const setTargetTotal = useWorkspaceStore((s) => s.setTargetTotal);
  const saveToHistory = useWorkspaceStore((s) => s.saveToHistory);
  const addCustomMaterial = useWorkspaceStore((s) => s.addCustomMaterial);

  const recipes = useRecipeStore((s) => s.recipes);
  const loadRecipes = useRecipeStore((s) => s.loadRecipes);
  const saveRecipe = useRecipeStore((s) => s.saveRecipe);

  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [saveOpened, { open: openSave, close: closeSave }] = useDisclosure(false);
  const [materialModalOpened, { open: openMaterialModal, close: closeMaterialModal }] = useDisclosure(false);
  const [recipeName, setRecipeName] = useState('');

  useEffect(() => {
    loadMaterials();
    loadRecipes();
  }, []);

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const materialOptions = materials
    .filter((m) => !items.find((i) => i.materialId === m.id))
    .map((m) => ({ value: m.id, label: m.name }));
  const recipeOptions = recipes.map((r) => ({ value: r.id, label: r.name }));

  const handleAddMaterial = () => {
    if (selectedMaterial) {
      addItem(selectedMaterial);
      setSelectedMaterial(null);
    }
  };

  const handleApplyRecipe = () => {
    if (!selectedRecipe) return;
    const recipe = recipes.find((r) => r.id === selectedRecipe);
    if (!recipe) return;
    applyRecipe(
      recipe.items.map((i) => ({
        materialId: i.materialId,
        materialName: i.materialName,
        weight: i.weight,
        color: i.color,
      }))
    );
    setSelectedRecipe(null);
  };

  const handleSave = () => {
    if (!recipeName.trim()) return;
    saveRecipe({
      name: recipeName,
      category: '',
      items: items.map((i) => ({
        materialId: i.materialId,
        materialName: i.materialName,
        weight: i.weight,
        percentage: totalWeight > 0 ? Math.round((i.weight / totalWeight) * 10000) / 100 : 0,
        color: i.color,
      })),
      totalWeight,
      notes: '',
    });
    saveToHistory(recipeName);
    setRecipeName('');
    closeSave();
  };

  return (
    <Stack gap="md" p="md">
      <DeviationAlert deviation={deviation} status={status} targetTotal={targetTotal} currentTotal={totalWeight} />

      <Grid gutter="md">
        <Grid.Col span={8}>
          <Stack gap="md">
            <BalanceScale leftWeight={totalWeight} rightWeight={targetTotal} />

            <Paper shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm" c="#8B6F4E">添加香材</Text>
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<Plus size={12} />}
                  style={{ borderColor: '#C4A882', color: '#8B6F4E' }}
                  onClick={openMaterialModal}
                >
                  录入新香材
                </Button>
              </Group>
              <Group>
                <Select
                  placeholder="选择香材"
                  data={materialOptions}
                  value={selectedMaterial}
                  onChange={setSelectedMaterial}
                  searchable
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={handleAddMaterial}
                  disabled={!selectedMaterial}
                  style={{ backgroundColor: '#C4A882' }}
                >
                  添加
                </Button>
              </Group>
            </Paper>

            <Paper shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
              <Text fw={600} size="sm" mb="sm" c="#8B6F4E">配比调整</Text>
              <Stack gap="sm">
                {items.map((item) => (
                  <Paper
                    key={item.materialId}
                    p="sm"
                    radius="sm"
                    style={{ backgroundColor: '#F5F1EB' }}
                  >
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                          }}
                        />
                        <Text size="sm" fw={500}>{item.materialName}</Text>
                      </Group>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        size="sm"
                        onClick={() => removeItem(item.materialId)}
                      >
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Group>
                    <Group align="flex-end" gap="md">
                      <NumberInput
                        value={item.weight}
                        onChange={(val) => updateWeight(item.materialId, Number(val) || 0)}
                        decimalScale={2}
                        min={0}
                        style={{ width: 100 }}
                        size="xs"
                      />
                      <Slider
                        value={item.weight}
                        onChange={(val) => updateWeight(item.materialId, val)}
                        min={0}
                        max={targetTotal}
                        step={0.1}
                        style={{ flex: 1 }}
                        size="sm"
                        color="#C4A882"
                      />
                      <MeasuringSpoon onScoop={(delta) => adjustWeight(item.materialId, delta)} materialId={item.materialId} />
                    </Group>
                  </Paper>
                ))}
              </Stack>

              {items.length > 0 && (
                <Group
                  justify="space-between"
                  mt="md"
                  pt="sm"
                  style={{ borderTop: '1px solid #E8E4E0' }}
                >
                  <Text size="sm" c="#8B6F4E" fw={600}>合计</Text>
                  <Text size="sm" fw={700}>{totalWeight.toFixed(2)} g</Text>
                </Group>
              )}
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={4}>
          <Stack gap="md">
            <IncenseVessel items={items} />

            <Paper shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
              <Text size="sm" fw={600} mb="xs" c="#8B6F4E">目标总量</Text>
              <NumberInput
                value={targetTotal}
                onChange={(val) => setTargetTotal(Number(val) || 0)}
                decimalScale={2}
                min={0}
                suffix=" g"
              />
            </Paper>

            <Stack gap="xs">
              <Button
                fullWidth
                style={{ backgroundColor: '#C4A882' }}
                onClick={openSave}
                disabled={items.length === 0}
              >
                保存配方
              </Button>
              <Button
                fullWidth
                variant="outline"
                color="red"
                onClick={clearWorkspace}
                disabled={items.length === 0}
              >
                清空工作台
              </Button>
              <Button
                fullWidth
                variant="outline"
                style={{ borderColor: '#C4A882', color: '#8B6F4E' }}
                onClick={() => saveToHistory('手动记录')}
                disabled={items.length === 0}
              >
                记录历史
              </Button>
            </Stack>

            <Paper shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
              <Text size="sm" fw={600} mb="xs" c="#8B6F4E">快速套用配方</Text>
              <Group>
                <Select
                  placeholder="选择配方"
                  data={recipeOptions}
                  value={selectedRecipe}
                  onChange={setSelectedRecipe}
                  searchable
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={handleApplyRecipe}
                  disabled={!selectedRecipe}
                  size="sm"
                  style={{ backgroundColor: '#C4A882' }}
                >
                  套用
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      <Modal opened={saveOpened} onClose={closeSave} title="保存配方" centered>
        <Stack>
          <TextInput
            label="配方名称"
            placeholder="请输入配方名称"
            value={recipeName}
            onChange={(e) => setRecipeName(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeSave}>取消</Button>
            <Button
              onClick={handleSave}
              disabled={!recipeName.trim()}
              style={{ backgroundColor: '#C4A882' }}
            >
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>

      <AddMaterialModal
        opened={materialModalOpened}
        onClose={closeMaterialModal}
        onAdd={addCustomMaterial}
      />
    </Stack>
  );
}
