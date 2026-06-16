import { Text, Tooltip } from '@mantine/core';
import { useState, useCallback } from 'react';

interface MeasuringSpoonProps {
  onScoop: (amount: number) => void;
  materialId: string;
}

const COLORS = {
  darkCoffee: '#8B6F4E',
  lightCoffee: '#C4A882',
  offWhite: '#F5F1EB',
  lightGray: '#E8E4E0',
};

const SPOONS = [
  { amount: 1, scale: 1.0, label: '1g' },
  { amount: 0.5, scale: 0.8, label: '0.5g' },
  { amount: 0.1, scale: 0.6, label: '0.1g' },
];

function SpoonIcon({ scale }: { scale: number }) {
  const w = 24 * scale;
  const h = 28 * scale;
  return (
    <svg width={w} height={h} viewBox="0 0 24 28" fill="none">
      <ellipse cx={8} cy={10} rx={7} ry={8} stroke={COLORS.darkCoffee} strokeWidth={1.5} fill={COLORS.offWhite} />
      <line x1={15} y1={10} x2={23} y2={10} stroke={COLORS.darkCoffee} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export default function MeasuringSpoon({ onScoop, materialId }: MeasuringSpoonProps) {
  const [activeAmount, setActiveAmount] = useState<number | null>(null);
  const disabled = !materialId;

  const handleClick = useCallback((amount: number) => {
    if (disabled) return;
    setActiveAmount(amount);
    onScoop(amount);
    setTimeout(() => setActiveAmount(null), 200);
  }, [disabled, onScoop]);

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      {SPOONS.map((spoon) => {
        const isActive = activeAmount === spoon.amount;
        return (
          <Tooltip key={spoon.amount} label={disabled ? '请先选择材料' : `舀取 ${spoon.label}`} withArrow>
            <button
              onClick={() => handleClick(spoon.amount)}
              disabled={disabled}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                border: `1.5px solid ${disabled ? COLORS.lightGray : COLORS.darkCoffee}`,
                borderRadius: 8,
                padding: '8px 14px',
                background: isActive ? COLORS.lightCoffee : COLORS.offWhite,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                transform: isActive ? 'translateY(3px)' : 'translateY(0)',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
            >
              <SpoonIcon scale={spoon.scale} />
              <Text size="xs" fw={600} c={disabled ? COLORS.lightGray : COLORS.darkCoffee}>
                {spoon.label}
              </Text>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
