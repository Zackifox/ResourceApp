import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FilAriane } from "@/components/fil-ariane";
import { CYCLES } from "@/lib/format";
import type { Filiere, Institut } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/instituts/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("instituts").select("sigle").eq("slug", slug).single();
  return { title: data?.sigle ?? "Institut" };
}

export default async function PageInstitut({ params }: PageProps<"/instituts/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: institut } = await supabase
    .from("instituts")
    .select("*, filieres(*)")
    .eq("slug", slug)
    .single<Institut & { filieres: Filiere[] }>();

  if (!institut) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FilAriane etapes={[{ label: "Ressources", href: "/instituts" }, { label: institut.sigle }]} />
      <h1 className="text-3xl font-bold text-primaire">{institut.sigle}</h1>
      <p className="text-lg font-medium">{institut.nom}</p>
      {institut.description && <p className="mt-3 max-w-3xl text-attenue">{institut.description}</p>}

      {(["licence", "master"] as const).map((cycle) => {
        const filieres = institut.filieres.filter((f) => f.cycle === cycle);
        if (filieres.length === 0) return null;

        // Regroupe par description (ex. « Master de droit privé ») quand elle existe
        const groupes = new Map<string, Filiere[]>();
        for (const f of filieres.sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom))) {
          const cle = f.description ?? "";
          groupes.set(cle, [...(groupes.get(cle) ?? []), f]);
        }

        return (
          <section key={cycle} className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-1.5 rounded bg-or" /> {CYCLES[cycle]}
            </h2>
            {[...groupes.entries()].map(([groupe, liste]) => (
              <div key={groupe} className="mb-6">
                {groupe && <h3 className="mb-2 text-sm font-semibold tracking-wide text-attenue uppercase">{groupe}</h3>}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {liste.map((f) => (
                    <Link
                      key={f.id}
                      href={`/filieres/${f.id}`}
                      className="carte flex items-center justify-between gap-3 p-4 transition hover:border-primaire-clair hover:shadow-md"
                    >
                      <span>
                        <span className="block font-medium">{f.nom}</span>
                        <span className="text-sm text-attenue">{f.niveaux.join(" · ")}</span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-primaire" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
