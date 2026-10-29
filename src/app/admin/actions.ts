"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { nomFichierSur } from "@/lib/format";
import type { ActionState, Cycle, TypeRessource } from "@/lib/types";

const texte = (formData: FormData, cle: string) => String(formData.get(cle) ?? "").trim();
const texteOuNull = (formData: FormData, cle: string) => texte(formData, cle) || null;

async function clientAdmin() {
  await requireAdmin();
  return createClient();
}

function verifier(error: { message: string; code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new Error("Cet élément existe déjà.");
  throw new Error(error.message);
}

// ---------------------------------------------------------------------
// Instituts
// ---------------------------------------------------------------------
export async function enregistrerInstitut(formData: FormData) {
  const supabase = await clientAdmin();
  const id = texte(formData, "id");
  const donnees = {
    sigle: texte(formData, "sigle"),
    nom: texte(formData, "nom"),
    slug: nomFichierSur(texte(formData, "slug") || texte(formData, "sigle")).replace(/\./g, "-"),
    description: texteOuNull(formData, "description"),
    ordre: Number(formData.get("ordre") ?? 0) || 0,
  };

  const { error } = id
    ? await supabase.from("instituts").update(donnees).eq("id", id)
    : await supabase.from("instituts").insert(donnees);
  verifier(error);
  revalidatePath("/", "layout");
}

export async function supprimerInstitut(formData: FormData) {
  const supabase = await clientAdmin();
  const { error } = await supabase.from("instituts").delete().eq("id", texte(formData, "id"));
  verifier(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------
// Filières
// ---------------------------------------------------------------------
export async function enregistrerFiliere(formData: FormData) {
  const supabase = await clientAdmin();
  const id = texte(formData, "id");
  const niveaux = texte(formData, "niveaux")
    .split(/[,;\s]+/)
    .map((n) => n.toUpperCase())
    .filter(Boolean);
  if (niveaux.length === 0) throw new Error("Indiquez au moins un niveau (ex. L1, L2, L3).");

  const donnees = {
    institut_id: texte(formData, "institut_id"),
    nom: texte(formData, "nom"),
    cycle: texte(formData, "cycle") as Cycle,
    niveaux,
    description: texteOuNull(formData, "description"),
    ordre: Number(formData.get("ordre") ?? 0) || 0,
  };

  const { error } = id
    ? await supabase.from("filieres").update(donnees).eq("id", id)
    : await supabase.from("filieres").insert(donnees);
  verifier(error);
  revalidatePath("/", "layout");
}

export async function supprimerFiliere(formData: FormData) {
  const supabase = await clientAdmin();
  const { error } = await supabase.from("filieres").delete().eq("id", texte(formData, "id"));
  verifier(error);
  revalidatePath("/", "layout");
  redirect("/admin/structure");
}

// ---------------------------------------------------------------------
// Matières
// ---------------------------------------------------------------------
export async function ajouterMatiere(formData: FormData) {
  const supabase = await clientAdmin();
  const filiereId = texte(formData, "filiere_id");
  // Plusieurs matières peuvent être saisies, une par ligne
  const noms = texte(formData, "noms")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const { error } = await supabase.from("matieres").upsert(
    noms.map((nom) => ({ filiere_id: filiereId, niveau: texte(formData, "niveau"), nom })),
    { onConflict: "filiere_id,niveau,nom", ignoreDuplicates: true },
  );
  verifier(error);
  revalidatePath("/", "layout");
}

export async function renommerMatiere(formData: FormData) {
  const supabase = await clientAdmin();
  const { error } = await supabase
    .from("matieres")
    .update({ nom: texte(formData, "nom") })
    .eq("id", texte(formData, "id"));
  verifier(error);
  revalidatePath("/", "layout");
}

export async function supprimerMatiere(formData: FormData) {
  const supabase = await clientAdmin();
  const id = texte(formData, "id");
  // Supprime aussi les PDF de la matière dans le stockage
  const { data: ressources } = await supabase.from("ressources").select("fichier_path").eq("matiere_id", id);
  if (ressources?.length) {
    await supabase.storage.from("ressources").remove(ressources.map((r) => r.fichier_path));
  }
  const { error } = await supabase.from("matieres").delete().eq("id", id);
  verifier(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------
// Ressources (le PDF est déjà envoyé dans le stockage par le navigateur)
// ---------------------------------------------------------------------
export async function creerRessource(donnees: {
  matiere_id: string;
  titre: string;
  type: TypeRessource;
  annee: number | null;
  description: string | null;
  fichier_path: string;
  fichier_taille: number;
}): Promise<ActionState> {
  const supabase = await clientAdmin();
  const { error } = await supabase.from("ressources").insert(donnees);
  if (error) {
    await supabase.storage.from("ressources").remove([donnees.fichier_path]);
    return { error: "Enregistrement impossible : " + error.message };
  }
  revalidatePath("/", "layout");
  return { message: `« ${donnees.titre} » a été ajouté.` };
}

export async function modifierRessource(formData: FormData) {
  const supabase = await clientAdmin();
  const annee = Number(formData.get("annee")) || null;
  const { error } = await supabase
    .from("ressources")
    .update({
      titre: texte(formData, "titre"),
      type: texte(formData, "type"),
      annee,
      description: texteOuNull(formData, "description"),
    })
    .eq("id", texte(formData, "id"));
  verifier(error);
  revalidatePath("/", "layout");
}

export async function supprimerRessource(formData: FormData) {
  const supabase = await clientAdmin();
  const id = texte(formData, "id");
  const { data } = await supabase.from("ressources").select("fichier_path").eq("id", id).single();
  if (data) await supabase.storage.from("ressources").remove([data.fichier_path]);
  const { error } = await supabase.from("ressources").delete().eq("id", id);
  verifier(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------
// Communiqués
// ---------------------------------------------------------------------
export async function enregistrerCommunique(
  id: string | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const supabase = await createClient();

  const titre = texte(formData, "titre");
  const contenu = texte(formData, "contenu");
  if (!titre || !contenu) return { error: "Le titre et le contenu sont obligatoires." };

  const donnees: Record<string, unknown> = {
    titre,
    contenu,
    epingle: formData.get("epingle") === "on",
  };

  const ancienneImage = texte(formData, "ancienne_image") || null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) return { error: "L'image ne doit pas dépasser 5 Mo." };
    const path = `${Date.now()}-${nomFichierSur(image.name)}`;
    const { error } = await supabase.storage
      .from("communiques")
      .upload(path, image, { contentType: image.type });
    if (error) return { error: "Envoi de l'image impossible : " + error.message };
    donnees.image_path = path;
    if (ancienneImage) await supabase.storage.from("communiques").remove([ancienneImage]);
  } else if (formData.get("retirer_image") === "on" && ancienneImage) {
    await supabase.storage.from("communiques").remove([ancienneImage]);
    donnees.image_path = null;
  }

  const { error } = id
    ? await supabase.from("communiques").update(donnees).eq("id", id)
    : await supabase.from("communiques").insert({ ...donnees, auteur_id: session.user.id });
  if (error) return { error: "Enregistrement impossible : " + error.message };

  revalidatePath("/", "layout");
  redirect("/admin/communiques");
}

export async function supprimerCommunique(formData: FormData) {
  const supabase = await clientAdmin();
  const id = texte(formData, "id");
  const { data } = await supabase.from("communiques").select("image_path").eq("id", id).single();
  if (data?.image_path) await supabase.storage.from("communiques").remove([data.image_path]);
  const { error } = await supabase.from("communiques").delete().eq("id", id);
  verifier(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------
// Administrateurs
// ---------------------------------------------------------------------
export async function changerRole(formData: FormData) {
  const session = await requireAdmin();
  const id = texte(formData, "id");
  if (id === session.user.id) throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: texte(formData, "role") === "admin" ? "admin" : "etudiant" })
    .eq("id", id);
  verifier(error);
  revalidatePath("/admin/utilisateurs");
}
