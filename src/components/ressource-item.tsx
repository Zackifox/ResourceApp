import { Download, Eye, FileText } from "lucide-react";
import { TYPES_RESSOURCE, formatTaille } from "@/lib/format";
import type { Ressource } from "@/lib/types";

const couleurs: Record<Ressource["type"], string> = {
  cours: "bg-primaire-pale text-primaire",
  sujet: "bg-or-pale text-amber-800",
  td: "bg-emerald-50 text-emerald-700",
  corrige: "bg-red-50 text-rouge",
};

export function RessourceItem({ ressource, contexte }: { ressource: Ressource; contexte?: string }) {
  return (
    <li className="carte flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <FileText className="hidden shrink-0 text-rouge sm:block" size={28} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`badge ${couleurs[ressource.type]}`}>{TYPES_RESSOURCE[ressource.type]}</span>
          {ressource.annee && <span className="badge bg-fond text-attenue">{ressource.annee}</span>}
        </div>
        <p className="font-medium">{ressource.titre}</p>
        {contexte && <p className="text-sm text-attenue">{contexte}</p>}
        {ressource.description && <p className="mt-1 text-sm text-attenue">{ressource.description}</p>}
        <p className="mt-1 text-xs text-attenue">
          {formatTaille(ressource.fichier_taille)}
          {ressource.telechargements > 0 && ` · ${ressource.telechargements} téléchargement${ressource.telechargements > 1 ? "s" : ""}`}
        </p>
      </div>
      <div className="flex gap-2">
        <a href={`/api/ressources/${ressource.id}`} target="_blank" rel="noopener" className="btn-secondaire flex-1">
          <Eye size={16} /> Lire
        </a>
        <a href={`/api/ressources/${ressource.id}?telecharger=1`} className="btn-primaire flex-1">
          <Download size={16} /> Télécharger
        </a>
      </div>
    </li>
  );
}
