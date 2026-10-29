import Link from "next/link";
import { Download, FileText, Megaphone, MessageCircle, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Ressource } from "@/lib/types";

export default async function TableauDeBord() {
  const supabase = await createClient();
  const compter = (table: string) => supabase.from(table).select("*", { count: "exact", head: true });

  const [ressources, communiques, commentaires, utilisateurs, { data: populaires }] = await Promise.all([
    compter("ressources"),
    compter("communiques"),
    compter("commentaires"),
    compter("profiles"),
    supabase
      .from("ressources")
      .select("id, titre, telechargements, matieres(nom, niveau)")
      .order("telechargements", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Ressources PDF", valeur: ressources.count, icone: FileText },
    { label: "Communiqués", valeur: communiques.count, icone: Megaphone },
    { label: "Commentaires", valeur: commentaires.count, icone: MessageCircle },
    { label: "Comptes", valeur: utilisateurs.count, icone: Users },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primaire">Tableau de bord</h1>
        <div className="flex gap-2">
          <Link href="/admin/ressources/nouvelle" className="btn-primaire"><Plus size={16} /> Ajouter un PDF</Link>
          <Link href="/admin/communiques/nouveau" className="btn-secondaire"><Plus size={16} /> Communiqué</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, valeur, icone: Icone }) => (
          <div key={label} className="carte p-4">
            <Icone size={20} className="mb-2 text-primaire" />
            <p className="text-2xl font-bold">{valeur ?? 0}</p>
            <p className="text-sm text-attenue">{label}</p>
          </div>
        ))}
      </div>

      <section className="carte mt-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Download size={18} /> Les plus téléchargées</h2>
        {populaires && populaires.length > 0 ? (
          <ol className="flex flex-col divide-y divide-bordure">
            {(populaires as unknown as (Pick<Ressource, "id" | "titre" | "telechargements"> & { matieres: { nom: string; niveau: string } })[]).map((r) => (
              <li key={r.id} className="flex justify-between gap-3 py-2 text-sm">
                <span>
                  {r.titre} <span className="text-attenue">· {r.matieres.nom} ({r.matieres.niveau})</span>
                </span>
                <span className="font-semibold">{r.telechargements}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-attenue">Aucune ressource pour le moment.</p>
        )}
      </section>
    </div>
  );
}
