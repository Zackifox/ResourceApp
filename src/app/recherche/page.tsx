import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FilAriane } from "@/components/fil-ariane";
import { RessourceItem } from "@/components/ressource-item";
import type { Filiere, Institut, Matiere, Ressource } from "@/lib/types";

export const metadata: Metadata = { title: "Recherche" };

type MatiereAvecFiliere = Matiere & { filieres: Filiere & { instituts: Institut } };

export default async function PageRecherche({ searchParams }: PageProps<"/recherche">) {
  const { q } = await searchParams;
  const terme = typeof q === "string" ? q.trim() : "";

  let ressources: (Ressource & { matieres: MatiereAvecFiliere })[] = [];
  let matieres: MatiereAvecFiliere[] = [];

  if (terme.length >= 2) {
    const supabase = await createClient();
    // Échappe les caractères spéciaux du filtre ILIKE
    const motif = `%${terme.replace(/[%_\\,()]/g, " ")}%`;
    const [r, m] = await Promise.all([
      supabase
        .from("ressources")
        .select("*, matieres(*, filieres(*, instituts(*)))")
        .or(`titre.ilike.${motif},description.ilike.${motif}`)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("matieres")
        .select("*, filieres(*, instituts(*))")
        .ilike("nom", motif)
        .limit(30),
    ]);
    ressources = (r.data ?? []) as typeof ressources;
    matieres = (m.data ?? []) as typeof matieres;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FilAriane etapes={[{ label: "Recherche" }]} />
      <h1 className="mb-4 text-3xl font-bold text-primaire">Recherche</h1>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-attenue" />
          <input
            name="q"
            defaultValue={terme}
            autoFocus
            placeholder="Titre d'un cours, nom d'une matière…"
            className="champ h-11 pl-10"
          />
        </div>
        <button className="btn-primaire h-11">Rechercher</button>
      </form>

      {terme.length >= 2 && (
        <>
          {matieres.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Matières ({matieres.length})</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {matieres.map((m) => (
                  <Link key={m.id} href={`/matieres/${m.id}`} className="carte flex items-center gap-3 p-4 hover:border-primaire-clair">
                    <BookOpen size={20} className="shrink-0 text-primaire" />
                    <span>
                      <span className="block font-medium">{m.nom}</span>
                      <span className="text-sm text-attenue">
                        {m.filieres.instituts.sigle} · {m.filieres.nom} · {m.niveau}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Ressources ({ressources.length})</h2>
            {ressources.length === 0 ? (
              <p className="carte p-6 text-center text-attenue">Aucune ressource ne correspond à « {terme} ».</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {ressources.map((r) => (
                  <RessourceItem
                    key={r.id}
                    ressource={r}
                    contexte={`${r.matieres.filieres.instituts.sigle} · ${r.matieres.filieres.nom} · ${r.matieres.niveau} · ${r.matieres.nom}`}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
