import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { InstitutCard } from "@/components/institut-card";
import { FilAriane } from "@/components/fil-ariane";
import type { Institut } from "@/lib/types";

export const metadata: Metadata = { title: "Ressources par institut" };

export default async function PageInstituts() {
  const supabase = await createClient();
  const { data } = await supabase.from("instituts").select("*, filieres(count)").order("ordre");
  const instituts = data as (Institut & { filieres: { count: number }[] })[] | null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FilAriane etapes={[{ label: "Ressources" }]} />
      <h1 className="mb-6 text-3xl font-bold text-primaire">Instituts</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {instituts?.map((i) => (
          <InstitutCard key={i.id} institut={i} nbFilieres={i.filieres[0]?.count} />
        ))}
      </div>
    </div>
  );
}
