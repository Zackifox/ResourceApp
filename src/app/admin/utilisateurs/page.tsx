import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { DeleteButton } from "@/components/ui";
import { changerRole } from "../actions";
import { formatDate } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default async function PageUtilisateurs({ searchParams }: PageProps<"/admin/utilisateurs">) {
  const session = await requireAdmin();
  const { q } = await searchParams;
  const terme = typeof q === "string" ? q.trim() : "";

  const supabase = await createClient();
  let requete = supabase
    .from("profiles")
    .select("*")
    .order("role")
    .order("created_at", { ascending: false })
    .limit(100);
  if (terme) requete = requete.ilike("nom", `%${terme.replace(/[%_\\]/g, " ")}%`);
  const { data } = await requete;
  const profils = (data ?? []) as Profile[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-primaire">Utilisateurs</h1>
      <p className="mb-6 text-sm text-attenue">
        Donnez le rôle d&apos;administrateur aux membres du bureau chargés de publier les ressources.
      </p>

      <form className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-attenue" />
          <input name="q" defaultValue={terme} placeholder="Rechercher par nom…" className="champ pl-9" />
        </div>
        <button className="btn-secondaire">Rechercher</button>
      </form>

      <ul className="carte divide-y divide-bordure">
        {profils.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.nom}</p>
              <p className="text-xs text-attenue">Inscrit le {formatDate(p.created_at)}</p>
            </div>
            {p.role === "admin" ? (
              <span className="badge bg-primaire-pale text-primaire">Administrateur</span>
            ) : (
              <span className="badge bg-fond text-attenue">Étudiant</span>
            )}
            {p.id !== session.user.id && (
              <form action={changerRole}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="role" value={p.role === "admin" ? "etudiant" : "admin"} />
                <DeleteButton
                  message={p.role === "admin" ? `Retirer les droits d'administrateur à ${p.nom} ?` : `Nommer ${p.nom} administrateur ?`}
                  className="btn-secondaire"
                >
                  {p.role === "admin" ? "Retirer admin" : "Nommer admin"}
                </DeleteButton>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
