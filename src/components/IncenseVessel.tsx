import { Tooltip, Text } from '@mantine/core';

interface VesselItem {
  materialName: string;
  weight: number;
  color: string;
}

interface IncenseVesselProps {
  items: VesselItem[];
}

const COLORS = {
  darkCoffee: '#8B6F4E',
  lightCoffee: '#C4A882',
  offWhite: '#F5F1EB',
  lightGray: '#E8E4E0',
};

const VESSEL_HEIGHT = 160;
const VESSEL_WIDTH = 140;
const PADDING = 8;

export default function IncenseVessel({ items }: IncenseVesselProps) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const innerHeight = VESSEL_HEIGHT - PADDING * 2;
  const innerWidth = VESSEL_WIDTH - PADDING * 2;

  let currentY = innerHeight;
  const layers = items.map((item) => {
    const ratio = totalWeight > 0 ? item.weight / totalWeight : 0;
    const height = ratio * innerHeight;
    currentY -= height;
    return { ...item, y: currentY, height, ratio };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={VESSEL_WIDTH} height={VESSEL_HEIGHT + 20} viewBox={`0 0 ${VESSEL_WIDTH} ${VESSEL_HEIGHT + 20}`}>
        <path
          d={`M ${PADDING} ${PADDING}
              Q ${PADDING} 0, ${VESSEL_WIDTH / 2} 0
              Q ${VESSEL_WIDTH - PADDING} 0, ${VESSEL_WIDTH - PADDING} ${PADDING}
              L ${VESSEL_WIDTH - PADDING} ${VESSEL_HEIGHT - PADDING}
              Q ${VESSEL_WIDTH - PADDING} ${VESSEL_HEIGHT}, ${VESSEL_WIDTH / 2} ${VESSEL_HEIGHT}
              Q ${PADDING} ${VESSEL_HEIGHT}, ${PADDING} ${VESSEL_HEIGHT - PADDING}
              Z`}
          fill={COLORS.offWhite}
          stroke={COLORS.darkCoffee}
          strokeWidth={1.5}
        />

        <clipPath id="vesselClip">
          <path
            d={`M ${PADDING} ${PADDING}
                Q ${PADDING} 0, ${VESSEL_WIDTH / 2} 0
                Q ${VESSEL_WIDTH - PADDING} 0, ${VESSEL_WIDTH - PADDING} ${PADDING}
                L ${VESSEL_WIDTH - PADDING} ${VESSEL_HEIGHT - PADDING}
                Q ${VESSEL_WIDTH - PADDING} ${VESSEL_HEIGHT}, ${VESSEL_WIDTH / 2} ${VESSEL_HEIGHT}
                Q ${PADDING} ${VESSEL_HEIGHT}, ${PADDING} ${VESSEL_HEIGHT - PADDING}
                Z`}
          />
        </clipPath>

        <g clipPath="url(#vesselClip)">
          {layers.map((layer, i) => (
            <g key={`${layer.materialName}-${i}`}>
              <rect
                x={PADDING}
                y={layer.y + PADDING}
                width={innerWidth}
                height={layer.height}
                fill={layer.color}
                opacity={0.7}
                style={{ transition: 'y 0.4s ease, height 0.4s ease' }}
              />
              <line
                x1={PADDING}
                y1={layer.y + PADDING}
                x2={VESSEL_WIDTH - PADDING}
                y2={layer.y + PADDING}
                stroke={COLORS.darkCoffee}
                strokeWidth={0.5}
                opacity={0.3}
              />
            </g>
          ))}
        </g>

        <path
          d={`M ${PADDING} ${PADDING}
              Q ${PADDING} 0, ${VESSEL_WIDTH / 2} 0
              Q ${VESSEL_WIDTH - PADDING} 0, ${VESSEL_WIDTH - PADDING} ${PADDING}
              L ${VESSEL_WIDTH - PADDING} ${VESSEL_HEIGHT - PADDING}
              Q ${VESSEL_WIDTH - PADDING} ${VESSEL_HEIGHT}, ${VESSEL_WIDTH / 2} ${VESSEL_HEIGHT}
              Q ${PADDING} ${VESSEL_HEIGHT}, ${PADDING} ${VESSEL_HEIGHT - PADDING}
              Z`}
          fill="none"
          stroke={COLORS.darkCoffee}
          strokeWidth={1.5}
        />

        <line x1={0} y1={2} x2={14} y2={2} stroke={COLORS.darkCoffee} strokeWidth={1} />
        <line x1={0} y1={6} x2={10} y2={6} stroke={COLORS.lightCoffee} strokeWidth={0.5} />
        <line x1={0} y1={10} x2={14} y2={10} stroke={COLORS.lightCoffee} strokeWidth={0.5} />
        <line x1={0} y1={14} x2={8} y2={14} stroke={COLORS.lightCoffee} strokeWidth={0.5} />

        {layers.map((layer, i) => {
          if (layer.height < 14) return null;
          return (
            <text
              key={`label-${i}`}
              x={VESSEL_WIDTH / 2}
              y={layer.y + PADDING + layer.height / 2 + 4}
              textAnchor="middle"
              fill={COLORS.darkCoffee}
              fontSize={9}
              fontWeight={500}
              opacity={0.85}
            >
              {layer.height > 22 ? `${layer.materialName} ${layer.weight.toFixed(1)}g` : layer.weight.toFixed(1) + 'g'}
            </text>
          );
        })}
      </svg>

      {items.length === 0 && (
        <Text size="xs" c={COLORS.lightCoffee} mt={-10} mb={4}>
          空器皿
        </Text>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
        {items.map((item, i) => (
          <Tooltip key={i} label={`${item.materialName}: ${item.weight.toFixed(1)}g`} withArrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: item.color,
                  opacity: 0.7,
                }}
              />
              <Text size="xs" c={COLORS.darkCoffee}>
                {item.materialName}
              </Text>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
