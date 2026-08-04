-- ============================================================================
-- INITIALISATION DES DONNÉES DE RÉFÉRENCE (OBLIGATOIRES)
-- ============================================================================

-- 1. Départements / Services de l'entreprise
INSERT INTO departement (nom) VALUES 
('Informatique & R&D'),
('Ressources Humaines'),
('Finance & Comptabilité'),
('Marketing & Communication'),
('Commercial & Ventes'),
('Sécurité & Logistique');

-- 2. Profils / Métiers recherchés
INSERT INTO profil (nom) VALUES 
('Développeur Fullstack Java / React'),
('Développeur Frontend Vue.js'),
('Administrateur Systèmes & DevOps'),
('Chef de Projet RH'),
('Comptable Senior'),
('Gardien / Agent de Sécurité');

-- 3. Types d'Annonces
INSERT INTO typeannonce (libelle) VALUES 
('Recrutement Externe'),
('Mobilité Interne'),
('Appel d''offres / Prestation');

-- 4. Types de Champs pour Formulaires Dynamiques
INSERT INTO typechamp (libelle) VALUES 
('Texte'),
('Nombre'),
('Booleen'),
('Diplome'),
('Date');

-- 5. Diplômes
INSERT INTO diplome (nom) VALUES 
('Aucun / Certificat de Sécurité'),
('Baccalauréat'),
('Licence / Bac+3'),
('Master / Bac+5'),
('Doctorat / Bac+8');

-- 6. Statuts des Candidats (Processus RH)
INSERT INTO statutcandidat (nom) VALUES 
('En attente'),
('Présélectionné'),
('QCM Envoyé'),
('QCM Terminé'),
('Entretien Planifié'),
('Offre Transmise'),
('Admis / Embauché'),
('Refusé');

-- 7. Statuts des Entretiens
INSERT INTO statutentretien (nom) VALUES 
('En cours'),
('Terminé'),
('Annulé');

-- 8. Types de Contrats
INSERT INTO types_contrat (code, libelle) VALUES 
('CDI', 'Contrat à Durée Indéterminée'),
('CDD', 'Contrat à Durée Déterminée'),
('STAGE', 'Stage Académique / Professionnel'),
('ALTERNANCE', 'Contrat d''Alternance'),
('FREELANCE', 'Prestation Indépendante');

-- 9. Critères de Base (Généraux + Spécifiques)
INSERT INTO critere (nom, id_type_champ) VALUES 
('Années d''expérience globale', (SELECT id FROM typechamp WHERE libelle = 'Nombre')),
('Diplôme le plus élevé', (SELECT id FROM typechamp WHERE libelle = 'Diplome')),
('Taille minimale (cm)', (SELECT id FROM typechamp WHERE libelle = 'Nombre')),
('Casier judiciaire vierge', (SELECT id FROM typechamp WHERE libelle = 'Booleen')),
('Travail de nuit accepté', (SELECT id FROM typechamp WHERE libelle = 'Booleen'));


-- ============================================================================
-- EXIGENCES / CRITÈRES PAR PROFIL MÉTIER
-- ============================================================================

-- Profil 1 : Développeur Fullstack Java / React
INSERT INTO critereprofil (id_profil, id_critere, valeur_double, est_obligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Développeur Fullstack Java / React'),
 (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
 3.00, TRUE);

INSERT INTO profildiplome (id_profil, id_diplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Développeur Fullstack Java / React'),
 (SELECT id FROM diplome WHERE nom = 'Licence / Bac+3'));

-- Profil 2 : Développeur Frontend Vue.js
INSERT INTO critereprofil (id_profil, id_critere, valeur_double, est_obligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Développeur Frontend Vue.js'),
 (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
 2.00, TRUE);

INSERT INTO profildiplome (id_profil, id_diplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Développeur Frontend Vue.js'),
 (SELECT id FROM diplome WHERE nom = 'Licence / Bac+3'));

-- Profil 3 : Administrateur Systèmes & DevOps
INSERT INTO critereprofil (id_profil, id_critere, valeur_double, est_obligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Administrateur Systèmes & DevOps'),
 (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
 4.00, TRUE);

INSERT INTO profildiplome (id_profil, id_diplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Administrateur Systèmes & DevOps'),
 (SELECT id FROM diplome WHERE nom = 'Master / Bac+5'));

-- Profil 4 : Chef de Projet RH
INSERT INTO critereprofil (id_profil, id_critere, valeur_double, est_obligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Chef de Projet RH'),
 (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
 3.00, TRUE);

INSERT INTO profildiplome (id_profil, id_diplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Chef de Projet RH'),
 (SELECT id FROM diplome WHERE nom = 'Master / Bac+5'));

-- Profil 5 : Comptable Senior
INSERT INTO critereprofil (id_profil, id_critere, valeur_double, est_obligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Comptable Senior'),
 (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
 5.00, TRUE);

INSERT INTO profildiplome (id_profil, id_diplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Comptable Senior'),
 (SELECT id FROM diplome WHERE nom = 'Licence / Bac+3')),
((SELECT id FROM profil WHERE nom = 'Comptable Senior'),
 (SELECT id FROM diplome WHERE nom = 'Master / Bac+5'));

-- Profil 6 : Gardien / Agent de Sécurité
INSERT INTO critereprofil (id_profil, id_critere, valeur_double, valeur_bool, est_obligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Gardien / Agent de Sécurité'), 
 (SELECT id FROM critere WHERE nom = 'Taille minimale (cm)'), 
 175.00, NULL, TRUE),
((SELECT id FROM profil WHERE nom = 'Gardien / Agent de Sécurité'), 
 (SELECT id FROM critere WHERE nom = 'Casier judiciaire vierge'), 
 NULL, TRUE, TRUE),
((SELECT id FROM profil WHERE nom = 'Gardien / Agent de Sécurité'), 
 (SELECT id FROM critere WHERE nom = 'Travail de nuit accepté'), 
 NULL, TRUE, TRUE);

INSERT INTO profildiplome (id_profil, id_diplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Gardien / Agent de Sécurité'),
 (SELECT id FROM diplome WHERE nom = 'Aucun / Certificat de Sécurité'));