import Link from "next/link";
import type { Metadata } from "next";
import { FormulaireInscription } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Inscription" };

export default function PageInscription() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="carte p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-primaire">Créer un compte</h1>
        <p className="mb-6 text-sm text-attenue">
          Les ressources sont accessibles sans compte. L&apos;inscription permet de réagir aux
          communiqués.
        </p>
        <FormulaireInscription />
        <p className="mt-6 text-center text-sm text-attenue">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-primaire hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
