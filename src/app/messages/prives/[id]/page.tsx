import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { derniersMessages } from "@/lib/messagerie";
import { FilAriane } from "@/components/fil-ariane";
import { Discussion } from "@/components/discussion";
import type { Conversation } from "@/lib/types";

export const metadata = { title: "Message privé" };

export default async function PageConversation({ params }: PageProps<"/messages/prives/[id]">) {
  const { id } = await params;
  const session = await requireSession(`/messages/prives/${id}`);

  // La sécurité RLS ne renvoie la conversation qu'à ses deux participants
  const supabase = await createClient();
  const { data: conversation } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle<Conversation>();
  if (!conversation) notFound();

  const autreId = conversation.user1 === session.user.id ? conversation.user2 : conversation.user1;
  const [{ data: autre }, messages] = await Promise.all([
    supabase.from("profiles").select("nom").eq("id", autreId).single(),
    derniersMessages(supabase, "messages_prives", "conversation_id", id),
    supabase.rpc("marquer_conversation_lue", { conv_id: id }),
  ]);
  const nom = autre?.nom ?? "Utilisateur";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FilAriane etapes={[{ label: "Messagerie", href: "/messages" }, { label: nom }]} />
      <h1 className="mb-4 text-xl font-bold text-primaire">{nom}</h1>
      <Discussion
        key={conversation.id}
        canal={{ type: "prive", id: conversation.id }}
        initiaux={messages}
        moiId={session.user.id}
        isAdmin={session.isAdmin}
      />
    </div>
  );
}
