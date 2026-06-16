import { useState } from 'react';
import {
  Modal, TextInput, Select, NumberInput, Textarea, Stack, Group, Button,
  Checkbox, Divider, Text, Chip,
} from '@mantine/core';
import { MATERIAL_CATEGORY_LABELS, INCENSE_FORM_LABELS } from '@/types';
import type { MaterialCategory, IncenseForm } from '@/types';
import type { EncyclopediaEntry } from '@/types';

interface AddMaterialModalProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (material: {
    name: string;
    category: MaterialCategory;
    color: string;
    pricePerGram?: number;
    description?: string;
  }) => void;
  onAddWithEncyclopedia?: (material: {
    name: string;
    category: MaterialCategory;
    color: string;
    pricePerGram?: number;
    description?: string;
  }, encyclopedia: Omit<EncyclopediaEntry, 'id' | 'contributor' | 'createdAt' | 'updatedAt' | 'materialId'>) => void;
}

const COLOR_OPTIONS = [
  '#C4A882', '#8B6F4E', '#A0522D', '#6B8E23', '#D4756B',
  '#DAA520', '#F5DEB3', '#D2B48C', '#E0E8F0', '#8FBC8F',
  '#DEB887', '#B8860B',
];

const categoryData = Object.entries(MATERIAL_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const formOptions = Object.entries(INCENSE_FORM_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const defaultScentTags = ['温暖', '清凉', '甜美', '浓郁', '清淡', '木质', '花香', '树脂', '草本', '安神', '提神', '舒缓'];

export default function AddMaterialModal({ opened, onClose, onAdd, onAddWithEncyclopedia }: AddMaterialModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>('other');
  const [color, setColor] = useState('#C4A882');
  const [pricePerGram, setPricePerGram] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [createEncyclopedia, setCreateEncyclopedia] = useState(false);

  const [aliases, setAliases] = useState('');
  const [origin, setOrigin] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [topNote, setTopNote] = useState('');
  const [middleNote, setMiddleNote] = useState('');
  const [baseNote, setBaseNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pairingGood, setPairingGood] = useState('');
  const [pairingAvoid, setPairingAvoid] = useState('');
  const [dosageRange, setDosageRange] = useState('');
  const [grindingNotes, setGrindingNotes] = useState('');
  const [suitableForms, setSuitableForms] = useState<string[]>([]);
  const [historyText, setHistoryText] = useState('');
  const [poetryText, setPoetryText] = useState('');
  const [traditionalUse, setTraditionalUse] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('other');
    setColor('#C4A882');
    setPricePerGram(undefined);
    setDescription('');
    setCreateEncyclopedia(false);
    setAliases('');
    setOrigin('');
    setPriceRange('');
    setTopNote('');
    setMiddleNote('');
    setBaseNote('');
    setSelectedTags([]);
    setPairingGood('');
    setPairingAvoid('');
    setDosageRange('');
    setGrindingNotes('');
    setSuitableForms([]);
    setHistoryText('');
    setPoetryText('');
    setTraditionalUse('');
  };

  const handleSubmit = () => {
    if (!name.trim() || !category) return;

    const materialData = {
      name: name.trim(),
      category: category as MaterialCategory,
      color,
      pricePerGram,
      description: description.trim() || undefined,
    };

    if (createEncyclopedia && onAddWithEncyclopedia) {
      const encyclopediaData = {
        name: name.trim(),
        aliases: aliases.split(/[,，、]/).map(s => s.trim()).filter(Boolean),
        category: category as MaterialCategory,
        origin: origin.trim(),
        priceRange: priceRange.trim() || (pricePerGram ? `${pricePerGram}元/克` : ''),
        color,
        fragranceNotes: {
          top: topNote.trim() || undefined,
          middle: middleNote.trim() || undefined,
          base: baseNote.trim() || undefined,
        },
        scentTags: selectedTags,
        pairingGood: pairingGood.split(/[,，、]/).map(s => s.trim()).filter(Boolean),
        pairingAvoid: pairingAvoid.split(/[,，、]/).map(s => s.trim()).filter(Boolean),
        usageTips: {
          dosageRange: dosageRange.trim(),
          grindingNotes: grindingNotes.trim(),
          suitableForms: suitableForms as IncenseForm[],
        },
        culturalBackground: {
          history: historyText.trim() || undefined,
          poetry: poetryText.trim() || undefined,
          traditionalUse: traditionalUse.trim() || undefined,
        },
      };
      onAddWithEncyclopedia(materialData, encyclopediaData);
    } else {
      onAdd(materialData);
    }

    resetForm();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="录入香材" centered size="lg">
      <Stack>
        <TextInput
          label="香材名称"
          placeholder="如：沉香、檀香"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <Select
          label="类型"
          data={categoryData}
          value={category}
          onChange={setCategory}
        />
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#8B6F4E' }}>颜色标记</div>
          <Group gap={6}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid #5A3E2B' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  outline: 'none',
                }}
              />
            ))}
          </Group>
        </div>
        <NumberInput
          label="单价（元/克）"
          value={pricePerGram}
          onChange={(v) => setPricePerGram(v === '' ? undefined : Number(v))}
          decimalScale={2}
          min={0}
        />
        <Textarea
          label="描述"
          placeholder="香材特性说明"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <Checkbox
          label="同时创建百科词条"
          checked={createEncyclopedia}
          onChange={(e) => setCreateEncyclopedia(e.currentTarget.checked)}
          style={{ color: '#8B6F4E' }}
        />

        {createEncyclopedia && (
          <>
            <Divider my="sm" />
            <Text fw={600} size="sm" style={{ color: '#5A3E2B', fontFamily: '"Noto Serif SC", serif' }}>
              百科信息（选填）
            </Text>

            <TextInput
              label="别名"
              placeholder="多个别名用逗号分隔"
              value={aliases}
              onChange={(e) => setAliases(e.currentTarget.value)}
            />

            <TextInput
              label="产地"
              placeholder="如：印度、海南"
              value={origin}
              onChange={(e) => setOrigin(e.currentTarget.value)}
            />

            <TextInput
              label="价格区间"
              placeholder="如：2-10元/克"
              value={priceRange}
              onChange={(e) => setPriceRange(e.currentTarget.value)}
            />

            <Group grow>
              <TextInput
                label="前调"
                placeholder="清淡..."
                value={topNote}
                onChange={(e) => setTopNote(e.currentTarget.value)}
              />
              <TextInput
                label="中调"
                placeholder="浓郁..."
                value={middleNote}
                onChange={(e) => setMiddleNote(e.currentTarget.value)}
              />
              <TextInput
                label="后调"
                placeholder="深沉..."
                value={baseNote}
                onChange={(e) => setBaseNote(e.currentTarget.value)}
              />
            </Group>

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#8B6F4E' }}>气味关键词</div>
              <Chip.Group multiple value={selectedTags} onChange={setSelectedTags as any}>
                <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                  {defaultScentTags.map((tag) => (
                    <Chip key={tag} value={tag} size="xs" variant="light" color="yellow">
                      {tag}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </div>

            <TextInput
              label="相宜配伍"
              placeholder="用逗号分隔，如：沉香、乳香"
              value={pairingGood}
              onChange={(e) => setPairingGood(e.currentTarget.value)}
            />

            <TextInput
              label="相克避免"
              placeholder="用逗号分隔"
              value={pairingAvoid}
              onChange={(e) => setPairingAvoid(e.currentTarget.value)}
            />

            <TextInput
              label="建议用量"
              placeholder="如：5%-20%"
              value={dosageRange}
              onChange={(e) => setDosageRange(e.currentTarget.value)}
            />

            <Textarea
              label="研磨注意"
              placeholder="研磨炮制注意事项"
              value={grindingNotes}
              onChange={(e) => setGrindingNotes(e.currentTarget.value)}
              autosize
              minRows={2}
            />

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#8B6F4E' }}>适合形态</div>
              <Chip.Group multiple value={suitableForms} onChange={setSuitableForms as any}>
                <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                  {formOptions.map((form) => (
                    <Chip key={form.value} value={form.value} size="xs" variant="light" color="yellow">
                      {form.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </div>

            <Textarea
              label="历史典故"
              placeholder="可选填"
              value={historyText}
              onChange={(e) => setHistoryText(e.currentTarget.value)}
              autosize
              minRows={2}
            />

            <Textarea
              label="诗词引用"
              placeholder="可选填"
              value={poetryText}
              onChange={(e) => setPoetryText(e.currentTarget.value)}
              autosize
              minRows={2}
            />

            <Textarea
              label="传统用途"
              placeholder="可选填"
              value={traditionalUse}
              onChange={(e) => setTraditionalUse(e.currentTarget.value)}
              autosize
              minRows={2}
            />
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>取消</Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{ backgroundColor: '#C4A882' }}
          >
            添加
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
