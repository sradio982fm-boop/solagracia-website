"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/admin/auth-context";
import {
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Center,
  Loader,
} from "@mantine/core";
import { ADMIN_BORDER, ADMIN_PAGE_BG, ADMIN_TEAL } from "@/lib/admin/ui";

function safeAdminNext(next: string | null): string {
  if (next && next.startsWith("/admin") && !next.startsWith("/admin/login")) {
    return next;
  }
  return "/admin/dashboard";
}

export default function AdminLoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeAdminNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath);
    }
  }, [user, isLoading, router, nextPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh" bg={ADMIN_PAGE_BG}>
        <Stack align="center" gap="sm">
          <Loader color="sg" size="sm" />
          <Text size="sm" c="dimmed">
            Memuat…
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center mih="100vh" bg={ADMIN_PAGE_BG} px="md">
      <Paper
        component="form"
        onSubmit={handleSubmit}
        p={{ base: "lg", sm: "xl" }}
        w="100%"
        maw={400}
        withBorder
        radius="md"
        style={{ borderColor: ADMIN_BORDER }}
      >
        <Stack gap="md">
          <div>
            <Title order={1} size="h3" fw={900} tt="uppercase" c={ADMIN_TEAL}>
              Solagracia
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Masuk ke panel admin
            </Text>
          </div>
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="username"
            inputMode="email"
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            autoComplete="current-password"
          />
          {error ? (
            <Text size="sm" c="red" role="alert">
              {error}
            </Text>
          ) : null}
          <Button type="submit" loading={submitting} fullWidth size="md">
            Masuk
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
