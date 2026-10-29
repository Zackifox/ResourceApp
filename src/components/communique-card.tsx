import Link from "next/link";
import { Heart, MessageCircle, Pin } from "lucide-react";
import { formatDate, urlPublique } from "@/lib/format";
import type { Communique } from "@/lib/types";

type Props = {
  communique: Communique & { likes: { count: number }[]; commentaires: { count: number }[] };
};

export function CommuniqueCard({ communique: c }: Props) {
  return (
    <Link
      href={`/communiques/${c.id}`}
      className="carte flex flex-col overflow-hidden transition hover:border-primaire-clair hover:shadow-md"
    >
      {c.image_path && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlPublique("communiques", c.image_path)} alt="" className="h-40 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-attenue">
          {c.epingle && (
            <span className="badge gap-1 bg-or-pale text-amber-800">
              <Pin size={12} /> Épinglé
            </span>
          )}
          {formatDate(c.created_at)}
        </div>
        <h3 className="font-semibold leading-snug">{c.titre}</h3>
        <p className="line-clamp-3 text-sm text-attenue">{c.contenu}</p>
        <div className="mt-auto flex gap-4 pt-2 text-sm text-attenue">
          <span className="flex items-center gap-1"><Heart size={16} /> {c.likes[0]?.count ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={16} /> {c.commentaires[0]?.count ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}
