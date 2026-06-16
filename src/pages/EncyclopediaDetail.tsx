import { useState, useEffect, useMemo } from 'react';
import {
  Paper, Badge, Group, Text, Stack, Button, ScrollArea,
  Avatar, Divider, Chip, Card, ActionIcon, Tabs,
} from '@mantine/core';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, DollarSign, Sparkles, Heart,
  AlertTriangle, Scissors, BookMarked, History,
  Tag, FlaskConical, Crown, User, ChevronRight,
} from 'lucide-react';
import { encyclopediaApi } from '@/api/encyclopediaApi';
import { recipeApi } from '@/api/recipeApi';
import type { EncyclopediaEntry, Recipe } from '@/types';
import {
  MATERIAL_CATEGORY_LABELS,
  INCENSE_FORM_LABELS,
  FRAGRANCE_NOTE_LABELS,
} from '@/types';

export default function EncyclopediaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<EncyclopediaEntry | null>(null);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  const [relatedEntries, setRelatedEntries] = useState<EncyclopediaEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const e = encyclopediaApi.getById(id);
    setEntry(e);

    if (e) {
      const allRecipes = recipeApi.getAll();
      const recipes = allRecipes.filter((r) =>
        r.items.some((i) => i.materialId === e.materialId)
      );
      setRelatedRecipes(recipes);

      const allEntries = encyclopediaApi.getAll();
      const related = allEntries.filter((en) =>
        e.pairingGood.includes(en.name) && en.id !== e.id
      );
      setRelatedEntries(related);
    }
  }, [id]);

  const fragranceNotes = useMemo(() => {
    if (!entry) return [];
    return [
      { key: 'top', label: FRAGRANCE_NOTE_LABELS.top, value: entry.fragranceNotes.top },
      { key: 'middle', label: FRAGRANCE_NOTE_LABELS.middle, value: entry.fragranceNotes.middle },
      { key: 'base', label: FRAGRANCE_NOTE_LABELS.base, value: entry.fragranceNotes.base },
    ].filter((n) => n.value);
  }, [entry]);

  if (!entry) {
    return (
      <Stack align="center" justify="center" h="100%">
        <Text c="dimmed">未找到该词条</Text>
        <Button variant="outline" onClick={() => navigate('/encyclopedia')}>
          返回百科
        </Button>
      </Stack>
    );
  }

  const handleRelatedMaterialClick = (name: string) => {
    const allEntries = encyclopediaApi.getAll();
    const found = allEntries.find((e) => e.name === name);
    if (found) {
      navigate(`/encyclopedia/${found.id}`);
    }
  };

  return (
    <Stack h="100%" gap={0}>
      <Group p="md" pb="sm">
        <ActionIcon variant="subtle" onClick={() => navigate('/encyclopedia')}>
          <ArrowLeft size={20} style={{ color: '#8B6F4E' }} />
        </ActionIcon>
        <Text size="sm" c="dimmed" component={Link} to="/encyclopedia" style={{ textDecoration: 'none', color: 'inherit' }}>
          香材百科
        </Text>
        <ChevronRight size={14} style={{ color: '#C4A882' }} />
        <Text fw={500} style={{ color: '#5A3E2B' }}>{entry.name}</Text>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        <Stack p="md" pt={0} gap="md">
          <Card shadow="sm" p="lg" radius="md" style={{ backgroundColor: '#fff' }}>
            <Group align="flex-start" mb="md">
              <Avatar
                size={64}
                style={{ backgroundColor: entry.color, color: '#fff', fontWeight: 700, fontSize: 24 }}
              >
                {entry.name.charAt(0)}
              </Avatar>
              <Stack gap={4} style={{ flex: 1 }}>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={700} size="xl" style={{ fontFamily: '"Noto Serif SC", serif', color: '#5A3E2B' }}>
                      {entry.name}
                    </Text>
                    {entry.aliases.length > 0 && (
                      <Text size="sm" c="dimmed">
                        别名：{entry.aliases.join('、')}
                      </Text>
                    )}
                  </div>
                  <Badge
                    size="lg"
                    variant="light"
                    leftSection={entry.contributor === 'official' ? <Crown size={12} /> : <User size={12} />}
                    style={{ backgroundColor: entry.contributor === 'official' ? '#FFF8E1' : '#F5F1EB', color: entry.contributor === 'official' ? '#DAA520' : '#8B6F4E' }}
                  >
                    {entry.contributor === 'official' ? '官方' : '用户贡献'}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Group gap="xl">
              <Group gap={6}>
                <Tag size={14} style={{ color: '#8B6F4E' }} />
                <Badge size="sm" variant="light" color="yellow">
                  {MATERIAL_CATEGORY_LABELS[entry.category]}
                </Badge>
              </Group>
              <Group gap={6}>
                <MapPin size={14} style={{ color: '#8B6F4E' }} />
                <Text size="sm" c="dimmed">{entry.origin}</Text>
              </Group>
              <Group gap={6}>
                <DollarSign size={14} style={{ color: '#8B6F4E' }} />
                <Text size="sm" c="dimmed">{entry.priceRange}</Text>
              </Group>
            </Group>
          </Card>

          <Tabs defaultValue="fragrance" variant="pills">
            <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
              <Tabs.Tab value="fragrance" leftSection={<Sparkles size={14} />}>香型描述</Tabs.Tab>
              <Tabs.Tab value="pairing" leftSection={<Heart size={14} />}>配伍建议</Tabs.Tab>
              <Tabs.Tab value="usage" leftSection={<Scissors size={14} />}>使用技巧</Tabs.Tab>
              <Tabs.Tab value="culture" leftSection={<BookMarked size={14} />}>文化背景</Tabs.Tab>
              <Tabs.Tab value="recipes" leftSection={<FlaskConical size={14} />}>
                相关配方 ({relatedRecipes.length})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="fragrance" pt="md">
              <Card shadow="sm" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
                <Group mb="md">
                  <Sparkles size={18} style={{ color: '#C4A882' }} />
                  <Text fw={600} style={{ color: '#5A3E2B' }}>香型描述</Text>
                </Group>

                {fragranceNotes.length > 0 && (
                  <Stack gap="sm" mb="md">
                    {fragranceNotes.map((note) => (
                      <Group key={note.key} align="flex-start">
                        <Badge
                          size="sm"
                          style={{
                            backgroundColor: note.key === 'top' ? '#FFE0B2' : note.key === 'middle' ? '#C4A882' : '#8B6F4E',
                            color: note.key === 'base' ? '#fff' : '#5A3E2B',
                            minWidth: 50,
                            textAlign: 'center',
                          }}
                        >
                          {note.label}
                        </Badge>
                        <Text size="sm" style={{ flex: 1, color: '#5A3E2B' }}>{note.value}</Text>
                      </Group>
                    ))}
                  </Stack>
                )}

                <Divider my="sm" />

                <Group mb="xs">
                  <Tag size={14} style={{ color: '#8B6F4E' }} />
                  <Text size="sm" fw={500} style={{ color: '#5A3E2B' }}>气味关键词</Text>
                </Group>
                <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                  {entry.scentTags.map((tag) => (
                    <Chip key={tag} size="sm" variant="filled" color="yellow" checked={false}>
                      {tag}
                    </Chip>
                  ))}
                </Group>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="pairing" pt="md">
              <Stack gap="md">
                <Card shadow="sm" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
                  <Group mb="md">
                    <Heart size={18} style={{ color: '#D4756B' }} />
                    <Text fw={600} style={{ color: '#5A3E2B' }}>相宜配伍</Text>
                  </Group>
                  <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                    {entry.pairingGood.map((name) => {
                      const allEntries = encyclopediaApi.getAll();
                      const found = allEntries.find((e) => e.name === name);
                      return (
                        <Badge
                          key={name}
                          size="lg"
                          variant="light"
                          color="green"
                          style={{ cursor: found ? 'pointer' : 'default' }}
                          onClick={() => found && handleRelatedMaterialClick(name)}
                        >
                          {name}
                          {found && <ChevronRight size={12} style={{ marginLeft: 2 }} />}
                        </Badge>
                      );
                    })}
                  </Group>
                </Card>

                <Card shadow="sm" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
                  <Group mb="md">
                    <AlertTriangle size={18} style={{ color: '#E57373' }} />
                    <Text fw={600} style={{ color: '#5A3E2B' }}>相克避免</Text>
                  </Group>
                  <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                    {entry.pairingAvoid.map((name) => (
                      <Badge key={name} size="lg" variant="light" color="red">
                        {name}
                      </Badge>
                    ))}
                  </Group>
                </Card>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="usage" pt="md">
              <Card shadow="sm" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
                <Group mb="md">
                  <Scissors size={18} style={{ color: '#8B6F4E' }} />
                  <Text fw={600} style={{ color: '#5A3E2B' }}>使用技巧</Text>
                </Group>

                <Stack gap="md">
                  <Group align="flex-start">
                    <Text size="sm" fw={500} style={{ color: '#8B6F4E', minWidth: 80 }}>建议用量</Text>
                    <Text size="sm" style={{ flex: 1, color: '#5A3E2B' }}>{entry.usageTips.dosageRange}</Text>
                  </Group>

                  <Group align="flex-start">
                    <Text size="sm" fw={500} style={{ color: '#8B6F4E', minWidth: 80 }}>研磨炮制</Text>
                    <Text size="sm" style={{ flex: 1, color: '#5A3E2B' }}>{entry.usageTips.grindingNotes}</Text>
                  </Group>

                  <Group align="flex-start">
                    <Text size="sm" fw={500} style={{ color: '#8B6F4E', minWidth: 80 }}>适合形态</Text>
                    <Group gap="xs" style={{ flex: 1, flexWrap: 'wrap' }}>
                      {entry.usageTips.suitableForms.map((form) => (
                        <Badge key={form} size="sm" variant="light" color="yellow">
                          {INCENSE_FORM_LABELS[form]}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                </Stack>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="culture" pt="md">
              <Card shadow="sm" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
                <Group mb="md">
                  <BookMarked size={18} style={{ color: '#8B6F4E' }} />
                  <Text fw={600} style={{ color: '#5A3E2B' }}>文化背景</Text>
                </Group>

                {entry.culturalBackground ? (
                  <Stack gap="md">
                    {entry.culturalBackground.history && (
                      <Stack gap={4}>
                        <Group>
                          <History size={14} style={{ color: '#C4A882' }} />
                          <Text size="sm" fw={500} style={{ color: '#8B6F4E' }}>历史典故</Text>
                        </Group>
                        <Text size="sm" style={{ color: '#5A3E2B', lineHeight: 1.7, textIndent: '2em' }}>
                          {entry.culturalBackground.history}
                        </Text>
                      </Stack>
                    )}

                    {entry.culturalBackground.poetry && (
                      <Stack gap={4}>
                        <Group>
                          <BookMarked size={14} style={{ color: '#C4A882' }} />
                          <Text size="sm" fw={500} style={{ color: '#8B6F4E' }}>诗词引用</Text>
                        </Group>
                        <Text
                          size="sm"
                          style={{
                            color: '#5A3E2B',
                            fontFamily: '"Noto Serif SC", serif',
                            fontStyle: 'italic',
                            lineHeight: 1.8,
                            padding: '8px 12px',
                            backgroundColor: '#F5F1EB',
                            borderRadius: 6,
                            borderLeft: '3px solid #C4A882',
                          }}
                        >
                          {entry.culturalBackground.poetry}
                        </Text>
                      </Stack>
                    )}

                    {entry.culturalBackground.traditionalUse && (
                      <Stack gap={4}>
                        <Group>
                          <FlaskConical size={14} style={{ color: '#C4A882' }} />
                          <Text size="sm" fw={500} style={{ color: '#8B6F4E' }}>传统用途</Text>
                        </Group>
                        <Text size="sm" style={{ color: '#5A3E2B', lineHeight: 1.7 }}>
                          {entry.culturalBackground.traditionalUse}
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Text c="dimmed" size="sm">暂无文化背景资料</Text>
                )}
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="recipes" pt="md">
              <Stack gap="sm">
                {relatedRecipes.length > 0 ? (
                  relatedRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      shadow="sm"
                      p="sm"
                      radius="md"
                      style={{ backgroundColor: '#fff', cursor: 'pointer' }}
                      onClick={() => navigate('/recipes')}
                    >
                      <Group justify="space-between" mb={4}>
                        <Text fw={600} size="sm" style={{ fontFamily: '"Noto Serif SC", serif', color: '#5A3E2B' }}>
                          {recipe.name}
                        </Text>
                        <Text size="xs" c="dimmed">{recipe.totalWeight}g</Text>
                      </Group>
                      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                        {recipe.items.map((item) => (
                          <div
                            key={item.materialId}
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color, minWidth: 2 }}
                          />
                        ))}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Text c="dimmed" size="sm" ta="center" py="md">
                    暂无使用该香材的配方
                  </Text>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {relatedEntries.length > 0 && (
            <Card shadow="sm" p="md" radius="md" style={{ backgroundColor: '#fff' }}>
              <Group mb="md">
                <Sparkles size={18} style={{ color: '#C4A882' }} />
                <Text fw={600} style={{ color: '#5A3E2B' }}>相关香材</Text>
              </Group>
              <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                {relatedEntries.map((e) => (
                  <Badge
                    key={e.id}
                    size="lg"
                    variant="light"
                    color="yellow"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/encyclopedia/${e.id}`)}
                  >
                    {e.name}
                    <ChevronRight size={12} style={{ marginLeft: 2 }} />
                  </Badge>
                ))}
              </Group>
            </Card>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
