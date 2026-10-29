import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FilAriane } from "@/components/fil-ariane";
import { CommuniqueCard } from "@/components/communique-card";
import type { Communique } from "@/lib/types";

export const metadata: Metadata = { title: "Communiqués" };

type CommuniqueAvecStats = Communique & { likes: { count: number }[]; commentaires: { count: number }[] };

export default async function PageCommuniques() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communiques")
    .select("*, likes(count), commentaires(count)")
    .order("epingle", { ascending: false })
    .order("created_at", { ascending: false });
  const communiques = (data ?? []) as CommuniqueAvecStats[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FilAriane etapes={[{ label: "Communiqués" }]} />
      <h1 className="text-3xl font-bold text-primaire">Communiqués</h1>
      <p className="mb-6 text-attenue">Informations et annonces du bureau de l&apos;UET-UCAO.</p>
      {communiques.length === 0 ? (
        <p className="carte p-6 text-center text-attenue">Aucun communiqué pour le moment.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communiques.map((c) => (
            <CommuniqueCard key={c.id} communique={c} />
          ))}
        </div>
      )}
    </div>
  );
}
