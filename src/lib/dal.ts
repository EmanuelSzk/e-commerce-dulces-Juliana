import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

// Mirrors the Supabase auth user into our own Profile table. Called at every
// auth entry point (signup action, OAuth callback) so a profile always exists
// by the time the app reads one.
export async function syncProfile(user: User, fallbackName?: string) {
  const name =
    fallbackName ??
    (user.user_metadata.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Cliente";

  return prisma.profile.upsert({
    where: { id: user.id },
    update: { email: user.email! },
    create: { id: user.id, email: user.email!, name },
  });
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.profile.findUnique({ where: { id: user.id } });
});

export async function requireUser() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/cuenta/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();
  if (profile.role !== "ADMIN") redirect("/");
  return profile;
}
