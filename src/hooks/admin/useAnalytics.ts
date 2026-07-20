"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";

export interface OverviewSummary {
  uniqueVisitors: number;
  totalSessions: number;
  streamPlays: number;
  audioPlays: number;
  totalPageViews: number;
  avgSessionDuration: number;
  contactForms: number;
}

export interface DailyEntry {
  day: string;
  streamPlays: number;
  audioPlays: number;
}

export interface SectionEntry {
  sectionId: string;
  views: number;
}

export interface CountryEntry {
  country: string;
  visitors: number;
}

export interface OverviewResponse {
  period: { from: string; to: string };
  summary: OverviewSummary;
  daily: DailyEntry[];
  topSections: SectionEntry[];
  topCountries: CountryEntry[];
}

export interface Visitor {
  id: string;
  uid: string;
  ip: string;
  city: string | null;
  region: string | null;
  country: string | null;
  viewport: string | null;
  firstSeen: string;
  lastSeen: string;
  totalSessions: number;
  totalPageViews: number;
}

export interface VisitorsPage {
  visitors: Visitor[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AnalyticsEvent {
  id: number;
  eventType: string;
  eventData: string | null;
  occurredAt: string;
  visitor: { uid: string; city: string | null; country: string | null } | null;
  sessionSid: string | null;
}

export interface EventsPage {
  events: AnalyticsEvent[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface VisitorFilters extends DateRangeFilter {
  country?: string;
}

export interface EventFilters extends DateRangeFilter {
  type?: string;
  visitorId?: string;
}

export function useAnalyticsOverview(filters: DateRangeFilter = {}) {
  return useQuery({
    queryKey: ["admin", "analytics", "overview", filters],
    queryFn: () =>
      adminFetch<OverviewResponse>("/admin/analytics/overview", {
        params: {
          ...(filters.from ? { from: filters.from } : {}),
          ...(filters.to ? { to: filters.to } : {}),
        },
      }),
  });
}

export function useVisitors(filters: VisitorFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["admin", "analytics", "visitors", filters],
    queryFn: ({ pageParam }) =>
      adminFetch<VisitorsPage>("/admin/analytics/visitors", {
        params: {
          limit: 50,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(filters.country ? { country: filters.country } : {}),
          ...(filters.from ? { from: filters.from } : {}),
          ...(filters.to ? { to: filters.to } : {}),
        },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useEvents(filters: EventFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["admin", "analytics", "events", filters],
    queryFn: ({ pageParam }) =>
      adminFetch<EventsPage>("/admin/analytics/events", {
        params: {
          limit: 100,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(filters.type ? { type: filters.type } : {}),
          ...(filters.from ? { from: filters.from } : {}),
          ...(filters.to ? { to: filters.to } : {}),
          ...(filters.visitorId ? { visitorId: filters.visitorId } : {}),
        },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
