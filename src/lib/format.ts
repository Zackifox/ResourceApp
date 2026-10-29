import type { TypeRessource } from "./types";

export const TYPES_RESSOURCE: Record<TypeRessource, string> = {
  cours: "Cours",
  sujet: "Sujet d'examen",
  td: "TD / TP",
  corrige: "Corrigé",
};

export const CYCLES = { licence: "Licence", master: "Master" } as const;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTaille(octets: number | null) {
  if (!octets) return "";
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function urlPublique(bucket: "ressources" | "communiques", path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

// Nom de fichier sûr pour le stockage : sans accents ni espaces
export function nomFichierSur(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
