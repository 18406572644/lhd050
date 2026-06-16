import { Text } from '@mantine/core';

interface BalanceScaleProps {
  leftWeight: number;
  rightWeight: number;
}

const COLORS = {
  darkCoffee: '#8B6F4E',
  lightCoffee: '#C4A882',
  offWhite: '#F5F1EB',
  lightGray: '#E8E4E0',
};

export default function BalanceScale({ leftWeight, rightWeight }: BalanceScaleProps) {
  const diff = leftWeight - rightWeight;
  const maxDiff = Math.max(Math.abs(diff), 0.01);
  const tiltDeg = Math.sign(diff) * Math.min((maxDiff / Math.max(rightWeight, leftWeight, 1)) * 30, 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <svg width={260} height={200} viewBox="0 0 260 200">
        <polygon
          points="120,140 140,140 130,175"
          fill={COLORS.darkCoffee}
          stroke={COLORS.darkCoffee}
          strokeWidth={1}
        />
        <rect x={125} y={170} width={10} height={12} rx={2} fill={COLORS.darkCoffee} />

        <g
          style={{
            transform: `rotate(${tiltDeg}deg)`,
            transformOrigin: '130px 130px',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <line x1={30} y1={130} x2={230} y2={130} stroke={COLORS.darkCoffee} strokeWidth={3} strokeLinecap="round" />
          <circle cx={130} cy={130} r={5} fill={COLORS.darkCoffee} />

          <line x1={30} y1={130} x2={30} y2={105} stroke={COLORS.lightCoffee} strokeWidth={1.5} />
          <line x1={30} y1={130} x2={22} y2={105} stroke={COLORS.lightCoffee} strokeWidth={1} />
          <line x1={30} y1={130} x2={38} y2={105} stroke={COLORS.lightCoffee} strokeWidth={1} />
          <ellipse cx={30} cy={105} rx={22} ry={6} fill="none" stroke={COLORS.darkCoffee} strokeWidth={1.5} />

          <line x1={230} y1={130} x2={230} y2={105} stroke={COLORS.lightCoffee} strokeWidth={1.5} />
          <line x1={230} y1={130} x2={222} y2={105} stroke={COLORS.lightCoffee} strokeWidth={1} />
          <line x1={230} y1={130} x2={238} y2={105} stroke={COLORS.lightCoffee} strokeWidth={1} />
          <ellipse cx={230} cy={105} rx={22} ry={6} fill="none" stroke={COLORS.darkCoffee} strokeWidth={1.5} />
        </g>

        <text x={30} y={85} textAnchor="middle" fill={COLORS.darkCoffee} fontSize={12} fontWeight={600}>
          {leftWeight.toFixed(1)}g
        </text>
        <text x={230} y={85} textAnchor="middle" fill={COLORS.darkCoffee} fontSize={12} fontWeight={600}>
          {rightWeight.toFixed(1)}g
        </text>
        <text x={30} y={73} textAnchor="middle" fill={COLORS.lightCoffee} fontSize={9}>
          当前
        </text>
        <text x={230} y={73} textAnchor="middle" fill={COLORS.lightCoffee} fontSize={9}>
          目标
        </text>
      </svg>

      <Text size="xs" c={COLORS.darkCoffee} mt={-4}>
        {Math.abs(diff) < 0.05 ? '⚖️ 平衡' : diff > 0 ? '← 偏重' : '偏轻 →'}
      </Text>
    </div>
  );
}
