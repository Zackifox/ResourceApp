"use client";

export default function ErreurAdmin({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="carte p-6">
      <h2 className="mb-2 text-lg font-semibold text-rouge">Une erreur est survenue</h2>
      <p className="mb-4 text-sm text-attenue">{error.message}</p>
      <button onClick={reset} className="btn-secondaire">
        Réessayer
      </button>
    </div>
  );
}
