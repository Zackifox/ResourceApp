"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { creerRessource } from "@/app/admin/actions";
import { Alerte } from "./ui";
import { TYPES_RESSOURCE, nomFichierSur } from "@/lib/format";
import type { ActionState, Filiere, Institut, Matiere, TypeRessource } from "@/lib/types";

export type Arbre = (Institut & { filieres: (Filiere & { matieres: Matiere[] })[] })[];

const TAILLE_MAX = 50 * 1024 * 1024;

// Retrouve le chemin complet de la matière présélectionnée
function cheminMatiere(arbre: Arbre, matiereId?: string) {
  for (const i of arbre)
    for (const f of i.filieres)
      for (const m of f.matieres)
        if (m.id === matiereId) return { institut: i.id, filiere: f.id, niveau: m.niveau, matiere: m.id };
  return { institut: "", filiere: "", niveau: "", matiere: "" };
}

export function UploadForm({ arbre, matiereInitiale }: { arbre: Arbre; matiereInitiale?: string }) {
  const [initial] = useState(() => cheminMatiere(arbre, matiereInitiale));

  const [institutId, setInstitutId] = useState(initial.institut);
  const [filiereId, setFiliereId] = useState(initial.filiere);
  const [niveau, setNiveau] = useState(initial.niveau);
  const [matiereId, setMatiereId] = useState(initial.matiere);
  const [titre, setTitre] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [state, setState] = useState<ActionState>();
  const formRef = useRef<HTMLFormElement>(null);

  const institut = arbre.find((i) => i.id === institutId);
  const filiere = institut?.filieres.find((f) => f.id === filiereId);
  const matieres = filiere?.matieres.filter((m) => m.niveau === niveau).sort((a, b) => a.nom.localeCompare(b.nom)) ?? [];

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fichier = formData.get("fichier") as File;

    if (!matiereId) return setState({ error: "Choisissez une matière." });
    if (!fichier || fichier.size === 0) return setState({ error: "Choisissez un fichier PDF." });
    if (fichier.type !== "application/pdf") return setState({ error: "Le fichier doit être un PDF." });
    if (fichier.size > TAILLE_MAX) return setState({ error: "Le fichier dépasse 50 Mo." });

    setEnvoi(true);
    setState(undefined);

    // 1. Envoi du PDF directement vers Supabase Storage
    const path = `${matiereId}/${Date.now()}-${nomFichierSur(fichier.name)}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("ressources")
      .upload(path, fichier, { contentType: "application/pdf" });

    if (error) {
      setEnvoi(false);
      return setState({ error: "Envoi du fichier impossible : " + error.message });
    }

    // 2. Enregistrement de la ressource dans la base
    const resultat = await creerRessource({
      matiere_id: matiereId,
      titre: String(formData.get("titre")).trim(),
      type: formData.get("type") as TypeRessource,
      annee: Number(formData.get("annee")) || null,
      description: String(formData.get("description") ?? "").trim() || null,
      fichier_path: path,
      fichier_taille: fichier.size,
    });

    setEnvoi(false);
    setState(resultat);
    if (!resultat?.error) {
      // Garde la matière sélectionnée pour enchaîner les ajouts
      formRef.current?.reset();
      setTitre("");
    }
  }

  return (
    <form ref={formRef} onSubmit={envoyer} className="carte flex flex-col gap-4 p-5">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">1. Emplacement</legend>
        <div>
          <label className="etiquette">Institut</label>
          <select
            className="champ"
            value={institutId}
            onChange={(e) => { setInstitutId(e.target.value); setFiliereId(""); setNiveau(""); setMatiereId(""); }}
            required
          >
            <option value="">— Choisir —</option>
            {arbre.map((i) => <option key={i.id} value={i.id}>{i.sigle}</option>)}
          </select>
        </div>
        <div>
          <label className="etiquette">Filière</label>
          <select
            className="champ"
            value={filiereId}
            onChange={(e) => { setFiliereId(e.target.value); setNiveau(""); setMatiereId(""); }}
            disabled={!institut}
            required
          >
            <option value="">— Choisir —</option>
            {institut?.filieres.map((f) => (
              <option key={f.id} value={f.id}>{f.cycle === "master" ? "Master · " : "Licence · "}{f.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiquette">Niveau</label>
          <select
            className="champ"
            value={niveau}
            onChange={(e) => { setNiveau(e.target.value); setMatiereId(""); }}
            disabled={!filiere}
            required
          >
            <option value="">— Choisir —</option>
            {filiere?.niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="etiquette">Matière</label>
          <select className="champ" value={matiereId} onChange={(e) => setMatiereId(e.target.value)} disabled={!niveau} required>
            <option value="">{niveau && matieres.length === 0 ? "Aucune matière — ajoutez-en d'abord" : "— Choisir —"}</option>
            {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">2. Document</legend>
        <div className="sm:col-span-2">
          <label className="etiquette">Fichier PDF (50 Mo max)</label>
          <input
            name="fichier"
            type="file"
            accept="application/pdf"
            required
            className="champ file:mr-3 file:rounded-md file:border-0 file:bg-primaire-pale file:px-3 file:py-1 file:text-primaire"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && !titre) setTitre(f.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " "));
            }}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="etiquette">Titre</label>
          <input name="titre" required value={titre} onChange={(e) => setTitre(e.target.value)} className="champ" placeholder="ex. Chapitre 1 — Introduction" />
        </div>
        <div>
          <label className="etiquette">Type</label>
          <select name="type" className="champ" defaultValue="cours">
            {(Object.keys(TYPES_RESSOURCE) as TypeRessource[]).map((t) => (
              <option key={t} value={t}>{TYPES_RESSOURCE[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiquette">Année (facultatif)</label>
          <input name="annee" type="number" min={1990} max={2100} className="champ" placeholder="ex. 2025" />
        </div>
        <div className="sm:col-span-2">
          <label className="etiquette">Description (facultatif)</label>
          <textarea name="description" rows={2} className="champ" />
        </div>
      </fieldset>

      <Alerte state={state} />
      <div>
        <button type="submit" disabled={envoi} className="btn-primaire">
          {envoi ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {envoi ? "Envoi en cours…" : "Publier le PDF"}
        </button>
      </div>
    </form>
  );
}
