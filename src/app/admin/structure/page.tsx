import Link from "next/link";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/ui";
import { FormulaireFiliere, FormulaireInstitut } from "@/components/admin-forms";
import { supprimerInstitut } from "../actions";
import { CYCLES } from "@/lib/format";
import type { Filiere, Institut } from "@/lib/types";

export default async function PageStructure() {
  const supabase = await createClient();
  const { data } = await supabase.from("instituts").select("*, filieres(*, matieres(count))").order("ordre");
  const instituts = (data ?? []) as (Institut & { filieres: (Filiere & { matieres: { count: number }[] })[] })[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-primaire">Instituts & filières</h1>
      <p className="mb-6 text-sm text-attenue">
        Cliquez sur une filière pour gérer ses matières par niveau.
      </p>

      <details className="carte mb-6 p-4">
        <summary className="flex cursor-pointer items-center gap-2 font-medium text-primaire">
          <Plus size={18} /> Ajouter un institut
        </summary>
        <FormulaireInstitut />
      </details>

      <div className="flex flex-col gap-6">
        {instituts.map((inst) => (
          <section key={inst.id} className="carte p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-primaire">{inst.sigle}</h2>
                <p className="text-sm text-attenue">{inst.nom}</p>
              </div>
              <form action={supprimerInstitut}>
                <input type="hidden" name="id" value={inst.id} />
                <DeleteButton message={`Supprimer ${inst.sigle} avec TOUTES ses filières, matières et ressources ?`}>
                  <Trash2 size={16} /> Supprimer
                </DeleteButton>
              </form>
            </div>

            <details className="mt-3">
              <summary className="flex cursor-pointer items-center gap-1 text-sm text-attenue hover:text-primaire">
                <Pencil size={14} /> Modifier l&apos;institut
              </summary>
              <FormulaireInstitut institut={inst} />
            </details>

            <ul className="mt-4 divide-y divide-bordure border-t border-bordure">
              {inst.filieres
                .sort((a, b) => a.cycle.localeCompare(b.cycle) || a.ordre - b.ordre || a.nom.localeCompare(b.nom))
                .map((f) => (
                  <li key={f.id}>
                    <Link href={`/admin/structure/${f.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:text-primaire">
                      <span className="badge w-16 justify-center bg-fond text-attenue">{CYCLES[f.cycle]}</span>
                      <span className="flex-1 font-medium">{f.nom}</span>
                      <span className="hidden text-attenue sm:inline">{f.niveaux.join(", ")}</span>
                      <span className="text-attenue">{f.matieres[0]?.count ?? 0} mat.</span>
                      <ChevronRight size={16} />
                    </Link>
                  </li>
                ))}
            </ul>

            <details className="mt-3">
              <summary className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primaire">
                <Plus size={16} /> Ajouter une filière
              </summary>
              <FormulaireFiliere institutId={inst.id} />
            </details>
          </section>
        ))}
      </div>
    </div>
  );
}
