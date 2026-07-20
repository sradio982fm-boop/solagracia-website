"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/admin/auth-context";
import { Center, Stack, Skeleton } from "@mantine/core";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/admin/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Skeleton height={40} circle />
          <Skeleton height={14} width={120} radius="sm" />
        </Stack>
      </Center>
    );
  }

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
