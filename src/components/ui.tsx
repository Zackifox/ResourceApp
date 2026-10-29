"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/types";

export function SubmitButton({
  children,
  className = "btn-primaire",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

// Bouton de suppression qui demande une confirmation
export function DeleteButton({
  message = "Confirmer la suppression ?",
  children,
  className = "btn-secondaire text-rouge",
}: {
  message?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

export function Alerte({ state }: { state: ActionState }) {
  if (state?.error)
    return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-rouge">{state.error}</p>;
  if (state?.message)
    return <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.message}</p>;
  return null;
}
