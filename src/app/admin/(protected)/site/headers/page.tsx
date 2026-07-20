"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSurface } from "@/components/admin/AdminSurface";
import { changeValue } from "@/lib/admin/form";
import {
  useSectionHeaders,
  useUpdateSectionHeader,
  type SectionHeader,
} from "@/hooks/admin/useSiteConfig";

function HeaderEditor({
  header,
  saving,
  onSave,
}: {
  header: SectionHeader;
  saving: boolean;
  onSave: (data: {
    section: string;
    eyebrow?: string;
    title?: string;
    titleAccent?: string;
    description?: string;
  }) => Promise<void>;
}) {
  const [eyebrow, setEyebrow] = useState(header.eyebrow);
  const [title, setTitle] = useState(header.title);
  const [titleAccent, setTitleAccent] = useState(header.titleAccent);
  const [description, setDescription] = useState(header.description);

  useEffect(() => {
    setEyebrow(header.eyebrow);
    setTitle(header.title);
    setTitleAccent(header.titleAccent);
    setDescription(header.description);
  }, [header]);

  return (
    <AdminSurface p="md">
      <Title order={5} mb="md" tt="capitalize">
        {header.section}
      </Title>
      <Stack gap="md">
        <TextInput
          label="Eyebrow"
          value={eyebrow}
          onChange={(e) => setEyebrow(changeValue(e))}
          size="sm"
        />
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(changeValue(e))}
          size="sm"
        />
        <TextInput
          label="Title accent"
          value={titleAccent}
          onChange={(e) => setTitleAccent(changeValue(e))}
          size="sm"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(changeValue(e))}
          rows={3}
          size="sm"
        />
        <Group justify="flex-end">
          <Button
            loading={saving}
            onClick={() =>
              onSave({
                section: header.section,
                eyebrow,
                title,
                titleAccent,
                description,
              })
            }
          >
            Simpan
          </Button>
        </Group>
      </Stack>
    </AdminSurface>
  );
}

export default function SiteHeadersPage() {
  const { data, isLoading } = useSectionHeaders();
  const updateHeader = useUpdateSectionHeader();

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={28} width={220} />
        <Skeleton height={160} />
        <Skeleton height={160} />
      </Stack>
    );
  }

  const headers = data?.headers || [];

  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Section Headers"
        description="Eyebrow, title, accent, dan description untuk tiap seksi publik."
      />
      {headers.length === 0 ? (
        <Text size="sm" c="dimmed">
          Belum ada section header.
        </Text>
      ) : (
        headers.map((header) => (
          <HeaderEditor
            key={header.id || header.section}
            header={header}
            saving={updateHeader.isPending}
            onSave={async (payload) => {
              await updateHeader.mutateAsync(payload);
            }}
          />
        ))
      )}
    </Stack>
  );
}
