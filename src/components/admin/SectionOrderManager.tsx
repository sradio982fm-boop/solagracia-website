"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import {
  ALL_SECTION_KEYS,
  PINNED_SECTION,
  REORDERABLE_SECTIONS,
  type PublicSectionKey,
} from "@/lib/section-config";
import {
  useReorderSections,
  useSectionConfig,
  useUpdateSectionConfig,
} from "@/hooks/admin/useSectionConfig";

const SECTION_LABELS: Record<string, string> = {
  home: "Home (Hero)",
  ...Object.fromEntries(REORDERABLE_SECTIONS.map((section) => [section.key, section.label])),
};

const SURFACE_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "smoke", label: "Smoke" },
  { value: "white", label: "White" },
];

type EditableSection = {
  section: PublicSectionKey;
  letter: string;
  navLabel: string;
  menuLabel: string;
  surface: "dark" | "smoke" | "white";
};

function buildOrderedKeys(
  stored: Array<{ section: string; sortOrder: number }>,
): PublicSectionKey[] {
  const valid = stored
    .filter((row) => ALL_SECTION_KEYS.includes(row.section as PublicSectionKey))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => row.section as PublicSectionKey);

  const missing = ALL_SECTION_KEYS.filter((key) => !valid.includes(key));
  return [...valid, ...missing];
}

function reorderList<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function SectionOrderManager() {
  const { data, isLoading } = useSectionConfig();
  const reorder = useReorderSections();
  const updateSection = useUpdateSectionConfig();

  const [order, setOrder] = useState<PublicSectionKey[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EditableSection>>({});
  const [orderDirty, setOrderDirty] = useState(false);
  const [metaDirty, setMetaDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!data?.sections) return;

    const nextOrder = buildOrderedKeys(data.sections);
    setOrder(nextOrder);
    setOrderDirty(false);

    const nextDrafts: Record<string, EditableSection> = {};
    for (const row of data.sections) {
      nextDrafts[row.section] = {
        section: row.section as PublicSectionKey,
        letter: row.letter ?? "",
        navLabel: row.navLabel ?? "",
        menuLabel: row.menuLabel ?? "",
        surface: row.surface ?? "white",
      };
    }
    setDrafts(nextDrafts);
    setMetaDirty(false);
  }, [data]);

  const duplicateLetters = useMemo(() => {
    const visibleLetters = order
      .filter((section) => isVisible(section))
      .map((section) => drafts[section]?.letter?.trim().toUpperCase())
      .filter(Boolean);
    const counts = new Map<string, number>();
    for (const letter of visibleLetters) {
      counts.set(letter, (counts.get(letter) ?? 0) + 1);
    }
    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([letter]) => letter),
    );
  }, [drafts, order, data]);

  function isVisible(section: string): boolean {
    return (
      data?.sections.find((row) => row.section === section)?.isVisible ?? true
    );
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const targetSection = order[targetIndex];
    if (targetSection === PINNED_SECTION) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    setOrder((prev) => reorderList(prev, dragIndex, targetIndex));
    setOrderDirty(true);
    setDragIndex(null);
    setOverIndex(null);
  }

  function updateDraft(
    section: string,
    patch: Partial<EditableSection>,
  ) {
    setDrafts((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
    setMetaDirty(true);
  }

  if (isLoading) {
    return (
      <Stack gap="xs">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height={96} radius="md" />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Urutkan section homepage, sembunyikan dari nav, dan edit huruf GRACIA
        serta label menu. Home selalu di posisi pertama.
      </Text>

      <Stack gap="xs">
        {order.map((section, index) => {
          const draft = drafts[section];
          const pinned = section === PINNED_SECTION;
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;
          const letter = draft?.letter?.trim().toUpperCase() ?? "";
          const letterDuplicate = letter ? duplicateLetters.has(letter) : false;

          return (
            <Paper
              key={section}
              withBorder
              radius="md"
              px="md"
              py="sm"
              draggable={!pinned}
              onDragStart={() => {
                if (!pinned) setDragIndex(index);
              }}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              style={{
                cursor: pinned ? "default" : "grab",
                opacity: isDragging ? 0.45 : 1,
                borderColor: isOver
                  ? "var(--mantine-color-orange-5)"
                  : undefined,
                borderWidth: isOver ? 2 : undefined,
                transition: "border-color 120ms ease, opacity 120ms ease",
                userSelect: "none",
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    {!pinned ? (
                      <i
                        className="material-icons"
                        style={{
                          fontSize: 18,
                          color: "var(--mantine-color-gray-5)",
                          cursor: "grab",
                        }}
                      >
                        drag_indicator
                      </i>
                    ) : (
                      <i
                        className="material-icons"
                        style={{
                          fontSize: 18,
                          color: "var(--mantine-color-gray-4)",
                        }}
                      >
                        push_pin
                      </i>
                    )}
                    <Text
                      size="xs"
                      fw={700}
                      c="dimmed"
                      w={20}
                      ta="center"
                      ff="monospace"
                    >
                      {index + 1}
                    </Text>
                    <Text size="sm" fw={600}>
                      {SECTION_LABELS[section] ?? section}
                    </Text>
                  </Group>
                  <div
                    draggable
                    onDragStart={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    <Switch
                      size="sm"
                      color="orange"
                      checked={isVisible(section)}
                      disabled={updateSection.isPending}
                      onChange={(event) =>
                        updateSection.mutate({
                          section,
                          isVisible: event.currentTarget.checked,
                        })
                      }
                    />
                  </div>
                </Group>

                <Group grow align="flex-start">
                  <TextInput
                    label="Huruf rail"
                    value={draft?.letter ?? ""}
                    maxLength={1}
                    disabled={!isVisible(section)}
                    error={
                      letterDuplicate
                        ? "Huruf duplikat pada section visible"
                        : undefined
                    }
                    onChange={(event) =>
                      updateDraft(section, {
                        letter: event.currentTarget.value.slice(0, 1),
                      })
                    }
                    size="xs"
                  />
                  <TextInput
                    label="Label rail"
                    value={draft?.navLabel ?? ""}
                    disabled={!isVisible(section)}
                    onChange={(event) =>
                      updateDraft(section, { navLabel: event.currentTarget.value })
                    }
                    size="xs"
                  />
                  <TextInput
                    label="Label menu"
                    value={draft?.menuLabel ?? ""}
                    disabled={!isVisible(section)}
                    onChange={(event) =>
                      updateDraft(section, {
                        menuLabel: event.currentTarget.value,
                      })
                    }
                    size="xs"
                  />
                  <Select
                    label="Surface"
                    data={SURFACE_OPTIONS}
                    value={draft?.surface ?? "white"}
                    disabled={!isVisible(section)}
                    onChange={(value) =>
                      updateDraft(section, {
                        surface: (value as EditableSection["surface"]) ?? "white",
                      })
                    }
                    size="xs"
                  />
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {(orderDirty || metaDirty) && (
        <Group justify="flex-end">
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() => {
              if (data?.sections) {
                setOrder(buildOrderedKeys(data.sections));
                const nextDrafts: Record<string, EditableSection> = {};
                for (const row of data.sections) {
                  nextDrafts[row.section] = {
                    section: row.section as PublicSectionKey,
                    letter: row.letter ?? "",
                    navLabel: row.navLabel ?? "",
                    menuLabel: row.menuLabel ?? "",
                    surface: row.surface ?? "white",
                  };
                }
                setDrafts(nextDrafts);
              }
              setOrderDirty(false);
              setMetaDirty(false);
            }}
          >
            Reset
          </Button>
          {orderDirty ? (
            <Button
              size="xs"
              loading={reorder.isPending}
              onClick={() =>
                reorder.mutate(order, { onSuccess: () => setOrderDirty(false) })
              }
            >
              Simpan Urutan
            </Button>
          ) : null}
          {metaDirty ? (
            <Button
              size="xs"
              loading={updateSection.isPending}
              onClick={() => {
                const updates = order.map((section) => {
                  const draft = drafts[section];
                  return {
                    section,
                    letter: draft.letter.trim(),
                    navLabel: draft.navLabel.trim(),
                    menuLabel: draft.menuLabel.trim(),
                    surface: draft.surface,
                  };
                });
                updateSection.mutate(
                  { updates },
                  { onSuccess: () => setMetaDirty(false) },
                );
              }}
            >
              Simpan Label
            </Button>
          ) : null}
        </Group>
      )}
    </Stack>
  );
}
