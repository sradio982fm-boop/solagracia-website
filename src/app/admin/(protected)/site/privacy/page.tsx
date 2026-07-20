"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import { PrivacyConfigPanel } from "@/components/admin/PrivacyConfigPanel";

export default function SitePrivacyPage() {
  return (
    <SiteConfigPageShell
      title="Kebijakan Privasi"
      description="Konten halaman kebijakan privasi."
    >
      {({ config, saving, save }) => (
        <PrivacyConfigPanel config={config} saving={saving} onSave={save} />
      )}
    </SiteConfigPageShell>
  );
}
