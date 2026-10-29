import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FilAriane } from "@/components/fil-ariane";
import { RessourceItem } from "@/components/ressource-item";
import { TYPES_RESSOURCE } from "@/lib/format";
import type { Filiere, Institut, Matiere, Ressource, TypeRessource } from "@/lib/types";

type MatiereComplete = Matiere & {
  filieres: Filiere & { instituts: Institut };
  ressources: Ressource[];
};

export async function generateMetadata({ params }: PageProps<"/matieres/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("matieres").select("nom").eq("id", id).single();
  return { title: data?.nom ?? "Matière" };
}

export default async function PageMatiere({ params, searchParams }: PageProps<"/matieres/[id]">) {
  const { id } = await params;
  const { type } = await searchParams;
  const supabase = await createClient();

  const { data: matiere } = await supabase
    .from("matieres")
    .select("*, filieres(*, instituts(*)), ressources(*)")
    .eq("id", id)
    .single<MatiereComplete>();

  if (!matiere) notFound();

  const filtre = typeof type === "string" && type in TYPES_RESSOURCE ? (type as TypeRessource) : null;
  const ressources = matiere.ressources
    .filter((r) => !filtre || r.type === filtre)
    .sort((a, b) => (b.annee ?? 0) - (a.annee ?? 0) || b.created_at.localeCompare(a.created_at));
  const { filieres: filiere } = matiere;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FilAriane
        etapes={[
          { label: filiere.instituts.sigle, href: `/instituts/${filiere.instituts.slug}` },
          { label: filiere.nom, href: `/filieres/${filiere.id}` },
          { label: matiere.niveau, href: `/filieres/${filiere.id}?niveau=${matiere.niveau}` },
          { label: matiere.nom },
        ]}
      />
      <h1 className="text-3xl font-bold text-primaire">{matiere.nom}</h1>
      <p className="text-attenue">
        {filiere.nom} · {matiere.niveau}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Filtre href={`/matieres/${id}`} actif={!filtre}>Tout ({matiere.ressources.length})</Filtre>
        {(Object.keys(TYPES_RESSOURCE) as TypeRessource[]).map((t) => {
          const nb = matiere.ressources.filter((r) => r.type === t).length;
          if (nb === 0) return null;
          return (
            <Filtre key={t} href={`/matieres/${id}?type=${t}`} actif={filtre === t}>
              {TYPES_RESSOURCE[t]} ({nb})
            </Filtre>
          );
        })}
      </div>

      {ressources.length === 0 ? (
        <p className="carte mt-6 p-6 text-center text-attenue">
          Aucune ressource disponible pour cette matière pour le moment.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {ressources.map((r) => (
            <RessourceItem key={r.id} ressource={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Filtre({ href, actif, children }: { href: string; actif: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-full border px-3 py-1 text-sm ${
        actif ? "border-primaire bg-primaire text-white" : "border-bordure bg-white hover:bg-fond"
      }`}
    >
      {children}
    </Link>
  );
}
