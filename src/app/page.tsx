import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText, Megaphone, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InstitutCard } from "@/components/institut-card";
import { CommuniqueCard } from "@/components/communique-card";
import type { Communique, Institut } from "@/lib/types";

export default async function Accueil() {
  const supabase = await createClient();

  const [{ data: instituts }, { data: communiques }, { count: nbRessources }] = await Promise.all([
    supabase.from("instituts").select("*, filieres(count)").order("ordre"),
    supabase
      .from("communiques")
      .select("*, likes(count), commentaires(count)")
      .order("epingle", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("ressources").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      {/* Bandeau d'accueil */}
      <section className="bg-primaire text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-or">
            Union des Étudiants Tchadiens · UCAO-UUT
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Tous vos cours et sujets d&apos;examen, au même endroit.
          </h1>
          <p className="mt-4 max-w-2xl text-white/80 md:text-lg">
            Consultez et téléchargez gratuitement les ressources pédagogiques en PDF, classées par
            institut, filière, niveau et matière.
          </p>

          <form action="/recherche" className="mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-attenue" />
              <input
                name="q"
                placeholder="Rechercher un cours, une matière…"
                className="champ h-12 pl-10 text-base text-texte"
              />
            </div>
            <button className="btn h-12 bg-or px-5 font-semibold text-primaire hover:brightness-95">
              Rechercher
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
            <span className="flex items-center gap-2"><FileText size={18} className="text-or" /> {nbRessources ?? 0} ressources</span>
            <span className="flex items-center gap-2"><BookOpen size={18} className="text-or" /> {instituts?.length ?? 0} instituts</span>
            <span className="flex items-center gap-2"><Download size={18} className="text-or" /> Accès libre et gratuit</span>
          </div>
        </div>
      </section>

      {/* Instituts */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-1 text-2xl font-bold text-primaire">Choisissez votre institut</h2>
        <p className="mb-6 text-attenue">Puis votre filière, votre niveau et votre matière.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(instituts as (Institut & { filieres: { count: number }[] })[] | null)?.map((i) => (
            <InstitutCard key={i.id} institut={i} nbFilieres={i.filieres[0]?.count} />
          ))}
        </div>
      </section>

      {/* Communiqués */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primaire">
              <Megaphone size={24} /> Derniers communiqués
            </h2>
            <p className="text-attenue">Les informations du bureau de l&apos;UET.</p>
          </div>
          <Link href="/communiques" className="flex items-center gap-1 text-sm font-medium text-primaire hover:underline">
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>
        {communiques && communiques.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {communiques.map((c) => (
              <CommuniqueCard key={c.id} communique={c as CommuniqueAvecStats} />
            ))}
          </div>
        ) : (
          <p className="carte p-6 text-center text-attenue">Aucun communiqué pour le moment.</p>
        )}
      </section>
    </>
  );
}

type CommuniqueAvecStats = Communique & { likes: { count: number }[]; commentaires: { count: number }[] };
