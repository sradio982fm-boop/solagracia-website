"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import { TentangConfigPanel } from "@/components/admin/TentangConfigPanel";

export default function SiteTentangPage() {
  return (
    <SiteConfigPageShell
      title="Tentang"
      description="Konten section Tentang Kami di homepage."
    >
      {({ config, saving, save }) => (
        <TentangConfigPanel config={config} saving={saving} onSave={save} />
      )}
    </SiteConfigPageShell>
  );
}
