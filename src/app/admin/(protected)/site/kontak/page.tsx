"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import { KontakConfigPanel } from "@/components/admin/KontakConfigPanel";

export default function SiteKontakPage() {
  return (
    <SiteConfigPageShell
      title="Kontak"
      description="Alamat studio, hotline, channel, dan form kontak."
    >
      {({ config, saving, save }) => (
        <KontakConfigPanel config={config} saving={saving} onSave={save} />
      )}
    </SiteConfigPageShell>
  );
}
