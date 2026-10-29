"use client";

import { useActionState } from "react";
import { connexion, inscription } from "@/app/actions/auth";
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

export function FormulaireInscription() {
  const [state, action] = useActionState(inscription, undefined);
  if (state?.message) return <Alerte state={state} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="etiquette" htmlFor="nom">Nom complet</label>
        <input id="nom" name="nom" required autoComplete="name" className="champ" />
      </div>
      <div>
        <label className="etiquette" htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="champ" />
      </div>
      <div>
        <label className="etiquette" htmlFor="mot_de_passe">Mot de passe (8 caractères minimum)</label>
        <input id="mot_de_passe" name="mot_de_passe" type="password" required minLength={8} autoComplete="new-password" className="champ" />
      </div>
      <Alerte state={state} />
      <SubmitButton>Créer mon compte</SubmitButton>
    </form>
  );
}
