"use client";

import { useId, useMemo } from "react";
import { Group, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import type {
  CountryEntry,
  DailyEntry,
  OverviewSummary,
  SectionEntry,
} from "@/hooks/admin/useAnalytics";
import { AdminSurface } from "@/components/admin/AdminSurface";
import {
  ADMIN_BORDER,
  ADMIN_INK,
  ADMIN_INK_MUTED,
  ADMIN_MUTED_BG,
  ADMIN_PRIMARY,
  ADMIN_PRIMARY_LIGHT,
  ADMIN_SURFACE,
  ADMIN_TEAL,
} from "@/lib/admin/ui";

const CHART_HEIGHT = 220;
const CHART_PAD = { top: 16, right: 12, bottom: 36, left: 36 };

type SeriesKey = "pageViews" | "streamPlays" | "audioPlays";

const SERIES: Array<{
  key: SeriesKey;
  label: string;
  color: string;
}> = [
  { key: "pageViews", label: "Page Views", color: ADMIN_TEAL },
  { key: "streamPlays", label: "Video", color: ADMIN_PRIMARY },
  { key: "audioPlays", label: "Audio", color: "#86c96a" },
];

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const padded = value * 1.15;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  return Math.ceil(padded / magnitude) * magnitude;
}

function seriesPoints(
  values: number[],
  max: number,
  width: number,
  height: number,
): Array<{ x: number; y: number; value: number }> {
  const innerW = width - CHART_PAD.left - CHART_PAD.right;
  const innerH = height - CHART_PAD.top - CHART_PAD.bottom;
  if (values.length === 0) return [];
  if (values.length === 1) {
    return [
      {
        x: CHART_PAD.left + innerW / 2,
        y: CHART_PAD.top + innerH * (1 - values[0] / max),
        value: values[0],
      },
    ];
  }
  return values.map((value, i) => ({
    x: CHART_PAD.left + (i / (values.length - 1)) * innerW,
    y: CHART_PAD.top + innerH * (1 - value / max),
    value,
  }));
}

function toPolyline(points: Array<{ x: number; y: number }>): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function formatDayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function eachDayInclusive(from?: string, to?: string): string[] {
  if (!from || !to) return [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (start > end) return [];

  const days: string[] = [];
  const cursor = new Date(start);
  // Cap to 93 days so a bad range cannot explode the chart.
  while (cursor <= end && days.length < 93) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function fillDailyRange(
  daily: DailyEntry[],
  from?: string,
  to?: string,
): DailyEntry[] {
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const days = eachDayInclusive(from, to);
  if (days.length === 0) {
    return [...daily].sort((a, b) => a.day.localeCompare(b.day));
  }
  return days.map(
    (day) =>
      byDay.get(day) ?? {
        day,
        streamPlays: 0,
        audioPlays: 0,
        pageViews: 0,
        sectionViews: 0,
      },
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={0.4}>
      {children}
    </Text>
  );
}

function EmptyChart({
  label,
  message = "Belum ada data untuk periode ini",
}: {
  label: string;
  message?: string;
}) {
  return (
    <AdminSurface p="md" style={{ height: "100%" }}>
      <ChartTitle>{label}</ChartTitle>
      <Group
        justify="center"
        align="center"
        mt="sm"
        style={{
          height: CHART_HEIGHT,
          background: ADMIN_MUTED_BG,
          borderRadius: 8,
        }}
      >
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Group>
    </AdminSurface>
  );
}

function DailyActivityChart({
  daily,
  from,
  to,
}: {
  daily: DailyEntry[];
  from?: string;
  to?: string;
}) {
  const gradientId = useId();
  const rows = useMemo(() => fillDailyRange(daily, from, to), [daily, from, to]);
  const width = 720;
  const height = CHART_HEIGHT;
  const hasSignal = rows.some(
    (d) => (d.pageViews ?? 0) + (d.streamPlays ?? 0) + (d.audioPlays ?? 0) > 0,
  );

  const { max, series, labels } = useMemo(() => {
    const pageViews = rows.map((d) => d.pageViews ?? 0);
    const streamPlays = rows.map((d) => d.streamPlays ?? 0);
    const audioPlays = rows.map((d) => d.audioPlays ?? 0);
    const peak = niceMax(
      Math.max(...pageViews, ...streamPlays, ...audioPlays, 0),
    );
    return {
      max: peak,
      series: {
        pageViews: seriesPoints(pageViews, peak, width, height),
        streamPlays: seriesPoints(streamPlays, peak, width, height),
        audioPlays: seriesPoints(audioPlays, peak, width, height),
      },
      labels: rows.map((d) => ({ day: d.day, label: formatDayLabel(d.day) })),
    };
  }, [rows]);

  if (rows.length === 0) {
    return <EmptyChart label="Aktivitas harian" />;
  }

  const innerW = width - CHART_PAD.left - CHART_PAD.right;
  const innerH = height - CHART_PAD.top - CHART_PAD.bottom;
  const yTicks = [0, 0.5, 1].map((t) => Math.round(max * t));
  const labelStep = Math.max(1, Math.ceil(labels.length / 8));
  const pageLine = toPolyline(series.pageViews);
  const baselineY = CHART_PAD.top + innerH;

  return (
    <AdminSurface p="md">
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <div>
          <ChartTitle>Aktivitas harian</ChartTitle>
          <Text size="xs" c="dimmed" mt={4}>
            {hasSignal
              ? `${labels[0].label} – ${labels[labels.length - 1].label}`
              : "Belum ada event pada rentang ini"}
          </Text>
        </div>
        <Group gap="md">
          {SERIES.map((s) => (
            <Group key={s.key} gap={6}>
              <span
                style={{
                  width: 14,
                  height: 3,
                  borderRadius: 999,
                  background: s.color,
                  display: "inline-block",
                }}
              />
              <Text size="xs" c="dimmed">
                {s.label}
              </Text>
            </Group>
          ))}
        </Group>
      </Group>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Grafik garis aktivitas harian"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ADMIN_TEAL} stopOpacity={0.2} />
            <stop offset="100%" stopColor={ADMIN_TEAL} stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = CHART_PAD.top + innerH * (1 - tick / max);
          return (
            <g key={tick}>
              <line
                x1={CHART_PAD.left}
                x2={CHART_PAD.left + innerW}
                y1={y}
                y2={y}
                stroke={ADMIN_BORDER}
                strokeDasharray="3 4"
              />
              <text
                x={CHART_PAD.left - 8}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill={ADMIN_INK_MUTED}
                fontFamily="ui-monospace, monospace"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {series.pageViews.length > 0 ? (
          <polygon
            points={`${series.pageViews[0].x},${baselineY} ${pageLine} ${series.pageViews[series.pageViews.length - 1].x},${baselineY}`}
            fill={`url(#${gradientId})`}
          />
        ) : null}

        {SERIES.map((s) => {
          const points = series[s.key];
          const line = toPolyline(points);
          return (
            <g key={s.key}>
              <polyline
                points={line}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, i) => (
                <circle
                  key={`${s.key}-${labels[i]?.day ?? i}`}
                  cx={point.x}
                  cy={point.y}
                  r={3.5}
                  fill={ADMIN_SURFACE}
                  stroke={s.color}
                  strokeWidth={2}
                >
                  <title>
                    {labels[i]?.label} · {s.label}: {point.value}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}

        {labels.map((item, i) => {
          if (i % labelStep !== 0 && i !== labels.length - 1) return null;
          const x =
            labels.length === 1
              ? CHART_PAD.left + innerW / 2
              : CHART_PAD.left + (i / (labels.length - 1)) * innerW;
          return (
            <text
              key={item.day}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize={10}
              fill={ADMIN_INK_MUTED}
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </AdminSurface>
  );
}

function HorizontalBarChart({
  title,
  rows,
  emptyLabel,
  unitLabel,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
  emptyLabel: string;
  unitLabel: string;
}) {
  if (rows.length === 0) {
    return <EmptyChart label={title} message={emptyLabel} />;
  }

  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <AdminSurface p="md" style={{ height: "100%" }}>
      <Group justify="space-between" mb="md" wrap="nowrap">
        <ChartTitle>{title}</ChartTitle>
        <Text size="xs" c="dimmed">
          {total.toLocaleString("id-ID")} {unitLabel}
        </Text>
      </Group>
      <Stack gap={12}>
        {rows.map((row, index) => {
          const pct = (row.value / total) * 100;
          const widthPct = Math.max(6, (row.value / max) * 100);
          return (
            <div key={row.label}>
              <Group justify="space-between" mb={6} wrap="nowrap" gap="sm">
                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Text
                    size="xs"
                    ff="monospace"
                    c="dimmed"
                    style={{ width: 14, flexShrink: 0 }}
                  >
                    {index + 1}
                  </Text>
                  <Text size="sm" fw={500} truncate="end">
                    {row.label}
                  </Text>
                </Group>
                <Group gap={8} wrap="nowrap">
                  <Text size="xs" c="dimmed" ff="monospace">
                    {pct.toFixed(0)}%
                  </Text>
                  <Text size="sm" fw={700} ff="monospace" c={ADMIN_INK}>
                    {row.value.toLocaleString("id-ID")}
                  </Text>
                </Group>
              </Group>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: ADMIN_MUTED_BG,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: index === 0 ? ADMIN_TEAL : ADMIN_PRIMARY,
                  }}
                />
              </div>
            </div>
          );
        })}
      </Stack>
    </AdminSurface>
  );
}

function EngagementMix({ summary }: { summary: OverviewSummary }) {
  const items = [
    {
      label: "Page Views",
      value: summary.totalPageViews,
      color: ADMIN_TEAL,
    },
    {
      label: "Video Play",
      value: summary.streamPlays,
      color: ADMIN_PRIMARY,
    },
    {
      label: "Audio Play",
      value: summary.audioPlays,
      color: ADMIN_PRIMARY_LIGHT,
    },
    {
      label: "Kontak",
      value: summary.contactForms,
      color: "#558f48",
    },
  ];
  const total = items.reduce((sum, i) => sum + i.value, 0);

  if (total === 0) {
    return (
      <EmptyChart
        label="Bauran engagement"
        message="Belum ada engagement pada periode ini"
      />
    );
  }

  return (
    <AdminSurface p="md" style={{ height: "100%" }}>
      <Group justify="space-between" mb="md">
        <ChartTitle>Bauran engagement</ChartTitle>
        <Text size="xs" c="dimmed">
          {total.toLocaleString("id-ID")} total
        </Text>
      </Group>

      <div
        style={{
          display: "flex",
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          background: ADMIN_MUTED_BG,
          marginBottom: 16,
        }}
        aria-hidden
      >
        {items
          .filter((i) => i.value > 0)
          .map((item) => (
            <div
              key={item.label}
              title={`${item.label}: ${item.value}`}
              style={{
                width: `${(item.value / total) * 100}%`,
                background: item.color,
                minWidth: item.value > 0 ? 4 : 0,
              }}
            />
          ))}
      </div>

      <SimpleGrid cols={2} spacing="sm">
        {items.map((item) => (
          <Group key={item.label} gap={8} wrap="nowrap">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" truncate="end">
                {item.label}
              </Text>
              <Group gap={6} wrap="nowrap">
                <Text size="sm" fw={700} ff="monospace" c={ADMIN_INK}>
                  {item.value.toLocaleString("id-ID")}
                </Text>
                <Text size="xs" c="dimmed" ff="monospace">
                  ({((item.value / total) * 100).toFixed(0)}%)
                </Text>
              </Group>
            </div>
          </Group>
        ))}
      </SimpleGrid>
    </AdminSurface>
  );
}

export function AnalyticsChartsSkeleton() {
  return (
    <Stack gap="md">
      <AdminSurface p="md">
        <Skeleton height={18} width={120} mb="sm" />
        <Skeleton height={CHART_HEIGHT} />
      </AdminSurface>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <AdminSurface key={i} p="md">
            <Skeleton height={18} width={100} mb="sm" />
            <Stack gap="sm">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} height={28} />
              ))}
            </Stack>
          </AdminSurface>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function AnalyticsCharts({
  daily,
  topSections,
  topCountries,
  summary,
  from,
  to,
}: {
  daily: DailyEntry[];
  topSections: SectionEntry[];
  topCountries: CountryEntry[];
  summary: OverviewSummary;
  from?: string;
  to?: string;
}) {
  const sectionRows = topSections.slice(0, 6).map((s) => ({
    label: s.sectionId,
    value: s.views,
  }));
  const countryRows = topCountries.slice(0, 6).map((c) => ({
    label: c.country,
    value: c.visitors,
  }));

  return (
    <Stack gap="md">
      <DailyActivityChart daily={daily} from={from} to={to} />
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <EngagementMix summary={summary} />
        <HorizontalBarChart
          title="Section teratas"
          rows={sectionRows}
          emptyLabel="Belum ada section view"
          unitLabel="views"
        />
        <HorizontalBarChart
          title="Negara teratas"
          rows={countryRows}
          emptyLabel="Belum ada data negara"
          unitLabel="pengunjung"
        />
      </SimpleGrid>
    </Stack>
  );
}
