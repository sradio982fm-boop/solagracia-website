import type { Metadata } from "next";
import Link from "next/link";
import { fetchPrivacyContent, fetchSeoContent } from "@/lib/data-fetcher";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [privacy, seo] = await Promise.all([
    fetchPrivacyContent(),
    fetchSeoContent(),
  ]);

  return {
    title: privacy.title,
    description: privacy.body[0] || seo.description,
  };
}

export default async function PrivacyPage() {
  const privacy = await fetchPrivacyContent();

  return (
    <main className="min-h-screen bg-[var(--bg-void)] px-4 py-16 text-[var(--text-main)] sm:px-6">
      <article className="mx-auto w-full max-w-[40rem]">
        <p className="m-0 text-[0.7rem] font-semibold tracking-[0.18em] text-[var(--text-dim)] uppercase">
          Legal
        </p>
        <h1 className="mt-3 m-0 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
          {privacy.title}
        </h1>
        <p className="mt-3 m-0 text-[0.85rem] text-[var(--text-dim)]">
          {privacy.updatedLabel}
        </p>
        <div className="mt-8 space-y-5 text-[1rem] leading-[1.7] text-[var(--text-dim)]">
          {privacy.body.map((paragraph, index) => (
            <p key={index} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
        <p className="mt-10 m-0">
          <Link
            href="/#kontak"
            className="text-[0.8rem] font-semibold tracking-[0.14em] text-[var(--text-main)] uppercase no-underline underline-offset-4 hover:underline"
          >
            Kembali ke kontak →
          </Link>
        </p>
      </article>
    </main>
  );
}
