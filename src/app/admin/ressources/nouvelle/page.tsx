import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UploadForm, type Arbre } from "@/components/upload-form";

export default async function PageNouvelleRessource({ searchParams }: PageProps<"/admin/ressources/nouvelle">) {
  const { matiere } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("instituts")
    .select("*, filieres(*, matieres(*))")
    .order("ordre")
    .order("cycle", { referencedTable: "filieres" })
    .order("ordre", { referencedTable: "filieres" });

  return (
    <div>
      <Link href="/admin/ressources" className="mb-4 inline-flex items-center gap-1 text-sm text-attenue hover:text-primaire">
        <ArrowLeft size={16} /> Ressources
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-primaire">Ajouter un PDF</h1>
      <p className="mb-6 text-sm text-attenue">
        La matière n&apos;existe pas encore ?{" "}
        <Link href="/admin/structure" className="text-primaire hover:underline">Ajoutez-la dans la filière</Link>.
      </p>
      <UploadForm arbre={(data ?? []) as Arbre} matiereInitiale={typeof matiere === "string" ? matiere : undefined} />
    </div>
  );
}
