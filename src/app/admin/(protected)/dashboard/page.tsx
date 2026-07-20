"use client";

import {
  Alert,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/admin/useDashboard";

const QUICK_LINKS = [
  { href: "/admin/frequencies", label: "Frekuensi" },
  { href: "/admin/schedule", label: "Jadwal" },
  { href: "/admin/hosts", label: "Penyiar" },
  { href: "/admin/partners", label: "Partner" },
  { href: "/admin/ads", label: "Iklan" },
  { href: "/admin/social", label: "Social" },
  { href: "/admin/site", label: "Konfigurasi Situs" },
] as const;

function StatCard({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string | number;
  detail?: string;
  href?: string;
}) {
  const content = (
    <Paper
      p="md"
      withBorder
      style={{
        borderColor: "#0a0a0a",
        height: "100%",
      }}
    >
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="xl" fw={700} mt={6}>
        {value}
      </Text>
      {detail ? (
        <Text size="xs" c="dimmed" mt={4}>
          {detail}
        </Text>
      ) : null}
    </Paper>
  );

  if (!href) return content;

  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <Stack gap="lg">
        <Skeleton height={28} width={220} />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} height={96} />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (error || !data) {
    return (
      <Alert color="red" title="Gagal memuat dashboard">
        {error instanceof Error ? error.message : "Terjadi kesalahan."}
      </Alert>
    );
  }

  const { counts, issues } = data;
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <Stack gap="lg">
      <div>
        <Title order={3} fw={700}>
          Dashboard
        </Title>
        <Text size="sm" c="dimmed">
          Kesehatan konten Solagracia — bukan analytics pengunjung.
        </Text>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <Stack gap="sm">
          {errors.map((issue) => (
            <Alert
              key={issue.message}
              color="red"
              variant="light"
              title="Perlu perhatian"
            >
              {issue.href ? (
                <Text
                  component={Link}
                  href={issue.href}
                  size="sm"
                  td="underline"
                >
                  {issue.message}
                </Text>
              ) : (
                issue.message
              )}
            </Alert>
          ))}
          {warnings.map((issue) => (
            <Alert
              key={issue.message}
              color="yellow"
              variant="light"
              title="Saran"
            >
              {issue.href ? (
                <Text
                  component={Link}
                  href={issue.href}
                  size="sm"
                  td="underline"
                >
                  {issue.message}
                </Text>
              ) : (
                issue.message
              )}
            </Alert>
          ))}
        </Stack>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <StatCard
          label="Penyiar"
          value={counts.hosts.published}
          detail={`${counts.hosts.total} total · ${counts.hosts.draft} draft`}
          href="/admin/hosts"
        />
        <StatCard
          label="Program"
          value={counts.shows.published}
          detail={`${counts.shows.total} total · ${counts.shows.draft} draft`}
          href="/admin/schedule"
        />
        <StatCard
          label="Slot jadwal"
          value={counts.scheduleSlots}
          href="/admin/schedule"
        />
        <StatCard
          label="Partner"
          value={counts.partners.published}
          detail={`${counts.partners.total} total`}
          href="/admin/partners"
        />
        <StatCard
          label="Paket sponsorship"
          value={counts.sponsorshipPlans.published}
          detail={`${counts.sponsorshipPlans.total} total · target 3`}
          href="/admin/partners"
        />
        <StatCard
          label="Iklan"
          value={counts.ads.published}
          detail={`${counts.ads.hidden} hidden · ${counts.ads.total} total`}
          href="/admin/ads"
        />
        <StatCard
          label="Social links"
          value={counts.socialLinks.active}
          detail={`${counts.socialLinks.total} total`}
          href="/admin/social"
        />
        <StatCard
          label="Frekuensi aktif"
          value={counts.frequencies.active}
          detail={
            counts.frequencies.hasDefault
              ? `${counts.frequencies.total} total · default OK`
              : `${counts.frequencies.total} total · belum ada default`
          }
          href="/admin/frequencies"
        />
      </SimpleGrid>

      <Paper p="md" withBorder style={{ borderColor: "#0a0a0a" }}>
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Section homepage</Text>
          <Badge color={counts.sections.hidden > 0 ? "yellow" : "green"}>
            {counts.sections.visible}/{counts.sections.total} visible
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Urutan, visibility, dan label GRACIA dikelola di konfigurasi situs.
        </Text>
        <Text
          component={Link}
          href="/admin/site"
          size="sm"
          mt="xs"
          td="underline"
        >
          Kelola section config
        </Text>
      </Paper>

      <div>
        <Title order={5} mb="sm">
          Kelola konten
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {QUICK_LINKS.map((link) => (
            <Paper
              key={link.href}
              component={Link}
              href={link.href}
              p="md"
              withBorder
              style={{
                borderColor: "#0a0a0a",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Text fw={600}>{link.label}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </div>
    </Stack>
  );
}
