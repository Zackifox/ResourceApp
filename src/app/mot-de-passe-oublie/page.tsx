import Link from "next/link";
import type { Metadata } from "next";
import { FormulaireMotDePasseOublie } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function PageMotDePasseOublie() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="carte p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-primaire">Mot de passe oublié</h1>
        <p className="mb-6 text-sm text-attenue">
          Saisissez l&apos;adresse e-mail de votre compte : vous recevrez un lien pour choisir un
          nouveau mot de passe.
        </p>
        <FormulaireMotDePasseOublie />
        <p className="mt-6 text-center text-sm text-attenue">
          <Link href="/connexion" className="font-medium text-primaire hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
