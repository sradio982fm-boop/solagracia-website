import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Solagracia Admin</h1>
      <p className="text-[var(--text-dim)]">CMS shell — wire auth and routes next.</p>
      <Link href="/admin/login" className="text-[var(--accent)] underline">
        Go to login
      </Link>
    </main>
  );
}
