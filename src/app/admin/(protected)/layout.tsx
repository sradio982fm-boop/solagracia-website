/**
 * Protected admin shell. Add session checks / AuthGuard here later.
 */
export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
