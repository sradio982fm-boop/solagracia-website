"use client";

import type { ReactNode } from "react";
import { Skeleton, Stack } from "@mantine/core";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSurface } from "@/components/admin/AdminSurface";
import {
  useSiteConfig,
  useUpdateSiteConfig,
  type SiteConfigMap,
  type SiteConfigUpdate,
} from "@/hooks/admin/useSiteConfig";

type Props = {
  title: string;
  description: string;
  children: (ctx: {
    config: SiteConfigMap | undefined;
    saving: boolean;
    save: (updates: SiteConfigUpdate[]) => Promise<void>;
  }) => ReactNode;
};

export function SiteConfigPageShell({ title, description, children }: Props) {
  const { data, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={28} width={220} />
        <Skeleton height={180} />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <AdminPageHeader title={title} description={description} />
      <AdminSurface p="md">
        {children({
          config: data?.config,
          saving: updateConfig.isPending,
          save: async (updates) => {
            await updateConfig.mutateAsync({ updates });
          },
        })}
      </AdminSurface>
    </Stack>
  );
}
