"use client";

import { useState } from "react";
import type { Filiere, Institut } from "@/lib/types";

export type InstitutsFilieres = (Pick<Institut, "id" | "sigle" | "nom"> & {
  filieres: Pick<Filiere, "id" | "nom" | "cycle" | "niveaux" | "ordre">[];
})[];

// Choix facultatif de l'institut, de la filière et du niveau
export function ChoixFiliere({
  instituts,
  filiereInitiale,
  niveauInitial,
}: {
  instituts: InstitutsFilieres;
  filiereInitiale?: string | null;
  niveauInitial?: string | null;
}) {
  const [institutId, setInstitutId] = useState(
    () => instituts.find((i) => i.filieres.some((f) => f.id === filiereInitiale))?.id ?? "",
  );
  const [filiereId, setFiliereId] = useState(filiereInitiale ?? "");
  const [niveau, setNiveau] = useState(niveauInitial ?? "");

  const institut = instituts.find((i) => i.id === institutId);
  const filiere = institut?.filieres.find((f) => f.id === filiereId);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div>
        <label className="etiquette" htmlFor="institut">Institut</label>
        <select
          id="institut"
          className="champ"
          value={institutId}
          onChange={(e) => { setInstitutId(e.target.value); setFiliereId(""); setNiveau(""); }}
        >
          <option value="">—</option>
          {instituts.map((i) => <option key={i.id} value={i.id} title={i.nom}>{i.sigle}</option>)}
        </select>
      </div>
      <div>
        <label className="etiquette" htmlFor="filiere_id">Filière</label>
        <select
          id="filiere_id"
          name="filiere_id"
          className="champ"
          value={filiereId}
          onChange={(e) => { setFiliereId(e.target.value); setNiveau(""); }}
          disabled={!institut}
        >
          <option value="">—</option>
          {institut?.filieres.map((f) => (
            <option key={f.id} value={f.id}>{f.cycle === "master" ? "Master · " : ""}{f.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="etiquette" htmlFor="niveau">Niveau</label>
        <select
          id="niveau"
          name="niveau"
          className="champ"
          value={niveau}
          onChange={(e) => setNiveau(e.target.value)}
          disabled={!filiere}
        >
          <option value="">—</option>
          {filiere?.niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
