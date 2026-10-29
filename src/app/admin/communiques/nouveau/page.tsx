import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommuniqueForm } from "@/components/communique-form";

export default function PageNouveauCommunique() {
  return (
    <div>
      <Link href="/admin/communiques" className="mb-4 inline-flex items-center gap-1 text-sm text-attenue hover:text-primaire">
        <ArrowLeft size={16} /> Communiqués
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-primaire">Nouveau communiqué</h1>
      <CommuniqueForm />
    </div>
  );
}
