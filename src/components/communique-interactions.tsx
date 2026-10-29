"use client";

import Link from "next/link";
import { useActionState, useEffect, useOptimistic, useRef, startTransition } from "react";
import { Heart } from "lucide-react";
import { basculerLike, commenter } from "@/app/actions/communiques";
import { Alerte, SubmitButton } from "./ui";

export function BoutonLike({
  communiqueId,
  nombre,
  aime,
  connecte,
}: {
  communiqueId: string;
  nombre: number;
  aime: boolean;
  connecte: boolean;
}) {
  const [etat, setEtat] = useOptimistic({ nombre, aime });

  if (!connecte) {
    return (
      <Link href={`/connexion?suite=/communiques/${communiqueId}`} className="btn-secondaire" title="Connectez-vous pour aimer">
        <Heart size={18} /> {nombre}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={etat.aime}
      className={`btn border ${etat.aime ? "border-rouge bg-red-50 text-rouge" : "border-bordure bg-white hover:bg-fond"}`}
      onClick={() =>
        startTransition(async () => {
          setEtat({ aime: !etat.aime, nombre: etat.nombre + (etat.aime ? -1 : 1) });
          await basculerLike(communiqueId);
        })
      }
    >
      <Heart size={18} fill={etat.aime ? "currentColor" : "none"} />
      {etat.nombre} J&apos;aime
    </button>
  );
}

export function FormulaireCommentaire({ communiqueId }: { communiqueId: string }) {
  const [state, action] = useActionState(commenter.bind(null, communiqueId), undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Vide le champ après un envoi réussi
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <textarea
        name="contenu"
        required
        maxLength={2000}
        rows={3}
        placeholder="Écrire un commentaire…"
        className="champ resize-y"
      />
      {state?.error && <Alerte state={state} />}
      <div className="flex justify-end">
        <SubmitButton>Publier</SubmitButton>
      </div>
    </form>
  );
}
