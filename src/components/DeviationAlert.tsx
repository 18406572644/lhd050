import { Alert, Text, Group, Progress } from '@mantine/core';

interface DeviationAlertProps {
  deviation: number;
  status: 'normal' | 'warning' | 'error';
  targetTotal: number;
  currentTotal: number;
}

const STATUS_CONFIG = {
  normal: {
    color: '#4caf50',
    bg: '#e8f5e9',
    label: '配比正常',
  },
  warning: {
    color: '#ff9800',
    bg: '#fff3e0',
    label: '配比偏差',
  },
  error: {
    color: '#f44336',
    bg: '#ffebee',
    label: '配比异常',
  },
} as const;

export default function DeviationAlert({ deviation, status, targetTotal, currentTotal }: DeviationAlertProps) {
  const config = STATUS_CONFIG[status];
  const pct = Math.min(Math.abs(deviation) * 20, 100);

  return (
    <Alert
      color={status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red'}
      variant="light"
      radius={0}
      py={6}
      styles={{
        root: {
          backgroundColor: config.bg,
          transition: 'background-color 0.5s ease',
          margin: 0,
          border: 'none',
        },
        body: {
          alignItems: 'center',
        },
      }}
    >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" fw={700} c={config.color}>
              {config.label}
            </Text>
            <Text size="sm" c={config.color} opacity={0.9}>
              偏差 {deviation.toFixed(1)}%
            </Text>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Text size="xs" c={config.color} opacity={0.75}>
              当前 {currentTotal.toFixed(1)}g / 目标 {targetTotal.toFixed(1)}g
            </Text>
            <div style={{ width: 80 }}>
              <Progress
                value={pct}
                size={4}
                radius={2}
                color={status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red'}
                style={{ transition: 'all 0.5s ease' }}
              />
            </div>
          </Group>
        </Group>
      </Alert>
  );
}
