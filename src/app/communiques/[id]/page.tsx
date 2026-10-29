import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { FilAriane } from "@/components/fil-ariane";
import { BoutonLike, FormulaireCommentaire } from "@/components/communique-interactions";
import { DeleteButton } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { supprimerCommentaire } from "@/app/actions/communiques";
import { formatDate, urlPublique } from "@/lib/format";
import type { Commentaire, Communique } from "@/lib/types";

type CommuniqueComplet = Communique & {
  likes: { user_id: string }[];
  commentaires: (Commentaire & { profiles: { nom: string; role: string; avatar_path: string | null } | null })[];
};

export async function generateMetadata({ params }: PageProps<"/communiques/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("communiques").select("titre").eq("id", id).single();
  return { title: data?.titre ?? "Communiqué" };
}

export default async function PageCommunique({ params }: PageProps<"/communiques/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: c }, session] = await Promise.all([
    supabase
      .from("communiques")
      .select("*, likes(user_id), commentaires(*, profiles(nom, role, avatar_path))")
      .eq("id", id)
      .single<CommuniqueComplet>(),
    getSession(),
  ]);

  if (!c) notFound();

  const commentaires = c.commentaires.sort((a, b) => a.created_at.localeCompare(b.created_at));
  const aime = !!session && c.likes.some((l) => l.user_id === session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FilAriane etapes={[{ label: "Communiqués", href: "/communiques" }, { label: c.titre }]} />

      <article className="carte overflow-hidden">
        {c.image_path && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlPublique("communiques", c.image_path)} alt="" className="max-h-96 w-full object-cover" />
        )}
        <div className="p-6 sm:p-8">
          <p className="text-sm text-attenue">Publié le {formatDate(c.created_at)}</p>
          <h1 className="mt-1 text-2xl font-bold text-primaire sm:text-3xl">{c.titre}</h1>
          <div className="mt-4 leading-relaxed whitespace-pre-line">{c.contenu}</div>
          <div className="mt-6 flex items-center gap-3 border-t border-bordure pt-4">
            <BoutonLike communiqueId={c.id} nombre={c.likes.length} aime={aime} connecte={!!session} />
            <span className="flex items-center gap-1 text-sm text-attenue">
              <MessageCircle size={18} /> {commentaires.length} commentaire{commentaires.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Commentaires</h2>

        {session ? (
          <div className="carte mb-6 p-4">
            <FormulaireCommentaire communiqueId={c.id} />
          </div>
        ) : (
          <p className="carte mb-6 p-4 text-sm text-attenue">
            <Link href={`/connexion?suite=/communiques/${c.id}`} className="font-medium text-primaire hover:underline">
              Connectez-vous
            </Link>{" "}
            pour commenter ce communiqué.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {commentaires.map((com) => (
            <li key={com.id} className="carte p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="flex flex-wrap items-center text-sm">
                  <Avatar nom={com.profiles?.nom ?? ""} path={com.profiles?.avatar_path} taille={28} />
                  <span className="ml-2 font-semibold">{com.profiles?.nom ?? "Utilisateur"}</span>
                  {com.profiles?.role === "admin" && (
                    <span className="badge ml-2 bg-primaire-pale text-primaire">Bureau UET</span>
                  )}
                  <span className="ml-2 text-attenue">{formatDate(com.created_at)}</span>
                </p>
                {session && (session.isAdmin || session.user.id === com.user_id) && (
                  <form action={supprimerCommentaire}>
                    <input type="hidden" name="id" value={com.id} />
                    <input type="hidden" name="communique_id" value={c.id} />
                    <DeleteButton message="Supprimer ce commentaire ?" className="btn px-2 py-1 text-attenue hover:text-rouge">
                      <Trash2 size={16} />
                    </DeleteButton>
                  </form>
                )}
              </div>
              <p className="text-sm whitespace-pre-line">{com.contenu}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
