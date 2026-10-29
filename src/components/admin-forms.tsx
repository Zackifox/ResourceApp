import { SubmitButton } from "@/components/ui";
import { enregistrerFiliere, enregistrerInstitut } from "@/app/admin/actions";
import type { Filiere, Institut } from "@/lib/types";

export function FormulaireInstitut({ institut }: { institut?: Institut }) {
  return (
    <form action={enregistrerInstitut} className="mt-4 grid gap-3 sm:grid-cols-2">
      {institut && <input type="hidden" name="id" value={institut.id} />}
      <div>
        <label className="etiquette">Sigle</label>
        <input name="sigle" required defaultValue={institut?.sigle} className="champ" placeholder="ex. ISSJ" />
      </div>
      <div>
        <label className="etiquette">Ordre d&apos;affichage</label>
        <input name="ordre" type="number" defaultValue={institut?.ordre ?? 0} className="champ" />
      </div>
      <div className="sm:col-span-2">
        <label className="etiquette">Nom complet</label>
        <input name="nom" required defaultValue={institut?.nom} className="champ" />
      </div>
      <div className="sm:col-span-2">
        <label className="etiquette">Adresse web (slug)</label>
        <input name="slug" defaultValue={institut?.slug} className="champ" placeholder="laisser vide = généré depuis le sigle" />
      </div>
      <div className="sm:col-span-2">
        <label className="etiquette">Description</label>
        <textarea name="description" rows={3} defaultValue={institut?.description ?? ""} className="champ" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton>{institut ? "Enregistrer" : "Ajouter l'institut"}</SubmitButton>
      </div>
    </form>
  );
}

export function FormulaireFiliere({ institutId, filiere }: { institutId: string; filiere?: Filiere }) {
  return (
    <form action={enregistrerFiliere} className="mt-4 grid gap-3 sm:grid-cols-2">
      {filiere && <input type="hidden" name="id" value={filiere.id} />}
      <input type="hidden" name="institut_id" value={institutId} />
      <div className="sm:col-span-2">
        <label className="etiquette">Nom de la filière</label>
        <input name="nom" required defaultValue={filiere?.nom} className="champ" />
      </div>
      <div>
        <label className="etiquette">Cycle</label>
        <select name="cycle" defaultValue={filiere?.cycle ?? "licence"} className="champ">
          <option value="licence">Licence</option>
          <option value="master">Master</option>
        </select>
      </div>
      <div>
        <label className="etiquette">Niveaux (séparés par des virgules)</label>
        <input name="niveaux" required defaultValue={filiere?.niveaux.join(", ") ?? "L1, L2, L3"} className="champ" />
      </div>
      <div>
        <label className="etiquette">Groupe / description (facultatif)</label>
        <input name="description" defaultValue={filiere?.description ?? ""} className="champ" placeholder="ex. Master de droit privé" />
      </div>
      <div>
        <label className="etiquette">Ordre d&apos;affichage</label>
        <input name="ordre" type="number" defaultValue={filiere?.ordre ?? 0} className="champ" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton>{filiere ? "Enregistrer" : "Ajouter la filière"}</SubmitButton>
      </div>
    </form>
  );
}
