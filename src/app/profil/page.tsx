import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { institutsEtFilieres } from "@/lib/structure";
import { formatDate } from "@/lib/format";
import { FilAriane } from "@/components/fil-ariane";
import { FormulaireProfil } from "@/components/profil-form";

export const metadata = { title: "Mon profil" };

export default async function PageProfil() {
  const session = await requireSession("/profil");
  const supabase = await createClient();
  const instituts = await institutsEtFilieres(supabase);
  const profil = session.profile;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <FilAriane etapes={[{ label: "Mon profil" }]} />
      <h1 className="mb-1 text-2xl font-bold text-primaire">Mon profil</h1>
      <p className="mb-6 text-sm text-attenue">
        {session.user.email}
        {profil && <> · Inscrit le {formatDate(profil.created_at)}</>}
        {" · "}
        <Link href="/nouveau-mot-de-passe" className="font-medium text-primaire hover:underline">
          Changer de mot de passe
        </Link>
      </p>
      <div className="carte p-6">
        {profil ? (
          <FormulaireProfil profil={profil} instituts={instituts} />
        ) : (
          <p className="text-sm text-rouge">Profil introuvable. Déconnectez-vous puis reconnectez-vous.</p>
        )}
      </div>
    </div>
  );
}
