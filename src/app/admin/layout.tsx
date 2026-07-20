import { AdminAuthProvider } from "@/lib/admin/auth-context";
import { AdminMantineProvider } from "@/lib/admin/mantine-provider";
import { AdminQueryProvider } from "@/lib/admin/query-provider";
import { Toaster } from "sonner";

export const metadata = {
  title: "Admin · Solagracia",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminQueryProvider>
      <AdminMantineProvider>
        <AdminAuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AdminAuthProvider>
      </AdminMantineProvider>
    </AdminQueryProvider>
  );
}
