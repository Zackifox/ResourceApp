import type { createClient } from "./supabase/server";
import type { Message, Salon } from "./types";

type Client = Awaited<ReturnType<typeof createClient>>;

export type SalonAffiche = Salon & {
  filieres: { nom: string; instituts: { sigle: string } | null } | null;
};

export function nomSalon(s: SalonAffiche) {
  if (!s.filieres) return s.nom;
  return s.filieres.instituts ? `${s.filieres.instituts.sigle} · ${s.filieres.nom}` : s.filieres.nom;
}

// Les 100 derniers messages d'un salon ou d'une conversation, du plus ancien au plus récent
export async function derniersMessages(supabase: Client, table: "messages_salon" | "messages_prives", colonne: string, id: string) {
  const { data } = await supabase
    .from(table)
    .select("id, user_id, contenu, created_at, profiles(nom, role, avatar_path)")
    .eq(colonne, id)
    .order("created_at", { ascending: false })
    .limit(100)
    .overrideTypes<Message[], { merge: false }>();
  return (data ?? []).reverse();
}
