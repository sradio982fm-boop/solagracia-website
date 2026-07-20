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
} from "@mantine/core";

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
      <Center h="100vh">
        <Text c="dimmed">Memuat…</Text>
      </Center>
    );
  }

  return (
    <Center mih="100vh" bg="#f5f5f5" px="md">
      <Paper
        component="form"
        onSubmit={handleSubmit}
        p="xl"
        w="100%"
        maw={400}
        withBorder
        style={{ borderColor: "#0a0a0a" }}
      >
        <Stack gap="md">
          <div>
            <Title order={3} fw={900} tt="uppercase">
              Solagracia
            </Title>
            <Text size="sm" c="dimmed">
              Admin login
            </Text>
          </div>
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="username"
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <Text size="sm" c="red">
              {error}
            </Text>
          )}
          <Button type="submit" color="dark" loading={submitting} fullWidth>
            Masuk
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
