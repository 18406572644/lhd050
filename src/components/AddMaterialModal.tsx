import { useState } from 'react';
import { Modal, TextInput, Select, NumberInput, Textarea, Stack, Group, Button } from '@mantine/core';
import { MATERIAL_CATEGORY_LABELS } from '@/types';
import type { MaterialCategory } from '@/types';

interface AddMaterialModalProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (material: { name: string; category: MaterialCategory; color: string; pricePerGram?: number; description?: string }) => void;
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

export default function AddMaterialModal({ opened, onClose, onAdd }: AddMaterialModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>('other');
  const [color, setColor] = useState('#C4A882');
  const [pricePerGram, setPricePerGram] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !category) return;
    onAdd({
      name: name.trim(),
      category: category as MaterialCategory,
      color,
      pricePerGram,
      description: description.trim() || undefined,
    });
    setName('');
    setCategory('other');
    setColor('#C4A882');
    setPricePerGram(undefined);
    setDescription('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="录入香材" centered>
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
