-- =====================================================================
-- Plateforme pédagogique UET-UCAO — schéma de la base de données
-- À exécuter une seule fois dans Supabase : SQL Editor > New query
-- =====================================================================

-- ---------------------------------------------------------------------
-- Profils utilisateurs (étudiants et administrateurs) f7pcW7WEC6ht3pHF
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null default '',
  role text not null default 'etudiant' check (role in ('etudiant', 'admin')),
  created_at timestamptz not null default now()
);

-- Crée automatiquement le profil à l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nom)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nom', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Vrai si l'utilisateur connecté est administrateur
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Empêche un étudiant de se donner lui-même le rôle admin
-- (auth.uid() est nul dans le SQL Editor : on autorise alors la modification)
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Modification du rôle non autorisée';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_role();

-- ---------------------------------------------------------------------
-- Structure pédagogique : Institut > Filière > (Niveau) > Matière
-- ---------------------------------------------------------------------
create table public.instituts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sigle text not null,
  nom text not null,
  description text,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

create table public.filieres (
  id uuid primary key default gen_random_uuid(),
  institut_id uuid not null references public.instituts (id) on delete cascade,
  nom text not null,
  cycle text not null check (cycle in ('licence', 'master')),
  -- Niveaux proposés par la filière, ex. {L1,L2,L3} ou {M1,M2}
  niveaux text[] not null,
  description text,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

create table public.matieres (
  id uuid primary key default gen_random_uuid(),
  filiere_id uuid not null references public.filieres (id) on delete cascade,
  niveau text not null,
  nom text not null,
  created_at timestamptz not null default now(),
  unique (filiere_id, niveau, nom)
);

-- ---------------------------------------------------------------------
-- Ressources pédagogiques (PDF)
-- ---------------------------------------------------------------------
create table public.ressources (
  id uuid primary key default gen_random_uuid(),
  matiere_id uuid not null references public.matieres (id) on delete cascade,
  titre text not null,
  type text not null check (type in ('cours', 'sujet', 'td', 'corrige')),
  annee int check (annee between 1990 and 2100),
  description text,
  fichier_path text not null,
  fichier_taille bigint,
  telechargements int not null default 0,
  created_at timestamptz not null default now()
);

create index ressources_matiere_idx on public.ressources (matiere_id);
create index matieres_filiere_idx on public.matieres (filiere_id, niveau);
create index filieres_institut_idx on public.filieres (institut_id);

-- Incrémente le compteur de téléchargements (appelable par tous)
create function public.incrementer_telechargement(ressource_id uuid)
returns void
language sql
security definer set search_path = ''
as $$
  update public.ressources set telechargements = telechargements + 1 where id = ressource_id;
$$;

-- ---------------------------------------------------------------------
-- Communiqués, commentaires et likes
-- ---------------------------------------------------------------------
create table public.communiques (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  contenu text not null,
  image_path text,
  epingle boolean not null default false,
  auteur_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.commentaires (
  id uuid primary key default gen_random_uuid(),
  communique_id uuid not null references public.communiques (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  contenu text not null check (char_length(contenu) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.likes (
  communique_id uuid not null references public.communiques (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (communique_id, user_id)
);

create index commentaires_communique_idx on public.commentaires (communique_id, created_at);

-- ---------------------------------------------------------------------
-- Sécurité (Row Level Security)
-- Lecture publique ; écriture réservée aux admins, sauf commentaires/likes
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.instituts enable row level security;
alter table public.filieres enable row level security;
alter table public.matieres enable row level security;
alter table public.ressources enable row level security;
alter table public.communiques enable row level security;
alter table public.commentaires enable row level security;
alter table public.likes enable row level security;

create policy "Profils visibles par tous" on public.profiles for select using (true);
create policy "Chacun modifie son profil" on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Lecture publique" on public.instituts for select using (true);
create policy "Admin gère" on public.instituts for all using (public.is_admin()) with check (public.is_admin());

create policy "Lecture publique" on public.filieres for select using (true);
create policy "Admin gère" on public.filieres for all using (public.is_admin()) with check (public.is_admin());

create policy "Lecture publique" on public.matieres for select using (true);
create policy "Admin gère" on public.matieres for all using (public.is_admin()) with check (public.is_admin());

create policy "Lecture publique" on public.ressources for select using (true);
create policy "Admin gère" on public.ressources for all using (public.is_admin()) with check (public.is_admin());

create policy "Lecture publique" on public.communiques for select using (true);
create policy "Admin gère" on public.communiques for all using (public.is_admin()) with check (public.is_admin());

create policy "Lecture publique" on public.commentaires for select using (true);
create policy "Connecté commente" on public.commentaires for insert
  with check (auth.uid() = user_id);
create policy "Auteur ou admin supprime" on public.commentaires for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Lecture publique" on public.likes for select using (true);
create policy "Connecté like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Connecté retire son like" on public.likes for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Stockage des fichiers : PDF des ressources et images des communiqués
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('ressources', 'ressources', true, 52428800, array['application/pdf']),
  ('communiques', 'communiques', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admin envoie des fichiers" on storage.objects for insert
  with check (bucket_id in ('ressources', 'communiques') and public.is_admin());
create policy "Admin modifie des fichiers" on storage.objects for update
  using (bucket_id in ('ressources', 'communiques') and public.is_admin());
create policy "Admin supprime des fichiers" on storage.objects for delete
  using (bucket_id in ('ressources', 'communiques') and public.is_admin());
