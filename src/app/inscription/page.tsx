import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { institutsEtFilieres } from "@/lib/structure";
import { FormulaireInscription } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Inscription" };

export default async function PageInscription() {
  const supabase = await createClient();
  const instituts = await institutsEtFilieres(supabase);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="carte p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-primaire">Créer un compte</h1>
        <p className="mb-6 text-sm text-attenue">
          Les ressources sont accessibles sans compte. L&apos;inscription permet de réagir aux
          communiqués et de discuter avec les autres étudiants.
        </p>
        <FormulaireInscription instituts={instituts} />
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
