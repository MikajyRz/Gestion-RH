-- ============================================================================
-- INITIALISATION DES DONNÉES DE RÉFÉRENCE - MODULE CONGÉS
-- ============================================================================

-- 1. Statuts des demandes de congés (Validation simple par RH)
INSERT INTO statut_demande_conge (code, libelle) VALUES
('EN_ATTENTE', 'En attente de validation RH'),
('APPROUVE', 'Approuvé par RH'),
('REFUSE', 'Refusé par RH'),
('ANNULE', 'Annulé');

-- 2. Types de congés standards
INSERT INTO type_conge (libelle, est_remunere, description) VALUES
('Congé Payé Annuel', TRUE, 'Congé légal rémunéré (2.5 jours ouvrables par mois effectif)'),
('Congé Maladie', TRUE, 'Absence pour raison de santé (soumis à certificat médical)'),
('Congé Sans Solde', FALSE, 'Absence autorisée non rémunérée'),
('Congé Maternité / Paternité', TRUE, 'Congé lié à la naissance ou adoption d''un enfant'),
('Événement Familial', TRUE, 'Mariage, naissance, décès ou événement familial légal');

-- 3. Jours fériés officiels de l'année (Exemples)
INSERT INTO jour_ferie (libelle, date_ferie) VALUES
('Jour de l''An', '2026-01-01'),
('Fête du Travail', '2026-05-01'),
('Fête Nationale / Indépendance', '2026-06-26'),
('Assomption', '2026-08-15'),
('Toussaint', '2026-11-01'),
('Noël', '2026-12-25');
