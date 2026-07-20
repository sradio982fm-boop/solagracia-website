"use client";

import {
  Alert,
  Badge,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/admin/useDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminSurface } from "@/components/admin/AdminSurface";

const QUICK_LINKS = [
  { href: "/admin/frequencies", label: "Frekuensi", icon: "settings_input_antenna" },
  { href: "/admin/schedule", label: "Jadwal", icon: "calendar_month" },
  { href: "/admin/hosts", label: "Penyiar", icon: "group" },
  { href: "/admin/partners", label: "Partner", icon: "handshake" },
  { href: "/admin/ads", label: "Iklan", icon: "campaign" },
  { href: "/admin/social", label: "Social", icon: "share" },
  { href: "/admin/site", label: "Konfigurasi Situs", icon: "settings" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <Stack gap="lg">
        <Skeleton height={40} width={280} />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} height={96} radius="md" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (error || !data) {
    return (
      <Alert color="red" title="Gagal memuat dashboard" role="alert">
        {error instanceof Error ? error.message : "Terjadi kesalahan."}
      </Alert>
    );
  }

  const { counts, issues } = data;
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Dashboard"
        description="Kesehatan konten Solagracia — bukan analytics pengunjung."
      />

      {(errors.length > 0 || warnings.length > 0) && (
        <Stack gap="sm">
          {errors.map((issue) => (
            <Alert
              key={issue.message}
              color="red"
              variant="light"
              title="Perlu perhatian"
              role="alert"
              icon={
                <i className="material-icons text-[18px]" aria-hidden>
                  error
                </i>
              }
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
              icon={
                <i className="material-icons text-[18px]" aria-hidden>
                  warning
                </i>
              }
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
        <AdminStatCard
          label="Penyiar"
          value={counts.hosts.published}
          detail={`${counts.hosts.total} total · ${counts.hosts.draft} draft`}
          href="/admin/hosts"
          icon="group"
        />
        <AdminStatCard
          label="Program"
          value={counts.shows.published}
          detail={`${counts.shows.total} total · ${counts.shows.draft} draft`}
          href="/admin/schedule"
          icon="live_tv"
        />
        <AdminStatCard
          label="Slot jadwal"
          value={counts.scheduleSlots}
          href="/admin/schedule"
          icon="calendar_month"
        />
        <AdminStatCard
          label="Partner"
          value={counts.partners.published}
          detail={`${counts.partners.total} total`}
          href="/admin/partners"
          icon="handshake"
        />
        <AdminStatCard
          label="Paket sponsorship"
          value={counts.sponsorshipPlans.published}
          detail={`${counts.sponsorshipPlans.total} total · target 3`}
          href="/admin/partners"
          icon="workspace_premium"
        />
        <AdminStatCard
          label="Iklan"
          value={counts.ads.published}
          detail={`${counts.ads.hidden} hidden · ${counts.ads.total} total`}
          href="/admin/ads"
          icon="campaign"
        />
        <AdminStatCard
          label="Social links"
          value={counts.socialLinks.active}
          detail={`${counts.socialLinks.total} total`}
          href="/admin/social"
          icon="share"
        />
        <AdminStatCard
          label="Frekuensi aktif"
          value={counts.frequencies.active}
          detail={
            counts.frequencies.hasDefault
              ? `${counts.frequencies.total} total · default OK`
              : `${counts.frequencies.total} total · belum ada default`
          }
          href="/admin/frequencies"
          icon="settings_input_antenna"
        />
      </SimpleGrid>

      <AdminSurface p="md">
        <Group justify="space-between" mb="sm" wrap="wrap" gap="sm">
          <Text fw={600}>Section homepage</Text>
          <Badge
            color={counts.sections.hidden > 0 ? "yellow" : "teal"}
            variant="light"
            leftSection={
              <i className="material-icons text-[12px]" aria-hidden>
                {counts.sections.hidden > 0 ? "visibility_off" : "visibility"}
              </i>
            }
          >
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
          fw={500}
        >
          Kelola section config
        </Text>
      </AdminSurface>

      <Stack gap="sm">
        <Text fw={600} size="sm">
          Kelola konten
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <AdminSurface p="md" interactive>
                <Group gap="sm" wrap="nowrap">
                  <i
                    className="material-icons text-[20px]"
                    style={{ color: "var(--mantine-color-gray-7)" }}
                    aria-hidden
                  >
                    {link.icon}
                  </i>
                  <Text fw={600} size="sm">
                    {link.label}
                  </Text>
                </Group>
              </AdminSurface>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
