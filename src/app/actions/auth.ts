"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function connexion(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  const suite = String(formData.get("suite") ?? "/");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

  if (error) {
    if (error.code === "email_not_confirmed")
      return { error: "Veuillez d'abord confirmer votre adresse e-mail (vérifiez votre boîte de réception)." };
    return { error: "E-mail ou mot de passe incorrect." };
  }

  revalidatePath("/", "layout");
  // N'accepte que les chemins internes pour éviter les redirections externes
  redirect(suite.startsWith("/") && !suite.startsWith("//") ? suite : "/");
}

export async function inscription(_: ActionState, formData: FormData): Promise<ActionState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");

  if (nom.length < 2) return { error: "Veuillez indiquer votre nom complet." };
  if (motDePasse.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: { data: { nom }, emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    if (error.code === "user_already_exists") return { error: "Un compte existe déjà avec cet e-mail." };
    if (error.code === "weak_password") return { error: "Mot de passe trop faible." };
    return { error: "Inscription impossible : " + error.message };
  }

  // Si la confirmation par e-mail est désactivée, l'utilisateur est déjà connecté
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return {
    message: "Compte créé ! Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.",
  };
}

export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
