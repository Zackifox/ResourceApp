import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { derniersMessages, nomSalon, type SalonAffiche } from "@/lib/messagerie";
import { FilAriane } from "@/components/fil-ariane";
import { Discussion } from "@/components/discussion";

export const metadata = { title: "Salon" };

export default async function PageSalon({ params }: PageProps<"/messages/salons/[id]">) {
  const { id } = await params;
  const session = await requireSession(`/messages/salons/${id}`);

  const supabase = await createClient();
  const [{ data: salon }, messages] = await Promise.all([
    supabase.from("salons").select("*, filieres(nom, instituts(sigle))").eq("id", id).maybeSingle<SalonAffiche>(),
    derniersMessages(supabase, "messages_salon", "salon_id", id),
  ]);
  if (!salon) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FilAriane etapes={[{ label: "Messagerie", href: "/messages" }, { label: nomSalon(salon) }]} />
      <h1 className="mb-4 text-xl font-bold text-primaire"># {nomSalon(salon)}</h1>
      <Discussion
        key={salon.id}
        canal={{ type: "salon", id: salon.id }}
        initiaux={messages}
        moiId={session.user.id}
        isAdmin={session.isAdmin}
      />
    </div>
  );
}
