"use client";

import { useActionState, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { modifierProfil } from "@/app/actions/profil";
import { urlPublique } from "@/lib/format";
import { ChoixFiliere, type InstitutsFilieres } from "./choix-filiere";
import { Alerte, SubmitButton } from "./ui";
import type { Profile } from "@/lib/types";

export function FormulaireProfil({ profil, instituts }: { profil: Profile; instituts: InstitutsFilieres }) {
  const [state, action] = useActionState(modifierProfil, undefined);
  const [apercu, setApercu] = useState<string | null>(null);
  const [retirer, setRetirer] = useState(false);
  const [bio, setBio] = useState(profil.bio ?? "");

  // Libère l'aperçu local quand il change
  useEffect(() => () => {
    if (apercu) URL.revokeObjectURL(apercu);
  }, [apercu]);

  const photo = apercu ?? (!retirer && profil.avatar_path ? urlPublique("avatars", profil.avatar_path) : null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primaire-pale text-3xl font-semibold text-primaire">
            {profil.nom.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex flex-col gap-2">
          <label className="btn-secondaire cursor-pointer">
            <Camera size={16} /> {photo ? "Changer de photo" : "Ajouter une photo"}
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setApercu(f ? URL.createObjectURL(f) : null);
                setRetirer(false);
              }}
            />
          </label>
          {profil.avatar_path && !apercu && (
            <label className="flex items-center gap-2 text-sm text-attenue">
              <input type="checkbox" name="retirer_photo" checked={retirer} onChange={(e) => setRetirer(e.target.checked)} />
              Retirer la photo
            </label>
          )}
          <p className="text-xs text-attenue">JPEG, PNG ou WebP, 2 Mo maximum.</p>
        </div>
      </div>

      <div>
        <label className="etiquette" htmlFor="nom">Nom complet</label>
        <input id="nom" name="nom" required maxLength={80} defaultValue={profil.nom} className="champ" />
      </div>

      <fieldset>
        <legend className="etiquette">Parcours</legend>
        <ChoixFiliere instituts={instituts} filiereInitiale={profil.filiere_id} niveauInitial={profil.niveau} />
      </fieldset>

      <div>
        <label className="etiquette" htmlFor="bio">
          Présentation <span className="font-normal text-attenue">({bio.length}/300)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={300}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Quelques mots sur vous, vos centres d'intérêt…"
          className="champ resize-y"
        />
      </div>

      <Alerte state={state} />
      <div>
        <SubmitButton>Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
