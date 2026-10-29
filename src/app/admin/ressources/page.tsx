import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton, SubmitButton } from "@/components/ui";
import { modifierRessource, supprimerRessource } from "../actions";
import { TYPES_RESSOURCE, formatDate } from "@/lib/format";
import type { Ressource, TypeRessource } from "@/lib/types";

type RessourceListe = Ressource & {
  matieres: { nom: string; niveau: string; filieres: { nom: string; instituts: { sigle: string } } };
};

const PAR_PAGE = 30;

export default async function PageRessourcesAdmin({ searchParams }: PageProps<"/admin/ressources">) {
  const { q, page } = await searchParams;
  const terme = typeof q === "string" ? q.trim() : "";
  const numPage = Math.max(1, Number(page) || 1);

  const supabase = await createClient();
  let requete = supabase
    .from("ressources")
    .select("*, matieres(nom, niveau, filieres(nom, instituts(sigle)))", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((numPage - 1) * PAR_PAGE, numPage * PAR_PAGE - 1);
  if (terme) requete = requete.ilike("titre", `%${terme.replace(/[%_\\]/g, " ")}%`);

  const { data, count } = await requete;
  const ressources = (data ?? []) as RessourceListe[];
  const nbPages = Math.ceil((count ?? 0) / PAR_PAGE);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primaire">Ressources PDF <span className="text-base font-normal text-attenue">({count ?? 0})</span></h1>
        <Link href="/admin/ressources/nouvelle" className="btn-primaire"><Plus size={16} /> Ajouter un PDF</Link>
      </div>

      <form className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-attenue" />
          <input name="q" defaultValue={terme} placeholder="Filtrer par titre…" className="champ pl-9" />
        </div>
        <button className="btn-secondaire">Filtrer</button>
      </form>

      {ressources.length === 0 ? (
        <p className="carte p-6 text-center text-attenue">Aucune ressource.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ressources.map((r) => (
            <li key={r.id} className="carte p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.titre}</p>
                  <p className="text-sm text-attenue">
                    {r.matieres.filieres.instituts.sigle} · {r.matieres.filieres.nom} · {r.matieres.niveau} · {r.matieres.nom}
                  </p>
                  <p className="text-xs text-attenue">
                    {TYPES_RESSOURCE[r.type]}{r.annee ? ` ${r.annee}` : ""} · ajouté le {formatDate(r.created_at)} · {r.telechargements} téléchargement(s)
                  </p>
                </div>
                <a href={`/api/ressources/${r.id}`} target="_blank" rel="noopener" className="btn-secondaire px-2.5" title="Voir">
                  <Eye size={16} />
                </a>
                <form action={supprimerRessource}>
                  <input type="hidden" name="id" value={r.id} />
                  <DeleteButton message={`Supprimer « ${r.titre} » ?`} className="btn-secondaire px-2.5 text-rouge">
                    <Trash2 size={16} />
                  </DeleteButton>
                </form>
              </div>
              <details className="mt-2">
                <summary className="flex cursor-pointer items-center gap-1 text-sm text-attenue hover:text-primaire">
                  <Pencil size={14} /> Modifier
                </summary>
                <form action={modifierRessource} className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input type="hidden" name="id" value={r.id} />
                  <input name="titre" defaultValue={r.titre} required className="champ sm:col-span-3" />
                  <select name="type" defaultValue={r.type} className="champ">
                    {(Object.keys(TYPES_RESSOURCE) as TypeRessource[]).map((t) => (
                      <option key={t} value={t}>{TYPES_RESSOURCE[t]}</option>
                    ))}
                  </select>
                  <input name="annee" type="number" defaultValue={r.annee ?? ""} placeholder="Année" className="champ" />
                  <SubmitButton>Enregistrer</SubmitButton>
                  <textarea name="description" defaultValue={r.description ?? ""} placeholder="Description" rows={2} className="champ sm:col-span-3" />
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}

      {nbPages > 1 && (
        <nav className="mt-6 flex justify-center gap-2">
          {Array.from({ length: nbPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/ressources?page=${n}${terme ? `&q=${encodeURIComponent(terme)}` : ""}`}
              className={n === numPage ? "btn-primaire px-3" : "btn-secondaire px-3"}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
