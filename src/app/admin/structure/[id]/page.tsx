import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton, SubmitButton } from "@/components/ui";
import { ajouterMatiere, renommerMatiere, supprimerFiliere, supprimerMatiere } from "../../actions";
import { FormulaireFiliere } from "@/components/admin-forms";
import { CYCLES } from "@/lib/format";
import type { Filiere, Institut, Matiere } from "@/lib/types";

type FiliereComplete = Filiere & {
  instituts: Institut;
  matieres: (Matiere & { ressources: { count: number }[] })[];
};

export default async function PageFiliereAdmin({ params }: PageProps<"/admin/structure/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: filiere } = await supabase
    .from("filieres")
    .select("*, instituts(*), matieres(*, ressources(count))")
    .eq("id", id)
    .single<FiliereComplete>();

  if (!filiere) notFound();

  return (
    <div>
      <Link href="/admin/structure" className="mb-4 inline-flex items-center gap-1 text-sm text-attenue hover:text-primaire">
        <ArrowLeft size={16} /> Instituts & filières
      </Link>
      <p className="text-sm text-attenue">
        {filiere.instituts.sigle} · {CYCLES[filiere.cycle]}
      </p>
      <h1 className="text-2xl font-bold text-primaire">{filiere.nom}</h1>

      <details className="carte mt-4 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Pencil size={16} /> Modifier la filière
        </summary>
        <FormulaireFiliere institutId={filiere.institut_id} filiere={filiere} />
        <form action={supprimerFiliere} className="mt-4 border-t border-bordure pt-4">
          <input type="hidden" name="id" value={filiere.id} />
          <DeleteButton message="Supprimer cette filière avec toutes ses matières et ressources ?">
            <Trash2 size={16} /> Supprimer la filière
          </DeleteButton>
        </form>
      </details>

      {filiere.niveaux.map((niveau) => {
        const matieres = filiere.matieres
          .filter((m) => m.niveau === niveau)
          .sort((a, b) => a.nom.localeCompare(b.nom));
        return (
          <section key={niveau} className="carte mt-6 p-5">
            <h2 className="mb-3 text-lg font-bold">
              {niveau} <span className="text-sm font-normal text-attenue">· {matieres.length} matière(s)</span>
            </h2>

            <ul className="divide-y divide-bordure">
              {matieres.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-2 py-2">
                  <form action={renommerMatiere} className="flex min-w-0 flex-1 gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <input name="nom" defaultValue={m.nom} required className="champ py-1.5" aria-label="Nom de la matière" />
                    <SubmitButton className="btn-secondaire px-2.5 py-1.5">
                      <Check size={16} />
                    </SubmitButton>
                  </form>
                  <span className="text-xs text-attenue">{m.ressources[0]?.count ?? 0} PDF</span>
                  <Link href={`/admin/ressources/nouvelle?matiere=${m.id}`} className="btn-secondaire px-2.5 py-1.5" title="Ajouter un PDF">
                    <Plus size={16} /> PDF
                  </Link>
                  <form action={supprimerMatiere}>
                    <input type="hidden" name="id" value={m.id} />
                    <DeleteButton
                      message={`Supprimer « ${m.nom} » et ses ${m.ressources[0]?.count ?? 0} ressource(s) ?`}
                      className="btn px-2.5 py-1.5 text-attenue hover:text-rouge"
                    >
                      <Trash2 size={16} />
                    </DeleteButton>
                  </form>
                </li>
              ))}
            </ul>

            <form action={ajouterMatiere} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="filiere_id" value={filiere.id} />
              <input type="hidden" name="niveau" value={niveau} />
              <textarea
                name="noms"
                required
                rows={2}
                className="champ"
                placeholder={"Ajouter des matières (une par ligne)\nex. Droit constitutionnel"}
              />
              <div>
                <SubmitButton className="btn-primaire">
                  <Plus size={16} /> Ajouter
                </SubmitButton>
              </div>
            </form>
          </section>
        );
      })}
    </div>
  );
}
