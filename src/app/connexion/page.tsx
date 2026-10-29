import Link from "next/link";
import type { Metadata } from "next";
import { FormulaireConnexion } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Connexion" };

export default async function PageConnexion({ searchParams }: PageProps<"/connexion">) {
  const { suite, erreur } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="carte p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-primaire">Connexion</h1>
        <p className="mb-6 text-sm text-attenue">
          Connectez-vous pour commenter et aimer les communiqués.
        </p>
        {erreur === "lien" && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-rouge">
            Le lien reçu par e-mail est invalide ou a expiré. Pour un mot de passe oublié, ouvrez
            le lien sur l&apos;appareil et dans le navigateur où vous l&apos;avez demandé, ou refaites
            une demande.
          </p>
        )}
        <FormulaireConnexion suite={typeof suite === "string" ? suite : "/"} />
        <p className="mt-4 text-center text-sm">
          <Link href="/mot-de-passe-oublie" className="font-medium text-primaire hover:underline">
            Mot de passe oublié ?
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-attenue">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-primaire hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
