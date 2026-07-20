"use client";

import { useState, useMemo } from "react";
import {
  useVisitors,
  useEvents,
  useAnalyticsOverview,
  type AnalyticsEvent,
  type Visitor,
} from "@/hooks/admin/useAnalytics";
import { getAccessToken } from "@/lib/admin/auth-context";
import {
  Group,
  Stack,
  Text,
  Badge,
  Skeleton,
  SimpleGrid,
  ThemeIcon,
  Tabs,
  Select,
  Button,
  ScrollArea,
  Modal,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { formatDateShort } from "@/lib/admin/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminSurface } from "@/components/admin/AdminSurface";
import { ADMIN_BORDER, ADMIN_MUTED_BG } from "@/lib/admin/ui";
import { toast } from "sonner";

const EVENT_TYPE_MAP: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  sp: { label: "Stream Play", icon: "play_arrow", color: "dark" },
  ss: { label: "Stream Stop", icon: "stop", color: "gray" },
  ap: { label: "Audio Play", icon: "headphones", color: "dark" },
  as: { label: "Audio Stop", icon: "pause", color: "gray" },
  pv: { label: "Page View", icon: "visibility", color: "dark" },
  sv: { label: "Section View", icon: "view_agenda", color: "dark" },
  cf: { label: "Contact Form", icon: "mail", color: "dark" },
};

const EVENT_FILTER_OPTIONS = [
  { value: "sp", label: "Stream Play" },
  { value: "ss", label: "Stream Stop" },
  { value: "ap", label: "Audio Play" },
  { value: "as", label: "Audio Stop" },
  { value: "pv", label: "Page View" },
  { value: "sv", label: "Section View" },
  { value: "cf", label: "Contact Form" },
];

function getDefaultDateRange(): [string, string] {
  const to = new Date();
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return [toDateString(from), toDateString(to)];
}

/** Formats a Date / ISO / date-only value to YYYY-MM-DD (local calendar day). */
function toDateString(d: Date | string): string {
  if (typeof d === "string") {
    const match = d.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    d = new Date(d);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatIdDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DatesRangeValue = [string | null, string | null];

function normalizeDateRange(value: DatesRangeValue): DatesRangeValue {
  const [from, to] = value;
  return [
    from ? toDateString(from) : null,
    to ? toDateString(to) : null,
  ];
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string | null>("visitors");
  const [dateRange, setDateRange] =
    useState<DatesRangeValue>(getDefaultDateRange);

  const filters = useMemo(() => {
    const [from, to] = dateRange;
    return {
      from: from || undefined,
      to: to || undefined,
    };
  }, [dateRange]);

  const { data: overview, isLoading: overviewLoading } =
    useAnalyticsOverview(filters);

  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Analytics"
        description="Pengunjung, event log, dan breakdown geo."
        actions={
          <>
            <DatePickerInput
              type="range"
              value={dateRange}
              onChange={(v: DatesRangeValue) =>
                setDateRange(normalizeDateRange(v))
              }
              placeholder="Pilih rentang tanggal"
              size="sm"
              maxDate={new Date()}
              clearable={false}
              valueFormat="D MMM YYYY"
              w={240}
              aria-label="Rentang tanggal analytics"
            />
            <ExportButton dateRange={dateRange} />
          </>
        }
      />

      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
        <AdminStatCard
          loading={overviewLoading}
          label="Pengunjung"
          value={overview?.summary.uniqueVisitors}
          icon="person"
        />
        <AdminStatCard
          loading={overviewLoading}
          label="Sesi"
          value={overview?.summary.totalSessions}
          icon="schedule"
        />
        <AdminStatCard
          loading={overviewLoading}
          label="Page Views"
          value={overview?.summary.totalPageViews}
          icon="visibility"
        />
        <AdminStatCard
          loading={overviewLoading}
          label="Audio Play"
          value={overview?.summary.audioPlays}
          icon="headphones"
        />
        <AdminStatCard
          loading={overviewLoading}
          label="Video Play"
          value={overview?.summary.streamPlays}
          icon="play_arrow"
        />
        <AdminStatCard
          loading={overviewLoading}
          label="Kontak"
          value={overview?.summary.contactForms}
          icon="mail"
        />
      </SimpleGrid>

      {!overviewLoading && overview && overview.topSections.length > 0 ? (
        <AdminSurface p="md">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="sm">
            Section teratas
          </Text>
          <Stack gap={6}>
            {overview.topSections.slice(0, 5).map((section) => (
              <Group key={section.sectionId} justify="space-between">
                <Text size="sm" ff="monospace">
                  {section.sectionId}
                </Text>
                <Text size="sm" fw={600} ff="monospace">
                  {section.views.toLocaleString("id-ID")}
                </Text>
              </Group>
            ))}
          </Stack>
        </AdminSurface>
      ) : null}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab
            value="visitors"
            leftSection={<i className="material-icons text-[14px]">people</i>}
          >
            Visitors
          </Tabs.Tab>
          <Tabs.Tab
            value="events"
            leftSection={<i className="material-icons text-[14px]">bolt</i>}
          >
            Events
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="visitors" pt="md">
          <VisitorsTab filters={filters} />
        </Tabs.Panel>
        <Tabs.Panel value="events" pt="md">
          <EventsTab filters={filters} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function VisitorsTab({ filters }: { filters: { from?: string; to?: string } }) {
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useVisitors({ ...filters, country: countryFilter || undefined });

  const visitors = useMemo(
    () => data?.pages.flatMap((p) => p.visitors) ?? [],
    [data],
  );

  const countryOptions = useMemo(
    () => getUniqueCountries(visitors),
    [visitors],
  );
  const hasCountryData = countryOptions.length > 0;

  if (isLoading) return <VisitorsSkeleton />;

  if (visitors.length === 0) {
    return (
      <AdminEmptyState
        icon="person_off"
        title="Belum ada pengunjung"
        description="Belum ada data pengunjung pada periode ini."
      />
    );
  }

  return (
    <Stack gap="sm">
      <Group gap="sm">
        <Tooltip
          label="Belum ada data negara pada pengunjung periode ini"
          disabled={hasCountryData}
        >
          <span>
            <Select
              placeholder="Semua Negara"
              data={countryOptions}
              value={countryFilter}
              onChange={setCountryFilter}
              clearable
              size="sm"
              w={160}
              disabled={!hasCountryData}
              nothingFoundMessage="Tidak ada negara"
              aria-label="Filter negara pengunjung"
            />
          </span>
        </Tooltip>
        <Badge variant="light" color="gray" size="sm" tt="none">
          {visitors.length} pengunjung
        </Badge>
      </Group>

      <ScrollArea type="auto" offsetScrollbars>
        <AdminSurface style={{ overflow: "hidden", minWidth: 720 }}>
          <Group
            px="md"
            py="xs"
            style={{
              borderBottom: `1px solid ${ADMIN_BORDER}`,
              background: ADMIN_MUTED_BG,
            }}
            gap={0}
            wrap="nowrap"
          >
            <Text size="xs" fw={600} c="dimmed" style={{ flex: 2, minWidth: 0 }}>
              UID
            </Text>
            <Text size="xs" fw={600} c="dimmed" style={{ flex: 2, minWidth: 0 }}>
              Lokasi
            </Text>
            <Text size="xs" fw={600} c="dimmed" style={{ flex: 1, minWidth: 0 }}>
              Viewport
            </Text>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              ta="center"
              style={{ flex: 1, minWidth: 0 }}
            >
              Sesi
            </Text>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              ta="center"
              style={{ flex: 1, minWidth: 0 }}
            >
              PV
            </Text>
            <Text size="xs" fw={600} c="dimmed" style={{ flex: 2, minWidth: 0 }}>
              Terakhir Aktif
            </Text>
          </Group>

          {visitors.map((v, i) => (
            <VisitorRow
              key={v.id}
              visitor={v}
              isLast={i === visitors.length - 1}
            />
          ))}
        </AdminSurface>
      </ScrollArea>

      {hasNextPage ? (
        <Group justify="center">
          <Button
            variant="subtle"
            color="dark"
            size="sm"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
          >
            Muat Selanjutnya
          </Button>
        </Group>
      ) : null}
    </Stack>
  );
}

function VisitorRow({
  visitor,
  isLast,
}: {
  visitor: Visitor;
  isLast: boolean;
}) {
  const location =
    [visitor.city, visitor.country].filter(Boolean).join(", ") || "—";

  return (
    <Group
      px="md"
      py="xs"
      gap={0}
      wrap="nowrap"
      style={{
        borderBottom: isLast ? undefined : "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Text
        size="xs"
        ff="monospace"
        c="dimmed"
        truncate="end"
        style={{ flex: 2, minWidth: 0 }}
      >
        {visitor.uid.slice(0, 12)}...
      </Text>
      <Text size="xs" truncate="end" style={{ flex: 2, minWidth: 0 }}>
        {location}
      </Text>
      <Text
        size="xs"
        ff="monospace"
        c="dimmed"
        style={{ flex: 1, minWidth: 0 }}
      >
        {visitor.viewport || "—"}
      </Text>
      <Text
        size="xs"
        fw={500}
        ff="monospace"
        ta="center"
        style={{ flex: 1, minWidth: 0 }}
      >
        {visitor.totalSessions}
      </Text>
      <Text
        size="xs"
        fw={500}
        ff="monospace"
        ta="center"
        style={{ flex: 1, minWidth: 0 }}
      >
        {visitor.totalPageViews}
      </Text>
      <Text size="xs" c="dimmed" style={{ flex: 2, minWidth: 0 }}>
        {formatDateShort(visitor.lastSeen)}
      </Text>
    </Group>
  );
}

function EventsTab({ filters }: { filters: { from?: string; to?: string } }) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEvents({ ...filters, type: typeFilter || undefined });

  const events = useMemo(
    () => data?.pages.flatMap((p) => p.events) ?? [],
    [data],
  );

  return (
    <Stack gap="sm">
      <Group gap="sm">
        <Select
          placeholder="Semua Event"
          data={EVENT_FILTER_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
          clearable
          size="sm"
          w={160}
          aria-label="Filter tipe event"
        />
        <Badge variant="light" color="gray" size="sm" tt="none">
          {isLoading ? "…" : `${events.length} event`}
        </Badge>
      </Group>

      {isLoading ? (
        <EventsSkeleton />
      ) : events.length === 0 ? (
        <AdminEmptyState
          icon="event_busy"
          title="Belum ada event"
          description="Belum ada event pada periode ini."
        />
      ) : (
        <>
          <ScrollArea type="auto" offsetScrollbars>
            <AdminSurface style={{ overflow: "hidden", minWidth: 640 }}>
              <Group
                px="md"
                py="xs"
                gap="xs"
                style={{
                  borderBottom: `1px solid ${ADMIN_BORDER}`,
                  background: ADMIN_MUTED_BG,
                }}
              >
                <Text size="xs" fw={600} c="dimmed" w={130}>
                  Waktu
                </Text>
                <Text size="xs" fw={600} c="dimmed" w={120}>
                  Tipe
                </Text>
                <Text size="xs" fw={600} c="dimmed" w={100}>
                  Data
                </Text>
                <Text size="xs" fw={600} c="dimmed" w={100}>
                  Visitor
                </Text>
                <Text size="xs" fw={600} c="dimmed" style={{ flex: 1 }}>
                  Session
                </Text>
              </Group>

              {events.map((ev, i) => (
                <EventRow
                  key={ev.id}
                  event={ev}
                  isLast={i === events.length - 1}
                />
              ))}
            </AdminSurface>
          </ScrollArea>

          {hasNextPage ? (
            <Group justify="center">
              <Button
                variant="subtle"
                color="sg"
                size="sm"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                Muat Selanjutnya
              </Button>
            </Group>
          ) : null}
        </>
      )}
    </Stack>
  );
}

function EventRow({
  event,
  isLast,
}: {
  event: AnalyticsEvent;
  isLast: boolean;
}) {
  const meta = EVENT_TYPE_MAP[event.eventType] || {
    label: event.eventType,
    icon: "help",
    color: "gray",
  };
  const visitorLabel = event.visitor
    ? [event.visitor.city, event.visitor.country].filter(Boolean).join(", ") ||
      event.visitor.uid.slice(0, 8)
    : "—";

  return (
    <Group
      px="md"
      py="xs"
      gap="xs"
      wrap="nowrap"
      style={{
        borderBottom: isLast ? undefined : "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Text size="xs" c="dimmed" ff="monospace" w={130}>
        {formatDateShort(event.occurredAt)}
      </Text>
      <Group gap={6} w={120} wrap="nowrap">
        <ThemeIcon variant="light" color={meta.color} size="xs" radius="xl">
          <i className="material-icons text-[10px]">{meta.icon}</i>
        </ThemeIcon>
        <Text size="xs" fw={500}>
          {meta.label}
        </Text>
      </Group>
      <Text size="xs" c="dimmed" w={100} truncate="end">
        {event.eventData || "—"}
      </Text>
      <Text size="xs" w={100} truncate="end">
        {visitorLabel}
      </Text>
      <Text
        size="xs"
        c="dimmed"
        ff="monospace"
        style={{ flex: 1 }}
        truncate="end"
      >
        {event.sessionSid ? event.sessionSid.slice(0, 12) : "—"}
      </Text>
    </Group>
  );
}

function VisitorsSkeleton() {
  return (
    <AdminSurface p="md">
      <Stack gap="sm">
        {Array.from({ length: 8 }).map((_, i) => (
          <Group key={i} gap="sm">
            <Skeleton height={12} width={100} />
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={60} />
            <Skeleton height={12} width={40} />
            <Skeleton height={12} width={40} />
            <Skeleton height={12} width={100} />
          </Group>
        ))}
      </Stack>
    </AdminSurface>
  );
}

function EventsSkeleton() {
  return (
    <AdminSurface p="md">
      <Stack gap="sm">
        {Array.from({ length: 8 }).map((_, i) => (
          <Group key={i} gap="sm">
            <Skeleton height={12} width={110} />
            <Skeleton height={12} width={90} />
            <Skeleton height={12} width={70} />
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={90} />
          </Group>
        ))}
      </Stack>
    </AdminSurface>
  );
}

function getUniqueCountries(
  visitors: Visitor[],
): { value: string; label: string }[] {
  const set = new Set<string>();
  for (const v of visitors) {
    if (v.country) set.add(v.country);
  }
  return Array.from(set)
    .sort()
    .map((c) => ({ value: c, label: c }));
}

function ExportButton({ dateRange }: { dateRange: DatesRangeValue }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [exportType, setExportType] = useState<string>("events");
  const [downloading, setDownloading] = useState(false);

  async function handleExport() {
    const [from, to] = dateRange;
    if (!from || !to) return;

    setDownloading(true);
    try {
      const token = getAccessToken();
      const params = new URLSearchParams({
        type: exportType,
        from,
        to,
      });

      const res = await fetch(`/api/admin/analytics/export?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Export gagal");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `solagracia-${exportType}-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV berhasil diunduh");
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export gagal");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Tooltip label="Export ke CSV">
        <ActionIcon
          variant="default"
          size="lg"
          onClick={open}
          aria-label="Export analytics ke CSV"
        >
          <i className="material-icons text-[18px]">download</i>
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        title="Export Analytics"
        size="sm"
        centered
      >
        <Stack gap="md">
          <Select
            label="Data"
            data={[
              { value: "events", label: "Events" },
              { value: "visitors", label: "Visitors" },
              { value: "sessions", label: "Sessions" },
            ]}
            value={exportType}
            onChange={(v) => v && setExportType(v)}
          />

          <div>
            <Text size="sm" fw={500} mb={4}>
              Periode
            </Text>
            <Text size="xs" c="dimmed" ff="monospace">
              {dateRange[0] ? formatIdDate(dateRange[0]) : "—"}
              {" — "}
              {dateRange[1] ? formatIdDate(dateRange[1]) : "—"}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Rentang memakai awal–akhir hari (00:00–23:59:59) agar semua data
              pada tanggal terpilih ikut terhitung.
            </Text>
          </div>

          <Text size="xs" c="dimmed">
            Maks. 31 hari. Export mungkin membutuhkan waktu hingga 30 detik.
          </Text>

          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={close}>
              Batal
            </Button>
            <Button
              onClick={handleExport}
              loading={downloading}
              disabled={!dateRange[0] || !dateRange[1]}
              leftSection={
                <i className="material-icons text-[14px]">download</i>
              }
            >
              Download .csv
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
