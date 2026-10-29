export type Role = "etudiant" | "admin";
export type Cycle = "licence" | "master";
export type TypeRessource = "cours" | "sujet" | "td" | "corrige";

export type Profile = {
  id: string;
  nom: string;
  role: Role;
  created_at: string;
};

export type Institut = {
  id: string;
  slug: string;
  sigle: string;
  nom: string;
  description: string | null;
  ordre: number;
};

export type Filiere = {
  id: string;
  institut_id: string;
  nom: string;
  cycle: Cycle;
  niveaux: string[];
  description: string | null;
  ordre: number;
};

export type Matiere = {
  id: string;
  filiere_id: string;
  niveau: string;
  nom: string;
};

export type Ressource = {
  id: string;
  matiere_id: string;
  titre: string;
  type: TypeRessource;
  annee: number | null;
  description: string | null;
  fichier_path: string;
  fichier_taille: number | null;
  telechargements: number;
  created_at: string;
};

export type Communique = {
  id: string;
  titre: string;
  contenu: string;
  image_path: string | null;
  epingle: boolean;
  auteur_id: string | null;
  created_at: string;
};

export type Commentaire = {
  id: string;
  communique_id: string;
  user_id: string;
  contenu: string;
  created_at: string;
};

export type ActionState = { error?: string; message?: string } | undefined;
