import { useState, useEffect, useMemo } from 'react';
import {
  TextInput, SimpleGrid, Paper, Badge, Group, Text, Stack, Card,
  Chip, ScrollArea, Avatar, Box, Tooltip,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, MapPin, Tag, Crown, User } from 'lucide-react';
import { encyclopediaApi } from '@/api/encyclopediaApi';
import type { EncyclopediaEntry } from '@/types';
import { MATERIAL_CATEGORY_LABELS } from '@/types';

export default function Encyclopedia() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<EncyclopediaEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    setEntries(encyclopediaApi.getAll());
    setAllTags(encyclopediaApi.getAllScentTags());
  }, []);

  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => {
        if (e.name.toLowerCase().includes(q)) return true;
        if (e.aliases.some((a) => a.toLowerCase().includes(q))) return true;
        if (e.scentTags.some((t) => t.toLowerCase().includes(q))) return true;
        if (e.origin.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    if (activeCategory) {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (selectedTags.length > 0) {
      result = result.filter((e) =>
        selectedTags.some((t) => e.scentTags.includes(t))
      );
    }

    return result;
  }, [entries, searchQuery, activeCategory, selectedTags]);

  const categories = Object.entries(MATERIAL_CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
  }));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setActiveCategory(null);
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <Stack gap="md" p="md" h="100%">
      <Group justify="space-between">
        <Group>
          <BookOpen size={24} style={{ color: '#8B6F4E' }} />
          <Text fw={700} size="xl" style={{ fontFamily: '"Noto Serif SC", serif', color: '#5A3E2B' }}>
            香材百科
          </Text>
        </Group>
        <Text size="sm" c="dimmed">共 {entries.length} 条词条</Text>
      </Group>

      <TextInput
        placeholder="搜索香材名称、别名、气味关键词或产地…"
        leftSection={<Search size={18} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        size="md"
      />

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
          <Badge
            key={cat.key}
            variant={activeCategory === cat.key ? 'filled' : 'outline'}
            style={activeCategory === cat.key
              ? { backgroundColor: '#8B6F4E', color: '#fff' }
              : { borderColor: '#C4A882', color: '#8B6F4E' }}
            size="lg"
            onClick={() => setActiveCategory(cat.key)}
            styles={{ root: { cursor: 'pointer', flexShrink: 0 } }}
          >
            {cat.label}
          </Badge>
        ))}
      </Group>

      <Group gap="xs" align="flex-start">
        <Tag size={16} style={{ color: '#8B6F4E', flexShrink: 0, marginTop: 4 }} />
        <Chip.Group multiple value={selectedTags} onChange={setSelectedTags as any}>
          <Group gap="xs" style={{ flexWrap: 'wrap' }}>
            {allTags.slice(0, 12).map((tag) => (
              <Chip
                key={tag}
                value={tag}
                size="sm"
                variant="light"
                color="yellow"
                onClick={() => toggleTag(tag)}
                styles={{
                  root: {
                    backgroundColor: selectedTags.includes(tag) ? '#C4A882' : 'transparent',
                    borderColor: '#C4A882',
                    color: selectedTags.includes(tag) ? '#fff' : '#8B6F4E',
                    cursor: 'pointer',
                  },
                }}
              >
                {tag}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Group>

      {(activeCategory || selectedTags.length > 0 || searchQuery) && (
        <Text size="sm" c="dimmed" ta="right">
          找到 {filteredEntries.length} 条结果
          {(activeCategory || selectedTags.length > 0) && (
            <Text
              component="span"
              style={{ color: '#C4A882', cursor: 'pointer', marginLeft: 8 }}
              onClick={clearFilters}
            >
              清除筛选
            </Text>
          )}
        </Text>
      )}

      <ScrollArea style={{ flex: 1 }}>
        {filteredEntries.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md" pb="md">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                shadow="sm"
                p="md"
                radius="md"
                style={{
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onClick={() => navigate(`/encyclopedia/${entry.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <Group mb="xs">
                  <Avatar
                    size={40}
                    style={{ backgroundColor: entry.color, color: '#fff', fontWeight: 700 }}
                  >
                    {entry.name.charAt(0)}
                  </Avatar>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text fw={600} style={{ fontFamily: '"Noto Serif SC", serif', color: '#5A3E2B' }}>
                        {entry.name}
                      </Text>
                      <Tooltip label={entry.contributor === 'official' ? '官方预置' : '用户贡献'} position="right">
                        <Box component="span">
                          {entry.contributor === 'official' ? (
                            <Crown size={14} style={{ color: '#DAA520' }} />
                          ) : (
                            <User size={14} style={{ color: '#8B6F4E' }} />
                          )}
                        </Box>
                      </Tooltip>
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {entry.aliases.slice(0, 2).join('、')}
                    </Text>
                  </Stack>
                </Group>

                <Badge size="sm" variant="light" color="yellow" style={{ marginBottom: 8 }}>
                  {MATERIAL_CATEGORY_LABELS[entry.category]}
                </Badge>

                <Group gap={4} mb={8}>
                  <MapPin size={12} style={{ color: '#8B6F4E' }} />
                  <Text size="xs" c="dimmed" lineClamp={1}>{entry.origin}</Text>
                </Group>

                <Group gap={4} mb={8}>
                  <Tag size={12} style={{ color: '#8B6F4E' }} />
                  <Group gap={4} style={{ flexWrap: 'wrap' }}>
                    {entry.scentTags.slice(0, 3).map((tag) => (
                      <Badge key={tag} size="xs" variant="dot" style={{ color: '#8B6F4E' }}>
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Group>

                <Text size="xs" c="dimmed">
                  {entry.fragranceNotes.middle || entry.fragranceNotes.base || entry.fragranceNotes.top}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Stack align="center" py="xl" gap="md">
            <BookOpen size={48} style={{ color: '#C4A882', opacity: 0.5 }} />
            <Text c="dimmed">未找到相关香材词条</Text>
            {searchQuery && (
              <Text size="sm" c="dimmed">
                试试其他关键词或
                <Text
                  component="span"
                  style={{ color: '#C4A882', cursor: 'pointer' }}
                  onClick={clearFilters}
                >
                  清除筛选
                </Text>
              </Text>
            )}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
}
