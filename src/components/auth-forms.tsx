"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { connexion, inscription } from "@/app/actions/auth";
import { ChoixFiliere, type InstitutsFilieres } from "./choix-filiere";
import { Alerte, SubmitButton } from "./ui";

export function FormulaireConnexion({ suite }: { suite: string }) {
  const [state, action] = useActionState(connexion, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="suite" value={suite} />
      <div>
        <label className="etiquette" htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="champ" />
      </div>
      <div>
        <label className="etiquette" htmlFor="mot_de_passe">Mot de passe</label>
        <input id="mot_de_passe" name="mot_de_passe" type="password" required autoComplete="current-password" className="champ" />
      </div>
      <Alerte state={state} />
      <SubmitButton>Se connecter</SubmitButton>
    </form>
  );
}

export function FormulaireInscription({ instituts }: { instituts: InstitutsFilieres }) {
  const [state, action] = useActionState(inscription, undefined);
  const [visible, setVisible] = useState(false);
  if (state?.message) return <Alerte state={state} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="etiquette" htmlFor="nom">Nom complet</label>
        <input id="nom" name="nom" required maxLength={80} autoComplete="name" placeholder="ex. Abakar Mahamat" className="champ" />
      </div>
      <div>
        <label className="etiquette" htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="champ" />
      </div>

      <fieldset>
        <legend className="etiquette">
          Votre parcours <span className="font-normal text-attenue">(facultatif)</span>
        </legend>
        <ChoixFiliere instituts={instituts} />
      </fieldset>

      <div>
        <label className="etiquette" htmlFor="mot_de_passe">Mot de passe (8 caractères minimum)</label>
        <div className="relative">
          <input
            id="mot_de_passe"
            name="mot_de_passe"
            type={visible ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className="champ pr-10"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-attenue hover:text-texte"
            title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="etiquette" htmlFor="confirmation">Confirmer le mot de passe</label>
        <input
          id="confirmation"
          name="confirmation"
          type={visible ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          className="champ"
        />
      </div>
      <Alerte state={state} />
      <SubmitButton>Créer mon compte</SubmitButton>
    </form>
  );
}
