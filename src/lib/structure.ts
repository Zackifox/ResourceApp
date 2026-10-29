import type { createClient } from "./supabase/server";
import type { InstitutsFilieres } from "@/components/choix-filiere";

// Instituts et leurs filières, dans l'ordre d'affichage
export async function institutsEtFilieres(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("instituts")
    .select("id, sigle, nom, filieres(id, nom, cycle, niveaux, ordre)")
    .order("ordre");
  const instituts = (data ?? []) as InstitutsFilieres;
  for (const i of instituts) i.filieres.sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom, "fr"));
  return instituts;
}
