-- ============================================================================
-- INITIALISATION DES DONNÉES DE RÉFÉRENCE (OBLIGATOIRES)
-- ============================================================================

-- 1. Départements / Services de l'entreprise
INSERT INTO departement (nom) VALUES 
('Informatique & R&D'),
('Ressources Humaines'),
('Finance & Comptabilité'),
('Marketing & Communication'),
('Commercial & Ventes');

-- 2. Profils / Métiers recherchés
INSERT INTO profil (nom) VALUES 
('Développeur Fullstack Java / React'),
('Développeur Frontend Vue.js'),
('Administrateur Systèmes & DevOps'),
('Chef de Projet RH'),
('Comptable Senior');

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

-- 9. Critères de Base
INSERT INTO critere (nom, idtypechamp) VALUES 
('Années d''expérience globale', (SELECT id FROM typechamp WHERE libelle = 'Nombre')),
('Diplôme le plus élevé', (SELECT id FROM typechamp WHERE libelle = 'Diplome')),
('Prétention salariale (Ar)', (SELECT id FROM typechamp WHERE libelle = 'Nombre')),
('Disponible immédiatement', (SELECT id FROM typechamp WHERE libelle = 'Booleen'));

-- 10. Exigences/Critères pour le profil "Développeur Fullstack Java / React"

-- Exige au moins 3 ans d'expérience (dans critereprofil)
INSERT INTO critereprofil (idprofil, idcritere, valeurdouble, estobligatoire) 
VALUES 
((SELECT id FROM profil WHERE nom = 'Développeur Fullstack Java / React'),
 (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
 3.00, TRUE);

-- Exige au minimum une Licence / Bac+3 (dans profildiplome)
INSERT INTO profildiplome (idprofil, iddiplome)
VALUES 
((SELECT id FROM profil WHERE nom = 'Développeur Fullstack Java / React'),
 (SELECT id FROM diplome WHERE nom = 'Licence / Bac+3'));