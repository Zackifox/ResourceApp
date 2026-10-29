import Link from "next/link";
import { Hash, MessageCircle, Search, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { nomSalon, type SalonAffiche } from "@/lib/messagerie";
import { ecrireA } from "@/app/actions/messages";
import { formatHeure } from "@/lib/format";
import { FilAriane } from "@/components/fil-ariane";
import { Avatar } from "@/components/avatar";
import type { Conversation, Profile } from "@/lib/types";

export const metadata = { title: "Messagerie" };

type ConversationAffichee = Conversation & {
  u1: { nom: string; avatar_path: string | null } | null;
  u2: { nom: string; avatar_path: string | null } | null;
};

export default async function PageMessagerie({ searchParams }: PageProps<"/messages">) {
  const session = await requireSession("/messages");
  const { q } = await searchParams;
  const terme = typeof q === "string" ? q.trim() : "";
  const moi = session.user.id;

  const supabase = await createClient();
  const [{ data: salons }, { data: conversations }, { data: nonLus }, { data: trouves }] = await Promise.all([
    supabase.from("salons").select("*, filieres(nom, instituts(sigle))").order("ordre"),
    supabase
      .from("conversations")
      .select("*, u1:profiles!conversations_user1_fkey(nom, avatar_path), u2:profiles!conversations_user2_fkey(nom, avatar_path)")
      .order("dernier_message_at", { ascending: false }),
    supabase.from("messages_prives").select("conversation_id").eq("lu", false).neq("user_id", moi),
    terme
      ? supabase
          .from("profiles")
          .select("*")
          .neq("id", moi)
          .ilike("nom", `%${terme.replace(/[%_\\]/g, " ")}%`)
          .order("nom")
          .limit(20)
      : Promise.resolve({ data: null }),
  ]);

  const listeSalons = ((salons ?? []) as SalonAffiche[]).sort(
    (a, b) => a.ordre - b.ordre || nomSalon(a).localeCompare(nomSalon(b), "fr"),
  );
  const listeConversations = (conversations ?? []) as ConversationAffichee[];
  const nonLusParConversation = new Map<string, number>();
  for (const m of nonLus ?? []) {
    nonLusParConversation.set(m.conversation_id, (nonLusParConversation.get(m.conversation_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <FilAriane etapes={[{ label: "Messagerie" }]} />
      <h1 className="mb-6 text-2xl font-bold text-primaire">Messagerie</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Hash size={20} className="text-primaire" /> Salons
          </h2>
          <ul className="carte divide-y divide-bordure">
            {listeSalons.map((s) => (
              <li key={s.id}>
                <Link href={`/messages/salons/${s.id}`} className="flex items-center gap-3 p-4 hover:bg-fond">
                  <Hash size={18} className="shrink-0 text-attenue" />
                  <span className="font-medium">{nomSalon(s)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <MessageCircle size={20} className="text-primaire" /> Messages privés
          </h2>

          <form className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-attenue" />
              <input name="q" defaultValue={terme} placeholder="Trouver un étudiant par son nom…" className="champ pl-9" />
            </div>
            <button className="btn-secondaire">Rechercher</button>
          </form>

          {trouves && (
            <ul className="carte mb-4 divide-y divide-bordure">
              {(trouves as Profile[]).length === 0 && (
                <li className="p-4 text-sm text-attenue">Aucun utilisateur trouvé.</li>
              )}
              {(trouves as Profile[]).map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-3">
                  <Avatar nom={p.nom} path={p.avatar_path} />
                  <span className="min-w-0 flex-1 truncate font-medium">{p.nom}</span>
                  <form action={ecrireA.bind(null, p.id)}>
                    <button className="btn-secondaire py-1.5">
                      <Send size={14} /> Écrire
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {listeConversations.length === 0 ? (
            <p className="carte p-4 text-sm text-attenue">
              Aucune conversation. Recherchez un étudiant, ou cliquez sur un nom dans un salon pour lui écrire.
            </p>
          ) : (
            <ul className="carte divide-y divide-bordure">
              {listeConversations.map((c) => {
                const autre = (c.user1 === moi ? c.u2 : c.u1) ?? { nom: "Utilisateur", avatar_path: null };
                const nonLu = nonLusParConversation.get(c.id) ?? 0;
                return (
                  <li key={c.id}>
                    <Link href={`/messages/prives/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-fond">
                      <Avatar nom={autre.nom} path={autre.avatar_path} />
                      <span className={`min-w-0 flex-1 truncate ${nonLu ? "font-bold" : "font-medium"}`}>{autre.nom}</span>
                      <span className="text-xs text-attenue">{formatHeure(c.dernier_message_at)}</span>
                      {nonLu > 0 && <span className="badge bg-rouge text-white">{nonLu}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
