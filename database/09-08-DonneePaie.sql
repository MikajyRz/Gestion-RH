-- =============================================================================
-- DONNÉES INITIALES DU MODULE PAIE & RÉMUNÉRATION (DML)
-- Fichier: database/09-08-DonneePaie.sql
-- =============================================================================

-- 1) DONNÉES DES PARAMÈTRES DE COTISATION (CNaPS & OSTIE)
INSERT INTO parametre_cotisation (libelle, taux, plafond_salarial, date_effet) VALUES
('CNAPS_SALARIE', 1.00, 2800000.00, CURRENT_DATE),
('CNAPS_EMPLOYEUR', 13.00, 2800000.00, CURRENT_DATE),
('OSTIE_SALARIE', 1.00, NULL, CURRENT_DATE),
('OSTIE_EMPLOYEUR', 5.00, NULL, CURRENT_DATE)
ON CONFLICT (libelle) DO NOTHING;

-- 2) DONNÉES DES CATÉGORIES PERSONNELLES
INSERT INTO categorie_personnel (nom, description) VALUES
('Cadre Supérieur', 'Personnel de direction et cadre hors classe'),
('Cadre Moyen', 'Responsable de service / Ingénieur'),
('Agent d''Exécution', 'Employé technique ou administratif')
ON CONFLICT (nom) DO NOTHING;

-- 3) DONNÉES DES STATUTS DE BULLETIN DE PAIE
INSERT INTO statut_bulletin (code, libelle) VALUES
('BROUILLON', 'Brouillon en cours de calcul'),
('VALIDE', 'Validé par la Direction RH'),
('PAYE', 'Payé à l''employé')
ON CONFLICT (code) DO NOTHING;
