"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function basculerLike(communiqueId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existant } = await supabase
    .from("likes")
    .select("user_id")
    .eq("communique_id", communiqueId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existant) {
    await supabase.from("likes").delete().eq("communique_id", communiqueId).eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ communique_id: communiqueId, user_id: user.id });
  }

  revalidatePath(`/communiques/${communiqueId}`);
}

export async function commenter(
  communiqueId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const contenu = String(formData.get("contenu") ?? "").trim();
  if (!contenu) return { error: "Le commentaire est vide." };
  if (contenu.length > 2000) return { error: "Le commentaire est trop long (2000 caractères max)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté pour commenter." };

  const { error } = await supabase
    .from("commentaires")
    .insert({ communique_id: communiqueId, user_id: user.id, contenu });
  if (error) return { error: "Impossible de publier le commentaire." };

  revalidatePath(`/communiques/${communiqueId}`);
  return { message: "ok" };
}

export async function supprimerCommentaire(formData: FormData) {
  const id = String(formData.get("id"));
  const communiqueId = String(formData.get("communique_id"));

  // La sécurité RLS n'autorise que l'auteur ou un admin
  const supabase = await createClient();
  await supabase.from("commentaires").delete().eq("id", id);

  revalidatePath(`/communiques/${communiqueId}`);
}
