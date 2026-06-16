import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Text, Stack, Group, Badge, Button, Checkbox, Modal,
  ActionIcon, Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Clock, Trash2, RotateCcw, GitCompare } from 'lucide-react';
import dayjs from 'dayjs';
import type { BlendHistory } from '@/types';
import { useHistoryStore } from '@/store/historyStore';
import { useWorkspaceStore } from '@/store/workspaceStore';

const STATUS_COLOR: Record<string, string> = {
  normal: '#40c057',
  warning: '#fab005',
  error: '#fa5252',
};

const STATUS_BADGE_COLOR: Record<string, 'green' | 'yellow' | 'red'> = {
  normal: 'green',
  warning: 'yellow',
  error: 'red',
};

const STATUS_LABEL: Record<string, string> = {
  normal: '正常',
  warning: '偏差警告',
  error: '偏差过大',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const histories = useHistoryStore((s) => s.histories);
  const selectedIds = useHistoryStore((s) => s.selectedIds);
  const loadHistories = useHistoryStore((s) => s.loadHistories);
  const deleteHistory = useHistoryStore((s) => s.deleteHistory);
  const clearAll = useHistoryStore((s) => s.clearAll);
  const toggleSelect = useHistoryStore((s) => s.toggleSelect);
  const clearSelection = useHistoryStore((s) => s.clearSelection);

  const applyRecipe = useWorkspaceStore((s) => s.applyRecipe);

  const [compareOpened, { open: openCompare, close: closeCompare }] = useDisclosure(false);
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  useEffect(() => {
    loadHistories();
  }, []);

  const handleRestore = (historyId: string) => {
    const history = histories.find((h) => h.id === historyId);
    if (!history) return;
    applyRecipe(
      history.items.map((i) => ({
        materialId: i.materialId,
        materialName: i.materialName,
        weight: i.weight,
        color: i.color,
      }))
    );
    navigate('/');
  };

  const selectedHistories = histories.filter((h) => selectedIds.includes(h.id));

  if (histories.length === 0) {
    return (
      <Stack align="center" justify="center" h={400} gap="sm">
        <Clock size={48} color="#C4A882" />
        <Text c="#8B6F4E" size="lg" fw={500}>暂无调配历史</Text>
        <Text c="dimmed" size="sm">保存配方后将记录在此</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <Group gap="xs">
          {selectedIds.length > 0 && (
            <Text size="sm" c="dimmed">已选 {selectedIds.length} 项</Text>
          )}
        </Group>
        <Group>
          <Button
            leftSection={<GitCompare size={16} />}
            disabled={selectedIds.length !== 2}
            onClick={openCompare}
            variant="outline"
            style={{ borderColor: '#C4A882', color: '#8B6F4E' }}
          >
            对比选中
          </Button>
          <Button
            leftSection={<Trash2 size={16} />}
            color="red"
            variant="outline"
            onClick={openConfirm}
          >
            清除全部
          </Button>
        </Group>
      </Group>

      <Box style={{ position: 'relative', paddingLeft: 28 }}>
        <Box
          style={{
            position: 'absolute',
            left: 9,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#E8E4E0',
          }}
        />

        <Stack gap="lg">
          {histories.map((h) => (
            <Box key={h.id} style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  left: -23,
                  top: 16,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLOR[h.status],
                  border: '2px solid #fff',
                  zIndex: 1,
                }}
              />

              <Paper shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <Checkbox
                      checked={selectedIds.includes(h.id)}
                      onChange={() => toggleSelect(h.id)}
                    />
                    <Text fw={600} size="sm" c="#8B6F4E">{h.recipeName}</Text>
                    <Badge color={STATUS_BADGE_COLOR[h.status]} size="sm" variant="light">
                      {STATUS_LABEL[h.status]}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">{dayjs(h.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
                </Group>

                <Group gap="md" mb="xs">
                  <Text size="xs" c="dimmed">偏差: {h.deviation.toFixed(1)}%</Text>
                  <Text size="xs" c="dimmed">总重: {h.totalWeight.toFixed(2)}g</Text>
                </Group>

                <Stack gap={4} mb="xs">
                  {h.items.map((item) => (
                    <Group key={item.materialId} gap="xs">
                      <Box
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: item.color,
                        }}
                      />
                      <Text size="xs">{item.materialName}</Text>
                      <Text size="xs" c="dimmed">{item.weight.toFixed(2)}g</Text>
                    </Group>
                  ))}
                </Stack>

                <Group justify="flex-end" gap="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    leftSection={<RotateCcw size={12} />}
                    onClick={() => handleRestore(h.id)}
                    style={{ borderColor: '#C4A882', color: '#8B6F4E' }}
                  >
                    恢复到工作台
                  </Button>
                  <ActionIcon
                    size="sm"
                    color="red"
                    variant="subtle"
                    onClick={() => deleteHistory(h.id)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Box>

      <Modal opened={compareOpened} onClose={closeCompare} title="配方对比" centered size="lg">
        {selectedHistories.length === 2 && (
          <CompareView left={selectedHistories[0]} right={selectedHistories[1]} />
        )}
      </Modal>

      <Modal opened={confirmOpened} onClose={closeConfirm} title="确认清除" centered>
        <Stack>
          <Text size="sm">确定要清除所有调配历史吗？此操作不可撤销。</Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeConfirm}>取消</Button>
            <Button
              color="red"
              onClick={() => {
                clearAll();
                closeConfirm();
              }}
            >
              确认清除
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function CompareView({ left, right }: { left: BlendHistory; right: BlendHistory }) {
  const allMaterialIds = Array.from(
    new Set([...left.items.map((i) => i.materialId), ...right.items.map((i) => i.materialId)])
  );

  return (
    <Stack gap="sm">
      <Group grow>
        <Paper p="sm" radius="sm" style={{ backgroundColor: '#F5F1EB' }}>
          <Text fw={600} size="sm" ta="center">{left.recipeName}</Text>
        </Paper>
        <Paper p="sm" radius="sm" style={{ backgroundColor: '#F5F1EB' }}>
          <Text fw={600} size="sm" ta="center">{right.recipeName}</Text>
        </Paper>
      </Group>

      {allMaterialIds.map((id) => {
        const leftItem = left.items.find((i) => i.materialId === id);
        const rightItem = right.items.find((i) => i.materialId === id);
        const diff = (rightItem?.weight ?? 0) - (leftItem?.weight ?? 0);
        return (
          <Group key={id} grow>
            <Text size="sm" ta="center">
              {leftItem ? `${leftItem.materialName} ${leftItem.weight.toFixed(2)}g` : '-'}
            </Text>
            <Text
              size="sm"
              ta="center"
              fw={600}
              c={diff > 0 ? '#40c057' : diff < 0 ? '#fa5252' : 'dimmed'}
            >
              {diff > 0 ? `+${diff.toFixed(2)}` : diff < 0 ? diff.toFixed(2) : '0.00'}
            </Text>
          </Group>
        );
      })}

      <Group grow pt="sm" style={{ borderTop: '1px solid #E8E4E0' }}>
        <Text size="sm" ta="center" fw={700}>{left.totalWeight.toFixed(2)}g</Text>
        <Text size="sm" ta="center" fw={700}>{right.totalWeight.toFixed(2)}g</Text>
      </Group>
    </Stack>
  );
}
