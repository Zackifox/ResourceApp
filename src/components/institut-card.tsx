import Link from "next/link";
import { ArrowRight, Cpu, GraduationCap, Megaphone, Scale, TrendingUp } from "lucide-react";
import type { Institut } from "@/lib/types";

const icones: Record<string, typeof Scale> = {
  issj: Scale,
  "esi-dgi": Cpu,
  iseg: TrendingUp,
  imetic: Megaphone,
};

export function InstitutCard({ institut, nbFilieres }: { institut: Institut; nbFilieres?: number }) {
  const Icone = icones[institut.slug] ?? GraduationCap;
  return (
    <Link
      href={`/instituts/${institut.slug}`}
      className="carte group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-primaire-clair hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primaire-pale text-primaire">
          <Icone size={22} />
        </span>
        <span className="text-lg font-bold text-primaire">{institut.sigle}</span>
      </div>
      <h3 className="font-semibold leading-snug">{institut.nom}</h3>
      <div className="mt-auto flex items-center justify-between text-sm text-attenue">
        <span>{nbFilieres !== undefined && `${nbFilieres} filières`}</span>
        <ArrowRight size={18} className="text-primaire transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
