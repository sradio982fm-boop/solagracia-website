"use client";

import { Stack, Text } from "@mantine/core";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSurface } from "@/components/admin/AdminSurface";
import { SectionOrderManager } from "@/components/admin/SectionOrderManager";

export default function SiteSectionsPage() {
  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Urutan Section"
        description="Homepage order, visibility, label GRACIA, dan surface metadata."
      />
      <AdminSurface p="md">
        <Text size="sm" c="dimmed" mb="md">
          Drag untuk mengubah urutan. Visibility dan label dikelola per section.
        </Text>
        <SectionOrderManager />
      </AdminSurface>
    </Stack>
  );
}
