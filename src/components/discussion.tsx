"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ecrireA, envoyerMessage, supprimerMessage } from "@/app/actions/messages";
import { formatHeure } from "@/lib/format";
import type { Canal, Message } from "@/lib/types";
import { Avatar } from "./avatar";

const TABLES = { salon: "messages_salon", prive: "messages_prives" } as const;
const COLONNES = { salon: "salon_id", prive: "conversation_id" } as const;

export function Discussion({
  canal,
  initiaux,
  moiId,
  isAdmin,
}: {
  canal: Canal;
  initiaux: Message[];
  moiId: string;
  isAdmin: boolean;
}) {
  const [messages, setMessages] = useState(initiaux);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, startEnvoi] = useTransition();
  const finRef = useRef<HTMLLIElement>(null);

  // Ajoute un message s'il n'est pas déjà affiché
  function ajouter(m: Message) {
    setMessages((liste) => (liste.some((x) => x.id === m.id) ? liste : [...liste, m]));
  }

  // Réception en temps réel des messages des autres
  useEffect(() => {
    const supabase = createClient();
    const profils = new Map<string, Message["profiles"]>();

    const abonnement = supabase
      .channel(`${canal.type}:${canal.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLES[canal.type],
          filter: `${COLONNES[canal.type]}=eq.${canal.id}`,
        },
        async ({ new: ligne }) => {
          const m = ligne as Omit<Message, "profiles">;
          if (m.user_id === moiId) return;
          if (!profils.has(m.user_id)) {
            const { data } = await supabase.from("profiles").select("nom, role, avatar_path").eq("id", m.user_id).single();
            profils.set(m.user_id, data);
          }
          ajouter({ ...m, profiles: profils.get(m.user_id) ?? null });
          if (canal.type === "prive") supabase.rpc("marquer_conversation_lue", { conv_id: canal.id });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(abonnement);
    };
  }, [canal.type, canal.id, moiId]);

  // Défile jusqu'au dernier message
  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function envoyer() {
    if (!texte.trim() || envoi) return;
    startEnvoi(async () => {
      const res = await envoyerMessage(canal, texte);
      if ("error" in res) {
        setErreur(res.error);
      } else {
        setErreur("");
        setTexte("");
        ajouter(res.message);
      }
    });
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    if (await supprimerMessage(canal, id)) setMessages((liste) => liste.filter((m) => m.id !== id));
  }

  return (
    <div className="carte flex h-[calc(100dvh-14rem)] min-h-96 flex-col">
      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <li className="m-auto text-sm text-attenue">Aucun message pour l&apos;instant. Lancez la discussion !</li>
        )}
        {messages.map((m) => {
          const moi = m.user_id === moiId;
          const peutSupprimer = moi || (isAdmin && canal.type === "salon");
          return (
            <li key={m.id} className={`group flex max-w-[85%] gap-2 ${moi ? "self-end" : ""}`}>
              {!moi && <Avatar nom={m.profiles?.nom ?? ""} path={m.profiles?.avatar_path} taille={32} />}
              <div className={`flex min-w-0 flex-col ${moi ? "items-end" : "items-start"}`}>
              <div className="mb-0.5 flex items-center gap-2 text-xs text-attenue">
                {!moi && canal.type === "salon" ? (
                  <form action={ecrireA.bind(null, m.user_id)}>
                    <button className="font-semibold text-texte hover:text-primaire hover:underline" title="Envoyer un message privé">
                      {m.profiles?.nom ?? "Utilisateur"}
                    </button>
                  </form>
                ) : (
                  !moi && <span className="font-semibold text-texte">{m.profiles?.nom ?? "Utilisateur"}</span>
                )}
                {m.profiles?.role === "admin" && <span className="badge bg-primaire-pale text-primaire">Bureau UET</span>}
                <span>{formatHeure(m.created_at)}</span>
                {peutSupprimer && (
                  <button
                    onClick={() => supprimer(m.id)}
                    className="text-attenue opacity-0 group-hover:opacity-100 hover:text-rouge focus:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p
                className={`rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-line ${
                  moi ? "rounded-br-sm bg-primaire text-white" : "rounded-bl-sm bg-fond"
                }`}
              >
                {m.contenu}
              </p>
              </div>
            </li>
          );
        })}
        <li ref={finRef} aria-hidden />
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
        className="border-t border-bordure p-3"
      >
        {erreur && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-rouge">{erreur}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => {
              // Entrée envoie, Maj+Entrée va à la ligne
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyer();
              }
            }}
            maxLength={2000}
            rows={1}
            placeholder="Écrire un message…"
            className="champ max-h-32 resize-none"
          />
          <button type="submit" disabled={envoi || !texte.trim()} className="btn-primaire px-3" title="Envoyer">
            {envoi ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
