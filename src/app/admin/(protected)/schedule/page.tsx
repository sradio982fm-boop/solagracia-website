"use client";

import { useMemo, useState } from "react";
import {
  useShows,
  useCreateShow,
  useUpdateShow,
  useDeleteShow,
  type Show,
} from "@/hooks/admin/useShows";
import {
  useSchedule,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  type ScheduleEntry,
} from "@/hooks/admin/useSchedule";
import { useHosts } from "@/hooks/admin/useHosts";
import {
  Button,
  Group,
  Stack,
  Text,
  Title,
  Modal,
  Select,
  TextInput,
  Textarea,
  Paper,
  ActionIcon,
  Skeleton,
  SegmentedControl,
  Avatar,
  Tabs,
  RangeSlider,
  Badge,
  NumberInput,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DAY_LABELS, FIELD_LIMITS } from "@/lib/admin/constants";
import { formatHour, hourToTime, timeToHour } from "@/lib/admin/format";

/* ─── Shows tab ─── */

interface ShowFormState {
  title: string;
  hostId: string | null;
  description: string;
  coverUrl: string;
  tag: string;
  status: string;
}

const EMPTY_SHOW: ShowFormState = {
  title: "",
  hostId: null,
  description: "",
  coverUrl: "",
  tag: "",
  status: "published",
};

function showFormFromShow(show: Show): ShowFormState {
  return {
    title: show.title,
    hostId: show.host?.id || null,
    description: show.description,
    coverUrl: show.coverUrl,
    tag: show.tag,
    status: show.status,
  };
}

function ShowsTab() {
  const { data, isLoading } = useShows();
  const { data: hostsData } = useHosts();
  const createShow = useCreateShow();
  const updateShow = useUpdateShow();
  const deleteShow = useDeleteShow();

  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<Show | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Show | null>(null);
  const [form, setForm] = useState<ShowFormState>(EMPTY_SHOW);

  const shows = data?.shows || [];
  const hosts = hostsData?.hosts || [];

  const hostSelectData = useMemo(
    () => hosts.map((h) => ({ value: h.id, label: h.name })),
    [hosts],
  );

  function updateField<K extends keyof ShowFormState>(
    key: K,
    value: ShowFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_SHOW);
    open();
  }

  function openEdit(show: Show) {
    setEditing(show);
    setForm(showFormFromShow(show));
    open();
  }

  async function handleSubmit() {
    const payload = {
      title: form.title,
      hostId: form.hostId ?? null,
      description: form.description || undefined,
      coverUrl: form.coverUrl || undefined,
      tag: form.tag || undefined,
      status: form.status,
    };

    if (editing) {
      await updateShow.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createShow.mutateAsync(payload);
    }
    close();
  }

  const isSaving = createShow.isPending || updateShow.isPending;
  const isFormValid = form.title.trim().length > 0;

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button color="dark" onClick={openCreate}>
          Tambah Acara
        </Button>
      </Group>

      {isLoading ? (
        <Skeleton height={200} />
      ) : shows.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          style={{ borderColor: "#0a0a0a", background: "#fff", textAlign: "center" }}
        >
          <Text size="sm" c="dimmed">
            Belum ada acara.
          </Text>
        </Paper>
      ) : (
        <Paper withBorder style={{ borderColor: "#0a0a0a", overflow: "hidden" }}>
          {shows.map((show, i) => (
            <Group
              key={show.id}
              justify="space-between"
              px="md"
              py="sm"
              wrap="nowrap"
              style={{
                borderTop: i > 0 ? "1px solid #e5e5e5" : undefined,
                background: "#fff",
              }}
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                <Avatar
                  size={40}
                  radius="md"
                  src={show.coverUrl || undefined}
                  color="dark"
                >
                  {show.title[0]}
                </Avatar>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Group gap="xs">
                    <Text size="sm" fw={700} truncate="end">
                      {show.title}
                    </Text>
                    {show.tag && (
                      <Badge variant="outline" size="xs" color="dark">
                        {show.tag}
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" truncate="end">
                    {show.host?.name || "—"}
                    {show.description ? ` · ${show.description}` : ""}
                  </Text>
                </div>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <StatusBadge status={show.status} />
                <ActionIcon
                  variant="outline"
                  color="dark"
                  onClick={() => openEdit(show)}
                  aria-label="Edit"
                >
                  ✎
                </ActionIcon>
                <ActionIcon
                  variant="outline"
                  color="dark"
                  onClick={() => setDeleteTarget(show)}
                  aria-label="Hapus"
                >
                  ×
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Paper>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={editing ? "Edit Acara" : "Tambah Acara"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb={6}>
              Cover
            </Text>
            <ImageUpload
              value={form.coverUrl}
              onChange={(url) => updateField("coverUrl", url)}
              bucket="shows"
              subpath="covers"
              aspectRatio="video"
            />
          </div>

          <TextInput
            label="Judul acara"
            value={form.title}
            onChange={(e) => updateField("title", e.currentTarget.value)}
            required
            maxLength={FIELD_LIMITS.TITLE_MAX}
          />

          <Select
            label="Penyiar"
            placeholder="Pilih penyiar (opsional)"
            data={hostSelectData}
            value={form.hostId}
            onChange={(v) => updateField("hostId", v)}
            searchable
            clearable
            nothingFoundMessage="Penyiar tidak ditemukan"
          />

          <TextInput
            label="Tag"
            placeholder="MUSIC MIX"
            value={form.tag}
            onChange={(e) => updateField("tag", e.currentTarget.value)}
            maxLength={FIELD_LIMITS.SHOW_TAG_MAX}
          />

          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => updateField("description", e.currentTarget.value)}
            maxLength={FIELD_LIMITS.DESCRIPTION_MAX}
            autosize
            minRows={2}
            maxRows={4}
          />

          <div>
            <Text size="sm" fw={500} mb={6}>
              Status
            </Text>
            <SegmentedControl
              value={form.status}
              onChange={(v) => updateField("status", v)}
              data={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ]}
              fullWidth
              color="dark"
            />
          </div>

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Batal
            </Button>
            <Button
              color="dark"
              loading={isSaving}
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus acara?"
        description={`"${deleteTarget?.title}" akan diarsipkan. Acara dengan slot jadwal tidak bisa dihapus.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteShow.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteShow.isPending}
      />
    </Stack>
  );
}

/* ─── Schedule tab ─── */

function ScheduleTab() {
  const defaultDay = String(new Date().getDay());
  const [activeDay, setActiveDay] = useState(defaultDay);
  const dayNum = Number(activeDay);

  const { data, isLoading } = useSchedule(dayNum);
  const { data: showsData } = useShows();
  const { data: hostsData } = useHosts();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<ScheduleEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleEntry | null>(null);

  const [showId, setShowId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("10:00");
  const [sortOrder, setSortOrder] = useState(0);
  const [hostFilter, setHostFilter] = useState<string | null>(null);

  const entries = data?.entries || [];
  const publishedShows = useMemo(
    () => showsData?.shows?.filter((s) => s.status === "published") || [],
    [showsData],
  );
  const hosts = useMemo(
    () => hostsData?.hosts?.filter((h) => h.status === "published") || [],
    [hostsData],
  );

  const filteredShows = useMemo(() => {
    if (!hostFilter) return publishedShows;
    return publishedShows.filter((s) => s.host?.id === hostFilter);
  }, [publishedShows, hostFilter]);

  const showSelectData = useMemo(
    () =>
      filteredShows.map((s) => ({
        value: s.id,
        label: s.host ? `${s.title} — ${s.host.name}` : s.title,
      })),
    [filteredShows],
  );

  const hostSelectData = useMemo(
    () => hosts.map((h) => ({ value: h.id, label: h.name })),
    [hosts],
  );

  function openCreate() {
    setEditing(null);
    setShowId(null);
    setStartTime("06:00");
    setEndTime("10:00");
    setSortOrder(entries.length);
    setHostFilter(null);
    open();
  }

  function openEdit(entry: ScheduleEntry) {
    setEditing(entry);
    setShowId(entry.show?.id || null);
    setStartTime(hourToTime(entry.startHour));
    setEndTime(hourToTime(entry.endHour));
    setSortOrder(entry.sortOrder);
    setHostFilter(entry.show?.host?.id || null);
    open();
  }

  async function handleSubmit() {
    const payload = {
      showId: showId!,
      startHour: timeToHour(startTime),
      endHour: timeToHour(endTime),
      sortOrder,
    };

    if (editing) {
      await updateSchedule.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createSchedule.mutateAsync({ ...payload, dayOfWeek: dayNum });
    }
    close();
  }

  const startHour = timeToHour(startTime);
  const endHour = timeToHour(endTime);
  const isTimeInvalid = endHour <= startHour;
  const isSaving = createSchedule.isPending || updateSchedule.isPending;
  const duration = isTimeInvalid ? 0 : endHour - startHour;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Tabs value={activeDay} onChange={(v) => v && setActiveDay(v)}>
          <Tabs.List>
            {DAY_LABELS.map((day, i) => (
              <Tabs.Tab key={i} value={String(i)}>
                {day}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <Button color="dark" onClick={openCreate}>
          Tambah Slot
        </Button>
      </Group>

      {isLoading ? (
        <Skeleton height={200} />
      ) : entries.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          style={{ borderColor: "#0a0a0a", background: "#fff", textAlign: "center" }}
        >
          <Text size="sm" c="dimmed">
            Belum ada jadwal untuk {DAY_LABELS[dayNum]}.
          </Text>
        </Paper>
      ) : (
        <Paper withBorder style={{ borderColor: "#0a0a0a", overflow: "hidden" }}>
          {entries.map((entry, i) => (
            <Group
              key={entry.id}
              justify="space-between"
              px="md"
              py="sm"
              style={{
                borderTop: i > 0 ? "1px solid #e5e5e5" : undefined,
                background: "#fff",
              }}
            >
              <Group gap="lg">
                <Text size="sm" ff="monospace" c="dimmed" w={120}>
                  {formatHour(entry.startHour)} – {formatHour(entry.endHour)}
                </Text>
                <div>
                  <Text size="sm" fw={700}>
                    {entry.show?.title || "—"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {entry.show?.host?.name || "—"}
                  </Text>
                </div>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="outline"
                  color="dark"
                  onClick={() => openEdit(entry)}
                  aria-label="Edit"
                >
                  ✎
                </ActionIcon>
                <ActionIcon
                  variant="outline"
                  color="dark"
                  onClick={() => setDeleteTarget(entry)}
                  aria-label="Hapus"
                >
                  ×
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Paper>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={editing ? "Edit Slot Jadwal" : "Tambah Slot Jadwal"}
        centered
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Penyiar"
            description="Filter daftar acara berdasarkan penyiar"
            placeholder="Semua penyiar"
            data={hostSelectData}
            value={hostFilter}
            onChange={(v) => {
              setHostFilter(v);
              setShowId(null);
            }}
            clearable
            searchable
          />

          <Select
            label="Acara"
            placeholder="Pilih acara"
            data={showSelectData}
            value={showId}
            onChange={setShowId}
            searchable
            required
            nothingFoundMessage="Tidak ada acara ditemukan"
          />

          <Group grow>
            <TimeInput
              label="Mulai"
              value={startTime}
              onChange={(e) => setStartTime(e.currentTarget.value)}
              required
            />
            <TimeInput
              label="Selesai"
              value={endTime}
              onChange={(e) => setEndTime(e.currentTarget.value)}
              required
            />
          </Group>

          <div>
            <RangeSlider
              min={0}
              max={24}
              step={0.25}
              value={[startHour, endHour]}
              onChange={([s, e]) => {
                setStartTime(hourToTime(s));
                setEndTime(hourToTime(e));
              }}
              minRange={0.25}
              marks={[
                { value: 0, label: "00" },
                { value: 6, label: "06" },
                { value: 12, label: "12" },
                { value: 18, label: "18" },
                { value: 24, label: "24" },
              ]}
              label={(v) => formatHour(v)}
              thumbSize={16}
              color="dark"
              mt="xs"
              mb="lg"
            />
            <Group justify="center">
              <Badge
                variant="light"
                color={isTimeInvalid ? "red" : "dark"}
                size="lg"
              >
                {isTimeInvalid ? "Waktu tidak valid" : `${duration} jam`}
              </Badge>
            </Group>
          </div>

          {isTimeInvalid && (
            <Text size="sm" c="red">
              Waktu selesai harus lebih besar dari waktu mulai.
            </Text>
          )}

          <NumberInput
            label="Urutan"
            value={sortOrder}
            onChange={(v) => setSortOrder(Number(v) || 0)}
            min={0}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Batal
            </Button>
            <Button
              color="dark"
              onClick={handleSubmit}
              disabled={!showId || isTimeInvalid || isSaving}
              loading={isSaving}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus slot jadwal?"
        description={`Slot ${deleteTarget ? formatHour(deleteTarget.startHour) + "–" + formatHour(deleteTarget.endHour) : ""} akan dihapus dari jadwal ${DAY_LABELS[dayNum]}.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteSchedule.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteSchedule.isPending}
      />
    </Stack>
  );
}

/* ─── Page ─── */

export default function ScheduleAdminPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={4} fw={700}>
          Jadwal & Acara
        </Title>
        <Text size="sm" c="dimmed">
          Kelola acara siaran dan slot jadwal mingguan.
        </Text>
      </div>

      <Tabs defaultValue="shows" color="dark">
        <Tabs.List>
          <Tabs.Tab value="shows">Acara</Tabs.Tab>
          <Tabs.Tab value="schedule">Jadwal</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="shows" pt="md">
          <ShowsTab />
        </Tabs.Panel>

        <Tabs.Panel value="schedule" pt="md">
          <ScheduleTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
