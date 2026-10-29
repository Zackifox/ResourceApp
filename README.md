# Plateforme pédagogique UET-UCAO

Ressources pédagogiques (cours, sujets, TD, corrigés en PDF) pour les étudiants de l'UCAO-UUT, organisées par **Institut → Filière → Niveau → Matière**, avec un espace **Communiqués** (likes et commentaires) et une **Messagerie** (salons par filière et messages privés, en temps réel).

- **Site** : Next.js 16 (React, TypeScript, Tailwind CSS)
- **Base de données, fichiers, comptes** : Supabase (offre gratuite, sans carte bancaire)
- **Hébergement** : Vercel (gratuit)

## Fonctionnalités

| Public (sans compte) | Étudiant connecté | Administrateur |
|---|---|---|
| Parcourir et télécharger les PDF | Aimer les communiqués | Gérer instituts, filières, matières |
| Rechercher | Commenter | Publier / supprimer des PDF |
| Lire les communiqués | Supprimer ses commentaires | Publier des communiqués, modérer |
| | Discuter dans les salons | Supprimer des messages dans les salons |
| | Envoyer des messages privés | Nommer d'autres administrateurs |
| | Modifier son profil et sa photo | |

---

## 1. Créer le projet Supabase

1. Créez un compte sur https://supabase.com puis **New project** (région conseillée : `West EU (Paris)` ou `Frankfurt`).
2. Dans **SQL Editor > New query**, collez et exécutez le contenu de [`supabase/schema.sql`](supabase/schema.sql).
3. Dans une nouvelle requête, exécutez [`supabase/seed.sql`](supabase/seed.sql) (les 4 instituts et leurs filières).
4. Dans une nouvelle requête, exécutez [`supabase/messagerie.sql`](supabase/messagerie.sql) (salons et messages privés), puis [`supabase/profil.sql`](supabase/profil.sql) (parcours et photo de profil).
5. Dans **Authentication > URL Configuration** :
   - **Site URL** : `http://localhost:3000` (puis l'adresse Vercel une fois en ligne)
   - **Redirect URLs** : ajoutez `http://localhost:3000/auth/callback` et `https://VOTRE-SITE.vercel.app/auth/callback`

## 2. Lancer le site sur votre ordinateur

```bash
cd web
cp .env.example .env.local   # puis remplir les 2 valeurs
npm install
npm run dev
```

Les valeurs se trouvent dans Supabase : **Project Settings > API Keys** (« Publishable key ») et **Project Settings > Data API** (« Project URL »).

Ouvrez http://localhost:3000.

## 3. Créer le premier administrateur

1. Inscrivez-vous sur le site (`/inscription`) et confirmez votre e-mail.
2. Dans Supabase, **SQL Editor**, exécutez (avec votre e-mail) :

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'votre@email.com');
```

3. Reconnectez-vous : le bouton **Administration** apparaît. Les administrateurs suivants peuvent être nommés depuis **Administration > Utilisateurs**.

## 4. Ajouter du contenu

1. **Administration > Instituts & filières** : ouvrez une filière et ajoutez les matières de chaque niveau (une par ligne).
2. **Administration > Ressources PDF > Ajouter un PDF** : choisissez institut, filière, niveau, matière, puis le fichier (50 Mo max).
3. **Administration > Communiqués** : publiez les informations (image facultative, épinglage possible).

## 5. Mettre en ligne (Vercel)

1. Publiez le dossier `web` sur GitHub.
2. Sur https://vercel.com, **Add New > Project**, importez le dépôt.
3. Ajoutez les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Déployez, puis mettez à jour la **Site URL** et les **Redirect URLs** dans Supabase.

## Limites de l'offre gratuite Supabase

- 500 Mo de base de données, **1 Go de fichiers** (≈ 300 à 1000 PDF selon leur taille), 5 Go de bande passante / mois.
- Un projet gratuit inactif pendant 7 jours est mis en pause (il se réactive depuis le tableau de bord). Pour l'éviter, Vercel appelle chaque jour à 6 h (UTC) la route `/api/maintien`, qui fait une petite requête à la base (voir [`vercel.json`](vercel.json)). Facultatif : ajoutez sur Vercel une variable `CRON_SECRET` (texte aléatoire) pour que seul Vercel puisse appeler cette route.
- Astuce : compressez les PDF scannés (ex. https://www.ilovepdf.com/fr/compresser_pdf) avant de les publier.

## Structure du code

```
supabase/          schéma SQL + données de départ
src/app/           pages (accueil, instituts, filières, matières, recherche, communiqués, messagerie, admin)
src/app/actions/   actions serveur (connexion, likes, commentaires, messages)
src/app/admin/     espace administrateur et ses actions
src/components/    composants réutilisables
src/lib/           client Supabase, types, utilitaires
```
