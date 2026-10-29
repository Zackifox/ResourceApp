-- =====================================================================
-- Messagerie : salons de groupe et messages privés
-- À exécuter une seule fois dans Supabase (SQL Editor), après schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Salons : un salon général + un salon par filière
-- ---------------------------------------------------------------------
create table public.salons (
  id uuid primary key default gen_random_uuid(),
  -- Nul pour le salon général ; sinon le salon porte le nom de la filière
  filiere_id uuid unique references public.filieres (id) on delete cascade,
  nom text not null default '',
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

create table public.messages_salon (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  contenu text not null check (char_length(contenu) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_salon_idx on public.messages_salon (salon_id, created_at);

-- Crée le salon d'une filière dès qu'elle est ajoutée
create function public.creer_salon_filiere()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.salons (filiere_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger filieres_creer_salon
  after insert on public.filieres
  for each row execute function public.creer_salon_filiere();

-- Salon général et salons des filières déjà existantes
insert into public.salons (nom, ordre) values ('Général', -1);
insert into public.salons (filiere_id) select id from public.filieres on conflict do nothing;

-- ---------------------------------------------------------------------
-- Messages privés : conversations à deux
-- ---------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  -- user1 < user2 : une seule conversation par paire
  user1 uuid not null references public.profiles (id) on delete cascade,
  user2 uuid not null references public.profiles (id) on delete cascade,
  dernier_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (user1 < user2),
  unique (user1, user2)
);

create table public.messages_prives (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  contenu text not null check (char_length(contenu) between 1 and 2000),
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_prives_idx on public.messages_prives (conversation_id, created_at);
create index conversations_user2_idx on public.conversations (user2);

-- Vrai si l'utilisateur connecté participe à la conversation
create function public.participe(conv_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.conversations
    where id = conv_id and auth.uid() in (user1, user2)
  );
$$;

-- Ouvre (ou retrouve) la conversation avec un autre utilisateur
create function public.ouvrir_conversation(autre uuid)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  moi uuid := auth.uid();
  conv uuid;
begin
  if moi is null or autre is null or moi = autre then
    raise exception 'Conversation impossible';
  end if;
  insert into public.conversations (user1, user2)
  values (least(moi, autre), greatest(moi, autre))
  on conflict (user1, user2) do nothing;
  select id into conv from public.conversations
  where user1 = least(moi, autre) and user2 = greatest(moi, autre);
  return conv;
end;
$$;

-- Marque comme lus les messages reçus dans une conversation
create function public.marquer_conversation_lue(conv_id uuid)
returns void
language sql
security definer set search_path = ''
as $$
  update public.messages_prives set lu = true
  where conversation_id = conv_id and user_id <> auth.uid() and not lu
    and public.participe(conv_id);
$$;

-- Fait remonter la conversation en tête de liste à chaque message
create function public.maj_dernier_message()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.conversations set dernier_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_prives_maj_conversation
  after insert on public.messages_prives
  for each row execute function public.maj_dernier_message();

-- ---------------------------------------------------------------------
-- Sécurité : messagerie réservée aux utilisateurs connectés
-- ---------------------------------------------------------------------
alter table public.salons enable row level security;
alter table public.messages_salon enable row level security;
alter table public.conversations enable row level security;
alter table public.messages_prives enable row level security;

create policy "Lecture publique" on public.salons for select using (true);
create policy "Admin gère" on public.salons for all using (public.is_admin()) with check (public.is_admin());

create policy "Connecté lit" on public.messages_salon for select using (auth.uid() is not null);
create policy "Connecté écrit" on public.messages_salon for insert with check (auth.uid() = user_id);
create policy "Auteur ou admin supprime" on public.messages_salon for delete
  using (auth.uid() = user_id or public.is_admin());

-- Les administrateurs ne lisent pas les messages privés
create policy "Participants lisent" on public.conversations for select
  using (auth.uid() in (user1, user2));

create policy "Participants lisent" on public.messages_prives for select
  using (public.participe(conversation_id));
create policy "Participant écrit" on public.messages_prives for insert
  with check (auth.uid() = user_id and public.participe(conversation_id));
create policy "Auteur supprime" on public.messages_prives for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Temps réel : les nouveaux messages s'affichent sans recharger la page
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.messages_salon, public.messages_prives;
