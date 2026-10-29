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
  const confirmation = String(formData.get("confirmation") ?? "");
  // Facultatifs ; la base vérifie que la filière et le niveau existent
  const filiereId = String(formData.get("filiere_id") ?? "") || null;
  const niveau = String(formData.get("niveau") ?? "") || null;

  if (nom.length < 2) return { error: "Veuillez indiquer votre nom complet." };
  if (nom.length > 80) return { error: "Le nom est trop long (80 caractères max)." };
  if (motDePasse.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (motDePasse !== confirmation) return { error: "Les deux mots de passe ne sont pas identiques." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: { data: { nom, filiere_id: filiereId, niveau }, emailRedirectTo: `${origin}/auth/callback` },
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

export async function demanderReinitialisation(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Veuillez indiquer votre adresse e-mail." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?suite=/nouveau-mot-de-passe`,
  });
  if (error?.code === "over_email_send_rate_limit")
    return { error: "Trop de demandes. Patientez quelques minutes avant de réessayer." };

  // Même réponse que le compte existe ou non, pour ne pas révéler les adresses inscrites
  return {
    message:
      "Si un compte existe avec cette adresse, un e-mail vient de vous être envoyé. Ouvrez le lien qu'il contient sur cet appareil et dans ce navigateur.",
  };
}

export async function changerMotDePasse(_: ActionState, formData: FormData): Promise<ActionState> {
  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (motDePasse.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (motDePasse !== confirmation) return { error: "Les deux mots de passe ne sont pas identiques." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: motDePasse });
  if (error) {
    if (error.code === "same_password") return { error: "Choisissez un mot de passe différent de l'ancien." };
    if (error.code === "weak_password") return { error: "Mot de passe trop faible." };
    return { error: "Modification impossible : " + error.message };
  }

  return { message: "Mot de passe modifié." };
}

export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
