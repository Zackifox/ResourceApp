import { urlPublique } from "@/lib/format";

// Photo de profil, ou initiale du nom à défaut
export function Avatar({
  nom,
  path,
  taille = 36,
}: {
  nom: string;
  path: string | null | undefined;
  taille?: number;
}) {
  const style = { width: taille, height: taille };
  if (path) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={urlPublique("avatars", path)} alt="" style={style} className="shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: taille * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primaire-pale font-semibold text-primaire"
    >
      {nom.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
