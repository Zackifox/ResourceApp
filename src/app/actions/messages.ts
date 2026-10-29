"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Canal, Message } from "@/lib/types";

const TABLES = { salon: "messages_salon", prive: "messages_prives" } as const;
const COLONNES = { salon: "salon_id", prive: "conversation_id" } as const;

export async function envoyerMessage(
  canal: Canal,
  contenu: string,
): Promise<{ error: string } | { message: Message }> {
  contenu = contenu.trim();
  if (!contenu) return { error: "Le message est vide." };
  if (contenu.length > 2000) return { error: "Le message est trop long (2000 caractères max)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté pour écrire." };

  // La sécurité RLS vérifie que l'auteur participe à la conversation privée
  const { data, error } = await supabase
    .from(TABLES[canal.type])
    .insert({ [COLONNES[canal.type]]: canal.id, user_id: user.id, contenu })
    .select("id, user_id, contenu, created_at, profiles(nom, role, avatar_path)")
    .single<Message>();
  if (error || !data) return { error: "Impossible d'envoyer le message." };

  return { message: data };
}

export async function supprimerMessage(canal: Canal, id: string) {
  // La sécurité RLS n'autorise que l'auteur (ou un admin dans les salons)
  const supabase = await createClient();
  const { error } = await supabase.from(TABLES[canal.type]).delete().eq("id", id);
  return !error;
}

export async function ecrireA(autreId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ouvrir_conversation", { autre: autreId });
  if (error || !data) redirect("/messages");
  redirect(`/messages/prives/${data}`);
}
