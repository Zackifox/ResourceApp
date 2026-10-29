import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

// Utilisateur connecté et son profil (mis en cache pour la durée de la requête)
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile, isAdmin: profile?.role === "admin" };
});

export async function requireSession(suite: string) {
  const session = await getSession();
  if (!session) redirect(`/connexion?suite=${suite}`);
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/connexion?suite=/admin");
  if (!session.isAdmin) redirect("/");
  return session;
}
