import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FilAriane } from "@/components/fil-ariane";
import { CYCLES } from "@/lib/format";
import type { Filiere, Institut, Matiere } from "@/lib/types";

type FiliereComplete = Filiere & {
  instituts: Institut;
  matieres: (Matiere & { ressources: { count: number }[] })[];
};

export async function generateMetadata({ params }: PageProps<"/filieres/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("filieres").select("nom").eq("id", id).single();
  return { title: data?.nom ?? "Filière" };
}

export default async function PageFiliere({ params, searchParams }: PageProps<"/filieres/[id]">) {
  const { id } = await params;
  const { niveau: niveauDemande } = await searchParams;
  const supabase = await createClient();

  const { data: filiere } = await supabase
    .from("filieres")
    .select("*, instituts(*), matieres(*, ressources(count))")
    .eq("id", id)
    .single<FiliereComplete>();

  if (!filiere) notFound();

  const niveau =
    typeof niveauDemande === "string" && filiere.niveaux.includes(niveauDemande)
      ? niveauDemande
      : filiere.niveaux[0];
  const matieres = filiere.matieres
    .filter((m) => m.niveau === niveau)
    .sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FilAriane
        etapes={[
          { label: "Ressources", href: "/instituts" },
          { label: filiere.instituts.sigle, href: `/instituts/${filiere.instituts.slug}` },
          { label: filiere.nom },
        ]}
      />
      <p className="text-sm font-medium text-attenue">{CYCLES[filiere.cycle]}</p>
      <h1 className="text-3xl font-bold text-primaire">{filiere.nom}</h1>

      {/* Choix du niveau */}
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-bordure">
        {filiere.niveaux.map((n) => (
          <Link
            key={n}
            href={`/filieres/${filiere.id}?niveau=${n}`}
            scroll={false}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              n === niveau ? "border-primaire text-primaire" : "border-transparent text-attenue hover:text-texte"
            }`}
          >
            {n}
          </Link>
        ))}
      </div>

      <h2 className="mt-6 mb-4 text-lg font-semibold">Matières de {niveau}</h2>
      {matieres.length === 0 ? (
        <p className="carte p-6 text-center text-attenue">
          Aucune matière n&apos;a encore été ajoutée pour ce niveau.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matieres.map((m) => {
            const nb = m.ressources[0]?.count ?? 0;
            return (
              <Link
                key={m.id}
                href={`/matieres/${m.id}`}
                className="carte flex items-center gap-3 p-4 transition hover:border-primaire-clair hover:shadow-md"
              >
                <BookOpen size={20} className="shrink-0 text-primaire" />
                <span className="flex-1">
                  <span className="block font-medium">{m.nom}</span>
                  <span className="text-sm text-attenue">
                    {nb} ressource{nb > 1 ? "s" : ""}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-primaire" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
