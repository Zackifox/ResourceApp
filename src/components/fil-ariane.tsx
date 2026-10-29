import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function FilAriane({ etapes }: { etapes: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-attenue">
      <Link href="/" className="hover:text-primaire">
        Accueil
      </Link>
      {etapes.map((e, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={14} />
          {e.href ? (
            <Link href={e.href} className="hover:text-primaire">
              {e.label}
            </Link>
          ) : (
            <span className="text-texte">{e.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
