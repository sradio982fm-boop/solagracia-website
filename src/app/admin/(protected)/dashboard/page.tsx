export default function AdminDashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-[var(--text-dim)]">
        Protected route group — add panels under <code>admin/(protected)/</code>.
      </p>
    </main>
  );
}
