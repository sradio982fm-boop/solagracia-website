import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/auth-guard";
import type { DashboardIssue, DashboardStats } from "@/lib/admin/dashboard";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function cfgValue(
  config: Record<string, Record<string, string | null>>,
  section: string,
  key: string,
): string {
  return config[section]?.[key]?.trim() ?? "";
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();

  const [
    hostsRes,
    showsRes,
    slotsRes,
    partnersRes,
    plansRes,
    adsRes,
    socialRes,
    frequenciesRes,
    sectionsRes,
    siteConfigRes,
  ] = await Promise.all([
    supabase.from("hosts").select("id, status", { count: "exact", head: false }),
    supabase.from("shows").select("id, status", { count: "exact", head: false }),
    supabase.from("schedule_slots").select("id", { count: "exact", head: true }),
    supabase
      .from("partners")
      .select("id, status", { count: "exact", head: false }),
    supabase
      .from("sponsorship_plans")
      .select("id, status", { count: "exact", head: false }),
    supabase
      .from("ad_slots")
      .select("id, status, is_visible", { count: "exact", head: false }),
    supabase
      .from("social_links")
      .select("id, is_active", { count: "exact", head: false }),
    supabase
      .from("frequencies")
      .select("id, is_active, is_default", { count: "exact", head: false }),
    supabase
      .from("section_config")
      .select("section, is_visible", { count: "exact", head: false }),
    supabase.from("site_config").select("section, key, value"),
  ]);

  if (
    hostsRes.error ||
    showsRes.error ||
    slotsRes.error ||
    partnersRes.error ||
    plansRes.error ||
    adsRes.error ||
    socialRes.error ||
    frequenciesRes.error ||
    sectionsRes.error ||
    siteConfigRes.error
  ) {
    return errorResponse("Failed to load dashboard stats", 500);
  }

  const hosts = hostsRes.data ?? [];
  const shows = showsRes.data ?? [];
  const partners = partnersRes.data ?? [];
  const plans = plansRes.data ?? [];
  const ads = adsRes.data ?? [];
  const socials = socialRes.data ?? [];
  const frequencies = frequenciesRes.data ?? [];
  const sections = sectionsRes.data ?? [];

  const groupedConfig: Record<string, Record<string, string | null>> = {};
  for (const row of siteConfigRes.data ?? []) {
    if (!groupedConfig[row.section]) groupedConfig[row.section] = {};
    groupedConfig[row.section][row.key] = row.value;
  }

  const heroBrandCms = cfgValue(groupedConfig, "hero", "brand");
  const heroLogoCms = cfgValue(groupedConfig, "hero", "logo_url");
  const heroCoverCms = cfgValue(groupedConfig, "hero", "cover_url");
  const seoTitle = cfgValue(groupedConfig, "seo", "title");
  const frequencyLabel = cfgValue(groupedConfig, "brand", "frequency_label");

  const publishedHosts = hosts.filter((row) => row.status === "published").length;
  const publishedShows = shows.filter((row) => row.status === "published").length;
  const publishedPartners = partners.filter((row) => row.status === "published").length;
  const publishedPlans = plans.filter((row) => row.status === "published").length;
  const publishedAds = ads.filter((row) => row.status === "published").length;
  const hiddenAds = ads.filter((row) => !row.is_visible).length;
  const activeSocials = socials.filter((row) => row.is_active).length;
  const activeFrequencies = frequencies.filter((row) => row.is_active).length;
  const hasDefaultFrequency = frequencies.some(
    (row) => row.is_active && row.is_default,
  );
  const visibleSections = sections.filter((row) => row.is_visible).length;
  const hiddenSections = sections.filter((row) => !row.is_visible);

  const issues: DashboardIssue[] = [];

  if (!hasDefaultFrequency) {
    issues.push({
      severity: "error",
      message: "Belum ada frekuensi default yang aktif untuk pemutar sticky.",
      href: "/admin/frequencies",
    });
  } else if (activeFrequencies === 0) {
    issues.push({
      severity: "error",
      message: "Tidak ada frekuensi/stream aktif.",
      href: "/admin/frequencies",
    });
  }

  if (!heroBrandCms.trim()) {
    issues.push({
      severity: "warning",
      message: "Judul hero belum diisi di CMS — masih memakai fallback lokal.",
      href: "/admin/site/hero",
    });
  }

  if (!seoTitle.trim()) {
    issues.push({
      severity: "warning",
      message: "Title SEO belum diisi di konfigurasi situs.",
      href: "/admin/site/seo",
    });
  }

  if (!frequencyLabel.trim()) {
    issues.push({
      severity: "warning",
      message: "Label frekuensi brand belum diatur (Studio · 98.2 FM).",
      href: "/admin/site/brand",
    });
  }

  if (!heroLogoCms.trim() || !heroCoverCms.trim()) {
    issues.push({
      severity: "warning",
      message: "Logo atau cover hero belum diunggah ke CMS.",
      href: "/admin/site/hero",
    });
  }

  if (publishedHosts === 0) {
    issues.push({
      severity: "warning",
      message: "Belum ada penyiar published.",
      href: "/admin/hosts",
    });
  }

  if (publishedShows === 0) {
    issues.push({
      severity: "warning",
      message: "Belum ada program/show published.",
      href: "/admin/schedule",
    });
  }

  if ((slotsRes.count ?? 0) === 0) {
    issues.push({
      severity: "warning",
      message: "Jadwal siaran kosong — grid program akan fallback.",
      href: "/admin/schedule",
    });
  }

  if (publishedPartners === 0) {
    issues.push({
      severity: "warning",
      message: "Belum ada partner published untuk marquee.",
      href: "/admin/partners",
    });
  }

  if (publishedPlans === 0) {
    issues.push({
      severity: "warning",
      message: "Belum ada paket sponsorship published.",
      href: "/admin/partners",
    });
  } else if (publishedPlans < 3) {
    issues.push({
      severity: "warning",
      message: `Hanya ${publishedPlans}/3 paket sponsorship published.`,
      href: "/admin/partners",
    });
  }

  if (activeSocials === 0) {
    issues.push({
      severity: "warning",
      message: "Belum ada social link aktif untuk hero/kontak/footer.",
      href: "/admin/social",
    });
  }

  if (publishedAds === 0) {
    issues.push({
      severity: "warning",
      message: "Belum ada slot iklan published.",
      href: "/admin/ads",
    });
  }

  for (const row of hiddenSections) {
    issues.push({
      severity: "warning",
      message: `Seksi "${row.section}" disembunyikan dari homepage.`,
      href: "/admin/site/sections",
    });
  }

  const stats: DashboardStats = {
    counts: {
      hosts: {
        total: hosts.length,
        published: publishedHosts,
        draft: hosts.length - publishedHosts,
      },
      shows: {
        total: shows.length,
        published: publishedShows,
        draft: shows.length - publishedShows,
      },
      scheduleSlots: slotsRes.count ?? 0,
      partners: {
        total: partners.length,
        published: publishedPartners,
      },
      sponsorshipPlans: {
        total: plans.length,
        published: publishedPlans,
      },
      ads: {
        total: ads.length,
        published: publishedAds,
        hidden: hiddenAds,
      },
      socialLinks: {
        total: socials.length,
        active: activeSocials,
      },
      frequencies: {
        total: frequencies.length,
        active: activeFrequencies,
        hasDefault: hasDefaultFrequency,
      },
      sections: {
        total: sections.length,
        visible: visibleSections,
        hidden: hiddenSections.length,
      },
    },
    issues,
  };

  return jsonResponse(stats);
}
