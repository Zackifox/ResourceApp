import Link from "next/link";
import { Eye, Heart, MessageCircle, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/ui";
import { supprimerCommunique } from "../actions";
import { formatDate } from "@/lib/format";
import type { Communique } from "@/lib/types";

type CommuniqueAvecStats = Communique & { likes: { count: number }[]; commentaires: { count: number }[] };

export default async function PageCommuniquesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communiques")
    .select("*, likes(count), commentaires(count)")
    .order("created_at", { ascending: false });
  const communiques = (data ?? []) as CommuniqueAvecStats[];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primaire">Communiqués</h1>
        <Link href="/admin/communiques/nouveau" className="btn-primaire"><Plus size={16} /> Nouveau communiqué</Link>
      </div>
      <p className="mb-4 text-sm text-attenue">
        Pour modérer les commentaires, ouvrez le communiqué : une icône de suppression apparaît sur chaque commentaire.
      </p>

      {communiques.length === 0 ? (
        <p className="carte p-6 text-center text-attenue">Aucun communiqué.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {communiques.map((c) => (
            <li key={c.id} className="carte flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  {c.epingle && <Pin size={14} className="text-or" />} {c.titre}
                </p>
                <p className="flex gap-3 text-sm text-attenue">
                  {formatDate(c.created_at)}
                  <span className="flex items-center gap-1"><Heart size={14} /> {c.likes[0]?.count ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {c.commentaires[0]?.count ?? 0}</span>
                </p>
              </div>
              <Link href={`/communiques/${c.id}`} className="btn-secondaire px-2.5" title="Voir et modérer"><Eye size={16} /></Link>
              <Link href={`/admin/communiques/${c.id}`} className="btn-secondaire px-2.5" title="Modifier"><Pencil size={16} /></Link>
              <form action={supprimerCommunique}>
                <input type="hidden" name="id" value={c.id} />
                <DeleteButton message={`Supprimer « ${c.titre} » et ses commentaires ?`} className="btn-secondaire px-2.5 text-rouge">
                  <Trash2 size={16} />
                </DeleteButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
