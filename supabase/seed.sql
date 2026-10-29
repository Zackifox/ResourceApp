-- =====================================================================
-- Données de départ : instituts et filières de l'UCAO-UUT
-- À exécuter après schema.sql (SQL Editor > New query)
-- =====================================================================

insert into public.instituts (slug, sigle, nom, description, ordre) values
  ('issj', 'ISSJ', 'Institut Supérieur des Sciences Juridiques',
   'Créé en 2010, l''ISSJ offre une formation de qualité dans le domaine des sciences juridiques, politiques et de l''administration. Il propose des parcours en droit public et en droit privé, en vue de l''obtention du diplôme de licence ou de master dans diverses spécialités.', 1),
  ('esi-dgi', 'ESI – DGI', 'École Supérieure d''Ingénieurs – Département de Génie Informatique',
   'L''École Supérieure d''Ingénieurs (ESI) est créée en 2024. Le Département de Génie Informatique (DGI) remplace l''ISTIN, créé en 2007. Sa mission est de former des diplômés en Licence et en Ingénierie avec équivalence Master Recherche, dans le respect des normes CAMES et de la Commission des Titres d''Ingénieur (CTI).', 2),
  ('iseg', 'ISEG', 'Institut des Sciences Économiques et de Gestion',
   'L''ISEG offre une licence en Économie ou en Gestion orientée vers le Master. Il forme des diplômés dotés d''une polyvalence dans le domaine de l''économie et de la gestion des secteurs public et privé.', 3),
  ('imetic', 'IMETIC', 'Institut des Médias et des Technologies de l''Information et de la Communication',
   'Créé en 2017, l''IMETIC propose les parcours Licence et Master en Information et Communication. Les deux premières années de Licence forment un tronc commun communication-numérique.', 4);

-- Fonction utilitaire temporaire pour insérer les filières
create function pg_temp.ajouter_filieres(p_slug text, p_cycle text, p_niveaux text[], p_noms text[], p_description text default null)
returns void language plpgsql as $$
declare
  i int;
begin
  for i in 1 .. array_length(p_noms, 1) loop
    insert into public.filieres (institut_id, nom, cycle, niveaux, description, ordre)
    select id, p_noms[i], p_cycle, p_niveaux, p_description, i from public.instituts where slug = p_slug;
  end loop;
end;
$$;

-- ISSJ
select pg_temp.ajouter_filieres('issj', 'licence', '{L1,L2,L3}', array['Droit privé', 'Droit public']);
select pg_temp.ajouter_filieres('issj', 'master', '{M1,M2}', array[
  'Droit et Fiscalité de l''Entreprise',
  'Droit Maritime et Activités Portuaires',
  'Droit Bancaire, Financier et des Assurances',
  'Droit de la Propriété Intellectuelle et du Numérique'
], 'Master de droit privé');
select pg_temp.ajouter_filieres('issj', 'master', '{M1,M2}', array[
  'Droit des Collectivités Territoriales et Management Public',
  'Droit des Marchés Publics et Partenariat Public-Privé',
  'Droit International et Diplomatie'
], 'Master de droit public');

-- ESI – DGI
select pg_temp.ajouter_filieres('esi-dgi', 'licence', '{L1,L2,L3}', array[
  'Développement d''Applications',
  'Mathématiques et Informatique',
  'Réseaux Informatiques et Télécommunication',
  'Cybersécurité',
  'Big Data'
]);
select pg_temp.ajouter_filieres('esi-dgi', 'master', '{M1,M2}', array[
  'Big Data',
  'Cyber Sécurité',
  'Intelligence Artificielle',
  'Génie Logiciel'
]);

-- ISEG
select pg_temp.ajouter_filieres('iseg', 'licence', '{L1,L2,L3}', array[
  'Économie Appliquée',
  'Finance Contrôle Comptabilité (FCC)',
  'Communication et Marketing Digital (CMD)',
  'Ressources Humaines (RH)'
]);
select pg_temp.ajouter_filieres('iseg', 'master', '{M1,M2}', array[
  'Économie de l''Environnement et du Développement Local (EEDL)',
  'Macroéconomie Financière et Développement Durable (MFDD)',
  'Comptabilité Contrôle Audit (CCA)',
  'Banque Finance (BF)',
  'Management des Entreprises (MDE)',
  'Marketing et Commerce (MC)'
]);

-- IMETIC : tronc commun en L1-L2, puis spécialisation en L3
select pg_temp.ajouter_filieres('imetic', 'licence', '{L1,L2}', array['Tronc commun Communication Numérique'],
  'Bloc commun des deux premières années de Licence');
select pg_temp.ajouter_filieres('imetic', 'licence', '{L3}', array[
  'Communication Digitale et Marketing des Médias',
  'Communication Institutionnelle et Relations Publiques',
  'Journalisme Multimédia et Production Audiovisuelle'
]);
select pg_temp.ajouter_filieres('imetic', 'master', '{M1,M2}', array[
  'Communication Publique et Politique',
  'Communication, IA et Innovations Numériques',
  'Médias Numériques, Production Créative et Industries Culturelles'
]);
