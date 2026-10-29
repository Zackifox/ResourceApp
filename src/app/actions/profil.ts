"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const TAILLE_MAX_PHOTO = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function modifierProfil(_: ActionState, formData: FormData): Promise<ActionState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const filiereId = String(formData.get("filiere_id") ?? "") || null;
  const niveau = String(formData.get("niveau") ?? "") || null;

  if (nom.length < 2) return { error: "Veuillez indiquer votre nom complet." };
  if (nom.length > 80) return { error: "Le nom est trop long (80 caractères max)." };
  if (bio && bio.length > 300) return { error: "La présentation est trop longue (300 caractères max)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  // Le niveau doit exister dans la filière choisie
  if (niveau) {
    const { data: filiere } = await supabase.from("filieres").select("niveaux").eq("id", filiereId ?? "").maybeSingle();
    if (!filiere?.niveaux.includes(niveau)) return { error: "Ce niveau n'existe pas dans la filière choisie." };
  }

  const { data: actuel } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).single();
  const anciennePhoto = actuel?.avatar_path ?? null;
  const donnees: Record<string, string | null> = { nom, bio, filiere_id: filiereId, niveau };

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const extension = EXTENSIONS[photo.type];
    if (!extension) return { error: "La photo doit être au format JPEG, PNG ou WebP." };
    if (photo.size > TAILLE_MAX_PHOTO) return { error: "La photo ne doit pas dépasser 2 Mo." };
    // Un dossier par utilisateur : la sécurité du stockage n'autorise que le sien
    const path = `${user.id}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(path, photo, { contentType: photo.type });
    if (error) return { error: "Envoi de la photo impossible : " + error.message };
    donnees.avatar_path = path;
  } else if (formData.get("retirer_photo") === "on") {
    donnees.avatar_path = null;
  }

  const { error } = await supabase.from("profiles").update(donnees).eq("id", user.id);
  if (error) return { error: "Enregistrement impossible : " + error.message };

  if (anciennePhoto && donnees.avatar_path !== undefined) {
    await supabase.storage.from("avatars").remove([anciennePhoto]);
  }

  revalidatePath("/", "layout");
  return { message: "Profil enregistré." };
}
