import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nomFichierSur, urlPublique } from "@/lib/format";

// Ouvre ou télécharge un PDF, et compte les téléchargements
export async function GET(request: NextRequest, { params }: RouteContext<"/api/ressources/[id]">) {
  const { id } = await params;
  const telecharger = request.nextUrl.searchParams.has("telecharger");

  const supabase = await createClient();
  const { data: ressource } = await supabase
    .from("ressources")
    .select("titre, fichier_path")
    .eq("id", id)
    .single();

  if (!ressource) return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });

  let url = urlPublique("ressources", ressource.fichier_path);
  if (telecharger) {
    await supabase.rpc("incrementer_telechargement", { ressource_id: id });
    url += `?download=${encodeURIComponent(nomFichierSur(ressource.titre) + ".pdf")}`;
  }

  return NextResponse.redirect(url);
}
