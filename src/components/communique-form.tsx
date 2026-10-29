"use client";

import { useActionState } from "react";
import { enregistrerCommunique } from "@/app/admin/actions";
import { Alerte, SubmitButton } from "./ui";
import { urlPublique } from "@/lib/format";
import type { Communique } from "@/lib/types";

export function CommuniqueForm({ communique }: { communique?: Communique }) {
  const [state, action] = useActionState(
    enregistrerCommunique.bind(null, communique?.id ?? null),
    undefined,
  );

  return (
    <form action={action} className="carte flex flex-col gap-4 p-5">
      <input type="hidden" name="ancienne_image" value={communique?.image_path ?? ""} />
      <div>
        <label className="etiquette" htmlFor="titre">Titre</label>
        <input id="titre" name="titre" required defaultValue={communique?.titre} className="champ" />
      </div>
      <div>
        <label className="etiquette" htmlFor="contenu">Contenu</label>
        <textarea id="contenu" name="contenu" required rows={10} defaultValue={communique?.contenu} className="champ" />
        <p className="mt-1 text-xs text-attenue">Les retours à la ligne sont conservés.</p>
      </div>
      <div>
        <label className="etiquette" htmlFor="image">Image (facultatif, 5 Mo max)</label>
        {communique?.image_path && (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urlPublique("communiques", communique.image_path)} alt="" className="h-16 w-24 rounded object-cover" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="retirer_image" /> Retirer l&apos;image
            </label>
          </div>
        )}
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="champ" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="epingle" defaultChecked={communique?.epingle} />
        Épingler en haut de la liste
      </label>
      <Alerte state={state} />
      <div>
        <SubmitButton>{communique ? "Enregistrer les modifications" : "Publier le communiqué"}</SubmitButton>
      </div>
    </form>
  );
}
