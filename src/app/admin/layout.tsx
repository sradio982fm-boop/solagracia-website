import { AdminMantineProvider } from "@/lib/admin/mantine-provider";
import { AdminQueryProvider } from "@/lib/admin/query-provider";
import { Toaster } from "sonner";

export const metadata = {
  title: "Admin",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminQueryProvider>
      <AdminMantineProvider>
        {children}
        <Toaster position="top-right" richColors />
      </AdminMantineProvider>
    </AdminQueryProvider>
  );
}
