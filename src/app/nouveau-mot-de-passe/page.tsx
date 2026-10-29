import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { FormulaireNouveauMotDePasse } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

// Atteinte depuis le lien de réinitialisation (qui connecte l'utilisateur)
// ou depuis « Mon profil » pour changer de mot de passe
export default async function PageNouveauMotDePasse() {
  const session = await requireSession("/nouveau-mot-de-passe");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="carte p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-primaire">Nouveau mot de passe</h1>
        <p className="mb-6 text-sm text-attenue">Pour le compte {session.user.email}</p>
        <FormulaireNouveauMotDePasse />
      </div>
    </div>
  );
}
