import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CommuniqueForm } from "@/components/communique-form";
import type { Communique } from "@/lib/types";

export default async function PageModifierCommunique({ params }: PageProps<"/admin/communiques/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("communiques").select("*").eq("id", id).single<Communique>();
  if (!data) notFound();

  return (
    <div>
      <Link href="/admin/communiques" className="mb-4 inline-flex items-center gap-1 text-sm text-attenue hover:text-primaire">
        <ArrowLeft size={16} /> Communiqués
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-primaire">Modifier le communiqué</h1>
      <CommuniqueForm communique={data} />
    </div>
  );
}
