-- =====================================================================
-- Profil enrichi : filière, niveau, présentation et photo de profil
-- À exécuter une seule fois dans Supabase (SQL Editor), après schema.sql
-- =====================================================================

alter table public.profiles
  add column filiere_id uuid references public.filieres (id) on delete set null,
  add column niveau text check (niveau ~ '^(L[1-3]|M[1-2])$'),
  add column bio text check (char_length(bio) <= 300),
  add column avatar_path text;

-- Le profil reprend les informations saisies à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  donnees jsonb := new.raw_user_meta_data;
  filiere uuid := (select id from public.filieres where id::text = donnees ->> 'filiere_id');
begin
  insert into public.profiles (id, nom, filiere_id, niveau)
  values (
    new.id,
    coalesce(donnees ->> 'nom', split_part(new.email, '@', 1)),
    filiere,
    -- Le niveau n'est gardé que s'il existe dans la filière choisie
    (select donnees ->> 'niveau' from public.filieres
     where id = filiere and (donnees ->> 'niveau') = any (niveaux))
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Photos de profil : chacun gère les fichiers de son propre dossier
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Chacun envoie sa photo" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Chacun modifie sa photo" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Chacun supprime sa photo" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
